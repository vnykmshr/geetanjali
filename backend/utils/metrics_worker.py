"""Worker-specific metrics imports for the RQ worker service.

This module explicitly imports ONLY the metrics that should be exposed
by the worker service. This prevents duplicate gauge values when both
backend and worker are scraped by Prometheus.

## Metrics Architecture

Each Python process has its OWN Prometheus registry (process-level singleton).
When Prometheus scrapes both services:

1. **Counters/Histograms** (event-based): Prometheus aggregates values from both
   sources. Use `sum()` in queries to get total across both services.
   Example: `sum(geetanjali_llm_requests_total)`

2. **Gauges** (point-in-time): Would show duplicate/conflicting values if both
   services exposed them. Only backend exposes business/infra gauges since
   they're computed by the scheduled metrics collector.

3. **Circuit Breaker State Gauges**: Both services expose these because state
   can differ between processes. Use `max()` in queries to see worst state.
   Example: `max(geetanjali_email_circuit_breaker_state)`

## What Worker Exposes

- LLM request/token counters (analysis jobs run in worker)
- LLM fallback counter
- LLM circuit breaker state (per-provider)
- Email send counter and histogram (newsletter sends from worker)
- Email circuit breaker state
- Cache hit/miss counters (worker uses cache too)
- Vector search fallback counter (RAG pipeline in worker)
- Circuit breaker transition counter

## What Worker Does NOT Expose

- Business gauges (consultations_total, registered_users_total, etc.)
- Infrastructure gauges (postgres_up, redis_connections, etc.)
- Queue gauges (queue_depth, worker_count, failed_jobs)
  These are all computed by backend's scheduled metrics collector.
"""

# LLM Metrics - primary metrics from worker (analysis jobs)
from utils.metrics_llm import (
    llm_requests_total,
    llm_tokens_total,
    llm_fallback_total,
    llm_circuit_breaker_state,
)

# Email Metrics - worker sends newsletter emails
from utils.metrics import (
    email_sends_total,
    email_send_duration_seconds,
    email_circuit_breaker_state,
)

# Cache Metrics - worker uses cache during RAG pipeline
from utils.metrics import (
    cache_hits_total,
    cache_misses_total,
)

# Vector Search Metrics - RAG pipeline runs in worker
from utils.metrics import (
    vector_search_fallback_total,
    chromadb_circuit_breaker_state,
)

# Circuit Breaker Transitions - track state changes from worker
from utils.metrics import (
    circuit_breaker_transitions_total,
)

# Re-export all for explicit visibility
__all__ = [
    # LLM
    "llm_requests_total",
    "llm_tokens_total",
    "llm_fallback_total",
    "llm_circuit_breaker_state",
    # Email
    "email_sends_total",
    "email_send_duration_seconds",
    "email_circuit_breaker_state",
    # Cache
    "cache_hits_total",
    "cache_misses_total",
    # Vector/RAG
    "vector_search_fallback_total",
    "chromadb_circuit_breaker_state",
    # Circuit Breakers
    "circuit_breaker_transitions_total",
]
