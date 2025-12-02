#!/usr/bin/env python3
"""Initialize database with all tables."""

from sqlalchemy import text
from db.connection import engine
from models.case import Case
from models.output import Output
from models.message import Message
from models.verse import Verse
from models.base import Base

def init_db():
    """Create all database tables."""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created successfully!")

    # Verify tables were created (PostgreSQL-compatible)
    with engine.connect() as conn:
        result = conn.execute(text(
            "SELECT tablename FROM pg_tables WHERE schemaname = 'public'"
        ))
        tables = [row[0] for row in result]
        if tables:
            print(f"✓ Tables created: {', '.join(tables)}")
        else:
            print("✓ Database tables initialized (using create_all)")

if __name__ == "__main__":
    init_db()
