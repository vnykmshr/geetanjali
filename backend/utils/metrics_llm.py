"""LLM-specific Prometheus metrics for worker service.

These metrics are separated from the main metrics module so the worker
can import only LLM metrics without registering all business metrics
(which would create duplicates with the backend).
"""

from prometheus_client import Counter

# LLM Request Metrics
llm_requests_total = Counter(
    "geetanjali_llm_requests_total",
    "Total LLM requests by provider and status",
    ["provider", "status"],
)

llm_tokens_total = Counter(
    "geetanjali_llm_tokens_total",
    "Total LLM tokens by provider and type",
    ["provider", "token_type"],
)
