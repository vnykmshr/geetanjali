"""Data module for static curated content."""

from data.featured_verses import (
    FEATURED_VERSES,
    FEATURED_VERSE_COUNT,
    get_featured_verse_ids,
    is_featured,
)

__all__ = [
    "FEATURED_VERSES",
    "FEATURED_VERSE_COUNT",
    "get_featured_verse_ids",
    "is_featured",
]
