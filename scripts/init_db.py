#!/usr/bin/env python3
"""Initialize the database with schema and test user."""

import os
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.base import Base
from models import User


def get_database_url():
    """Get database URL from environment or default."""
    return os.getenv("DATABASE_URL", "sqlite:///./geetanjali.db")


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
    """Initialize database with schema and test user."""
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
        # Create test user
        print("👤 Creating test user...")
        create_test_user(session)
        print()

        print("✅ Database initialization complete!")
        print()
        print("Next steps:")
        print("  1. Run verse ingestion: POST /api/v1/admin/ingest")
        print("  2. Start backend: uvicorn main:app --reload")
        print("  3. View API docs: http://localhost:8000/docs")
        print("  4. Test user credentials:")
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
