"""Embedding service using sentence-transformers."""

import logging
from typing import List, Union
from sentence_transformers import SentenceTransformer

from config import settings

logger = logging.getLogger(__name__)


class EmbeddingService:
    """Service for generating text embeddings."""

    def __init__(self):
        """Initialize the embedding model."""
        logger.info(f"Loading embedding model: {settings.EMBEDDING_MODEL}")
        self.model = SentenceTransformer(settings.EMBEDDING_MODEL)
        logger.info(f"Embedding model loaded. Dimension: {settings.EMBEDDING_DIMENSION}")

    def encode(self, text: Union[str, List[str]]) -> Union[List[float], List[List[float]]]:
        """
        Generate embeddings for text.

        Args:
            text: Single text or list of texts

        Returns:
            Embedding vector(s)
        """
        if isinstance(text, str):
            # Single text
            embedding = self.model.encode(text, convert_to_numpy=True)
            return embedding.tolist()
        else:
            # Batch of texts
            embeddings = self.model.encode(text, convert_to_numpy=True)
            return embeddings.tolist()

    def encode_verse(self, verse_dict: dict) -> List[float]:
        """
        Generate embedding for a verse.

        Combines Sanskrit transliteration and English paraphrase for better semantic representation.

        Args:
            verse_dict: Dictionary with verse data

        Returns:
            Embedding vector
        """
        # Combine Sanskrit and paraphrase for richer embedding
        text_parts = []

        if verse_dict.get("sanskrit_iast"):
            text_parts.append(verse_dict["sanskrit_iast"])

        if verse_dict.get("paraphrase_en"):
            text_parts.append(verse_dict["paraphrase_en"])

        # Join with space
        combined_text = " ".join(text_parts)

        return self.encode(combined_text)


# Global embedding service instance
_embedding_service = None


def get_embedding_service() -> EmbeddingService:
    """
    Get or create the global embedding service instance.

    Returns:
        EmbeddingService instance
    """
    global _embedding_service
    if _embedding_service is None:
        _embedding_service = EmbeddingService()
    return _embedding_service
