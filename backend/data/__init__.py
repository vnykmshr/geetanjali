"""Data module for static curated content."""

from data.featured_verses import (
    FEATURED_VERSES,
    FEATURED_VERSE_COUNT,
    get_featured_verse_ids,
    is_featured,
)
from data.chapter_metadata import (
    BOOK_METADATA,
    CHAPTER_METADATA,
    get_book_metadata,
    get_chapter_metadata,
    get_all_chapter_metadata,
)

__all__ = [
    # Featured verses
    "FEATURED_VERSES",
    "FEATURED_VERSE_COUNT",
    "get_featured_verse_ids",
    "is_featured",
    # Chapter metadata
    "BOOK_METADATA",
    "CHAPTER_METADATA",
    "get_book_metadata",
    "get_chapter_metadata",
    "get_all_chapter_metadata",
]
