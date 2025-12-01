"""
JSON Parser for extracting Bhagavad Gita verses from structured JSON sources.
"""

import json
import logging
from typing import Dict, List

logger = logging.getLogger(__name__)


class JSONParser:
    """
    Parse JSON sources to extract verse data.

    Supports different JSON schema formats from various sources.
    """

    def __init__(self):
        """Initialize JSON parser."""
        logger.info("JSONParser initialized")

    def parse(self, json_str: str, source_config: Dict) -> List[Dict]:
        """
        Parse JSON content based on source configuration.

        Args:
            json_str: Raw JSON string
            source_config: Source configuration dict with metadata

        Returns:
            List of parsed verse dictionaries

        Raises:
            ValueError: If JSON is invalid or format unknown
        """
        try:
            data = json.loads(json_str)
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON: {e}")
            raise ValueError(f"Invalid JSON format: {e}")

        # Determine JSON schema based on structure
        if isinstance(data, list):
            return self._parse_verse_array(data, source_config)
        elif isinstance(data, dict):
            if "verses" in data:
                return self._parse_verse_array(data["verses"], source_config)
            elif "chapters" in data:
                return self._parse_chapters_format(data["chapters"], source_config)
            else:
                # Try to parse as single verse
                verse = self._parse_single_verse(data, source_config)
                return [verse] if verse else []
        else:
            logger.warning(f"Unknown JSON structure for source: {source_config.get('name')}")
            return []

    def _parse_verse_array(self, verses: List, source_config: Dict) -> List[Dict]:
        """
        Parse array of verse objects.

        Args:
            verses: List of verse dictionaries
            source_config: Source configuration

        Returns:
            List of standardized verse dictionaries
        """
        parsed_verses = []

        for verse_data in verses:
            verse = self._parse_single_verse(verse_data, source_config)
            if verse:
                parsed_verses.append(verse)

        logger.info(f"Parsed {len(parsed_verses)} verses from array")
        return parsed_verses

    def _parse_chapters_format(self, chapters: List, source_config: Dict) -> List[Dict]:
        """
        Parse nested chapter/verse structure.

        Format: {"chapters": [{"chapter": 1, "verses": [...]}, ...]}

        Args:
            chapters: List of chapter dictionaries
            source_config: Source configuration

        Returns:
            List of standardized verse dictionaries
        """
        all_verses = []

        for chapter_data in chapters:
            chapter_num = chapter_data.get("chapter") or chapter_data.get("chapter_number")
            verses = chapter_data.get("verses", [])

            for verse_data in verses:
                # Inject chapter number if not present
                if "chapter" not in verse_data:
                    verse_data["chapter"] = chapter_num

                verse = self._parse_single_verse(verse_data, source_config)
                if verse:
                    all_verses.append(verse)

        logger.info(f"Parsed {len(all_verses)} verses from chapters format")
        return all_verses

    def _parse_single_verse(self, verse_data: Dict, source_config: Dict) -> Dict:
        """
        Parse a single verse dictionary and standardize fields.

        Args:
            verse_data: Verse dictionary from JSON
            source_config: Source configuration

        Returns:
            Standardized verse dictionary or None if invalid
        """
        # Extract chapter and verse numbers (required)
        chapter = self._extract_number(verse_data, ["chapter", "chapter_number", "adhyaya"])
        verse_num = self._extract_number(verse_data, ["verse", "verse_number", "shloka", "sloka"])

        if not chapter or not verse_num:
            logger.warning(f"Missing chapter/verse number in: {verse_data}")
            return None

        # Build canonical ID
        canonical_id = verse_data.get("canonical_id") or f"BG_{chapter}_{verse_num}"

        # Extract text fields (flexible field names)
        sanskrit_devanagari = self._extract_text(verse_data, [
            "sanskrit_devanagari", "sanskrit", "devanagari", "text_sanskrit"
        ])

        sanskrit_iast = self._extract_text(verse_data, [
            "sanskrit_iast", "iast", "transliteration", "romanized"
        ])

        translation = self._extract_text(verse_data, [
            "translation", "translation_text", "english", "meaning", "text_english"
        ])

        paraphrase = self._extract_text(verse_data, [
            "paraphrase", "paraphrase_en", "summary", "brief"
        ])

        # Extract metadata
        consulting_principles = verse_data.get("consulting_principles") or verse_data.get("principles")

        # Build standardized verse dict
        verse = {
            "canonical_id": canonical_id,
            "chapter": chapter,
            "verse": verse_num,
            "sanskrit_devanagari": sanskrit_devanagari,
            "sanskrit_iast": sanskrit_iast,
            "translation_text": translation,
            "paraphrase_en": paraphrase,
            "consulting_principles": consulting_principles,
            "source": source_config.get("url") or source_config.get("source", ""),
            "license": source_config.get("license", ""),
            "translator": source_config.get("translator", ""),
            "year": source_config.get("year"),
        }

        return verse

    def _extract_number(self, data: Dict, field_names: List[str]) -> int:
        """
        Extract numeric value from dict trying multiple field names.

        Args:
            data: Dictionary to search
            field_names: List of possible field names

        Returns:
            Integer value or None
        """
        for field in field_names:
            value = data.get(field)
            if value is not None:
                try:
                    return int(value)
                except (ValueError, TypeError):
                    continue
        return None

    def _extract_text(self, data: Dict, field_names: List[str]) -> str:
        """
        Extract text value from dict trying multiple field names.

        Args:
            data: Dictionary to search
            field_names: List of possible field names

        Returns:
            String value or empty string
        """
        for field in field_names:
            value = data.get(field)
            if value:
                return str(value).strip()
        return ""
