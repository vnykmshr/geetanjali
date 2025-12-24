"""Tests for cache utility functions."""

import pytest

# Mark all tests in this module as unit tests
pytestmark = pytest.mark.unit


class TestTTLJitter:
    """Tests for TTL jitter functions (cache stampede protection)."""

    def test_add_ttl_jitter_returns_value_in_range(self):
        """Test jitter returns value within expected range."""
        from services.cache import add_ttl_jitter

        base_ttl = 1000
        jitter_percent = 0.1  # ±10%

        # Run multiple times to verify distribution
        results = [add_ttl_jitter(base_ttl, jitter_percent) for _ in range(100)]

        min_expected = int(base_ttl * (1 - jitter_percent))  # 900
        max_expected = int(base_ttl * (1 + jitter_percent))  # 1100

        for result in results:
            assert min_expected <= result <= max_expected, (
                f"Result {result} outside range [{min_expected}, {max_expected}]"
            )

    def test_add_ttl_jitter_has_variance(self):
        """Test that jitter actually produces different values."""
        from services.cache import add_ttl_jitter

        base_ttl = 10000
        results = [add_ttl_jitter(base_ttl, 0.1) for _ in range(50)]

        # Should have at least some variance (not all identical)
        unique_values = set(results)
        assert len(unique_values) > 1, "Jitter should produce varying values"

    def test_add_ttl_jitter_zero_ttl(self):
        """Test jitter handles zero TTL gracefully."""
        from services.cache import add_ttl_jitter

        result = add_ttl_jitter(0, 0.1)
        assert result == 0

    def test_add_ttl_jitter_negative_ttl(self):
        """Test jitter handles negative TTL gracefully."""
        from services.cache import add_ttl_jitter

        result = add_ttl_jitter(-100, 0.1)
        assert result == -100

    def test_add_ttl_jitter_minimum_one(self):
        """Test jitter never returns less than 1 for positive TTL."""
        from services.cache import add_ttl_jitter

        # Very small TTL with large jitter could theoretically go negative
        results = [add_ttl_jitter(10, 0.9) for _ in range(100)]

        for result in results:
            assert result >= 1, "Result should never be less than 1"

    def test_calculate_midnight_ttl_positive(self):
        """Test midnight TTL returns positive value."""
        from services.cache import calculate_midnight_ttl

        ttl = calculate_midnight_ttl()
        assert ttl > 0
        assert ttl <= 86400  # Max one day in seconds

    def test_calculate_midnight_ttl_with_jitter(self):
        """Test midnight TTL with jitter returns values with variance."""
        from services.cache import calculate_midnight_ttl_with_jitter

        results = [calculate_midnight_ttl_with_jitter() for _ in range(50)]

        # All should be positive
        for result in results:
            assert result > 0

        # Should have variance
        unique_values = set(results)
        assert len(unique_values) > 1, "Jitter should produce varying values"
