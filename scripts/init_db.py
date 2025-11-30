#!/usr/bin/env python3
"""Initialize the database with schema and seed data."""

import os
import sys
import json
from pathlib import Path
from datetime import datetime

# Add backend to path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.base import Base
from models import User, Verse


def get_database_url():
    """Get database URL from environment or default."""
    return os.getenv("DATABASE_URL", "sqlite:///./geetanjali.db")


def load_seed_verses(session):
    """Load seed verses from JSON file."""
    seed_file = Path(__file__).parent.parent / "data" / "verses" / "seed-verses.json"

    if not seed_file.exists():
        print(f"⚠️  Seed file not found: {seed_file}")
        return 0

    with open(seed_file, "r") as f:
        verses_data = json.load(f)

    count = 0
    for verse_data in verses_data:
        # Check if verse already exists
        existing = session.query(Verse).filter_by(
            canonical_id=verse_data["canonical_id"]
        ).first()

        if existing:
            print(f"  Skipping {verse_data['canonical_id']} (already exists)")
            continue

        # Create verse
        verse = Verse(
            canonical_id=verse_data["canonical_id"],
            chapter=verse_data["chapter"],
            verse=verse_data["verse"],
            sanskrit_iast=verse_data["sanskrit"]["iast"],
            paraphrase_en=verse_data["paraphrase"]["en"],
            consulting_principles=verse_data["consulting_principles"],
            source=verse_data["sanskrit"]["source"],
            license=verse_data["sanskrit"]["license"],
        )

        session.add(verse)
        count += 1
        print(f"  ✅ Loaded {verse_data['canonical_id']}")

    session.commit()
    return count


def create_test_user(session):
    """Create a test user for development."""
    test_email = "dev@geetanjali.local"

    existing = session.query(User).filter_by(email=test_email).first()
    if existing:
        print(f"  Test user already exists: {test_email}")
        return existing

    user = User(
        email=test_email,
        name="Dev User",
        role="Developer",
        org_id="geetanjali-dev",
        api_key="dev-api-key-12345",
    )

    session.add(user)
    session.commit()
    print(f"  ✅ Created test user: {test_email}")
    return user


def init_database():
    """Initialize database with schema and seed data."""
    print("🚀 Initializing Geetanjali database...")
    print()

    # Get database URL
    db_url = get_database_url()
    print(f"📍 Database: {db_url}")
    print()

    # Create engine
    engine = create_engine(db_url, echo=False)

    # Create all tables
    print("📊 Creating database schema...")
    Base.metadata.create_all(engine)
    print("  ✅ Schema created")
    print()

    # Create session
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        # Load seed verses
        print("📖 Loading seed verses...")
        verse_count = load_seed_verses(session)
        print(f"  ✅ Loaded {verse_count} verses")
        print()

        # Create test user
        print("👤 Creating test user...")
        create_test_user(session)
        print()

        print("✅ Database initialization complete!")
        print()
        print("Next steps:")
        print("  1. Start backend: uvicorn main:app --reload")
        print("  2. View API docs: http://localhost:8000/docs")
        print("  3. Test user credentials:")
        print("     Email: dev@geetanjali.local")
        print("     API Key: dev-api-key-12345")

    except Exception as e:
        session.rollback()
        print(f"❌ Error during initialization: {e}")
        raise
    finally:
        session.close()


if __name__ == "__main__":
    init_database()
