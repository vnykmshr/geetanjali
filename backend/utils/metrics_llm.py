"""LLM-specific Prometheus metrics for worker service.

These metrics are separated from the main metrics module so the worker
can import only LLM metrics without registering all business metrics
(which would create duplicates with the backend).
"""

from prometheus_client import Counter, Gauge

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

# LLM Fallback Metrics
llm_fallback_total = Counter(
    "geetanjali_llm_fallback_total",
    "Total LLM fallback events by primary and fallback provider",
    ["primary", "fallback", "reason"],
)

# LLM Circuit Breaker Metrics (one per provider)
# Values: 0=closed, 1=half_open, 2=open
llm_circuit_breaker_state = Gauge(
    "geetanjali_llm_circuit_breaker_state",
    "LLM circuit breaker state by provider (0=closed, 1=half_open, 2=open)",
    ["provider"],
)
