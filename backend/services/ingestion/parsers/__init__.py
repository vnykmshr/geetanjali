"""
Parsers for different data source formats.
"""

from .html_parser import HTMLParser
from .json_parser import JSONParser

__all__ = ["HTMLParser", "JSONParser"]
