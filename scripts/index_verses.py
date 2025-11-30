#!/usr/bin/env python3
"""Index verses into ChromaDB vector store."""

import os
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.verse import Verse
from services.vector_store import get_vector_store
from config import settings


def index_all_verses():
    """Index all verses from database into ChromaDB."""
    print("🔍 Indexing verses into ChromaDB...")
    print()

    # Connect to database
    engine = create_engine(settings.DATABASE_URL, echo=False)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    try:
        # Get all verses from database
        verses = db.query(Verse).all()
        print(f"📖 Found {len(verses)} verses in database")

        if len(verses) == 0:
            print("⚠️  No verses found. Run scripts/init_db.py first.")
            return

        # Get vector store
        vector_store = get_vector_store()

        # Check if already indexed
        existing_count = vector_store.count()
        if existing_count > 0:
            print(f"⚠️  Vector store already has {existing_count} verses")
            response = input("Reset and re-index? (y/n): ")
            if response.lower() == 'y':
                vector_store.reset()
                print("✅ Vector store reset")
            else:
                print("❌ Indexing cancelled")
                return

        print()
        print("🚀 Starting indexing...")

        # Prepare data for batch indexing
        canonical_ids = []
        texts = []
        metadatas = []

        for verse in verses:
            # Combine Sanskrit and paraphrase for embedding
            text_parts = []
            if verse.sanskrit_iast:
                text_parts.append(verse.sanskrit_iast)
            if verse.paraphrase_en:
                text_parts.append(verse.paraphrase_en)

            text = " ".join(text_parts)

            # Metadata
            metadata = {
                "canonical_id": verse.canonical_id,
                "chapter": verse.chapter,
                "verse": verse.verse,
                "paraphrase": verse.paraphrase_en or "",
                "principles": ",".join(verse.consulting_principles or []),
                "source": verse.source or "",
                "license": verse.license or ""
            }

            canonical_ids.append(verse.canonical_id)
            texts.append(text)
            metadatas.append(metadata)

            print(f"  📝 Prepared {verse.canonical_id}")

        # Batch index
        print()
        print("💾 Indexing to ChromaDB...")
        vector_store.add_verses_batch(canonical_ids, texts, metadatas)

        # Verify
        final_count = vector_store.count()
        print()
        print(f"✅ Indexing complete! {final_count} verses in vector store")

        # Test a sample search
        print()
        print("🔍 Testing search with sample query...")
        results = vector_store.search("ethical decision making in leadership", top_k=3)

        print(f"  Top 3 results for 'ethical decision making in leadership':")
        for i, (verse_id, distance) in enumerate(zip(results["ids"], results["distances"]), 1):
            metadata = results["metadatas"][i-1]
            print(f"    {i}. {verse_id} (distance: {distance:.4f})")
            print(f"       {metadata.get('paraphrase', 'N/A')}")

        print()
        print("🎉 All done!")

    except Exception as e:
        print(f"❌ Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    index_all_verses()
