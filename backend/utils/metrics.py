"""Prometheus metrics - BACKEND FACADE.

This module re-exports all metrics for backward compatibility in backend.
DO NOT import this module in worker - it will register business/infra gauges.

For worker, import from:
- utils.metrics_llm (LLM counters)
- utils.metrics_events (email, cache, circuit breaker counters)
"""

# Re-export business metrics (backend-only gauges)
from utils.metrics_business import (
    consultations_total,
    verses_served_total,
    exports_total,
    registered_users_total,
    active_users_24h,
    consultations_24h,
    signups_24h,
    consultation_completion_rate,
    exports_24h,
    avg_messages_per_case,
    newsletter_subscribers_total,
    newsletter_subscribers_by_time,
    newsletter_emails_sent_24h,
    shared_cases_total,
    case_views_24h,
    feedback_positive_rate,
)

# Re-export infrastructure metrics (backend-only gauges)
from utils.metrics_infra import (
    redis_connections,
    redis_memory_usage_percent,
    queue_depth,
    worker_count,
    failed_jobs,
    postgres_connections_active,
    postgres_connections_idle,
    postgres_database_size_bytes,
    postgres_up,
    ollama_up,
    ollama_models_loaded,
    chromadb_up,
    chromadb_collection_count,
)

# Re-export event metrics (shared between backend and worker)
from utils.metrics_events import (
    api_errors_total,
    email_sends_total,
    email_send_duration_seconds,
    email_circuit_breaker_state,
    cache_hits_total,
    cache_misses_total,
    vector_search_fallback_total,
    chromadb_circuit_breaker_state,
    circuit_breaker_transitions_total,
)

# Re-export LLM metrics for backward compatibility
from utils.metrics_llm import (
    llm_requests_total,
    llm_tokens_total,
    llm_fallback_total,
    llm_circuit_breaker_state,
)

__all__ = [
    # Business
    "consultations_total",
    "verses_served_total",
    "exports_total",
    "registered_users_total",
    "active_users_24h",
    "consultations_24h",
    "signups_24h",
    "consultation_completion_rate",
    "exports_24h",
    "avg_messages_per_case",
    "newsletter_subscribers_total",
    "newsletter_subscribers_by_time",
    "newsletter_emails_sent_24h",
    "shared_cases_total",
    "case_views_24h",
    "feedback_positive_rate",
    # Infrastructure
    "redis_connections",
    "redis_memory_usage_percent",
    "queue_depth",
    "worker_count",
    "failed_jobs",
    "postgres_connections_active",
    "postgres_connections_idle",
    "postgres_database_size_bytes",
    "postgres_up",
    "ollama_up",
    "ollama_models_loaded",
    "chromadb_up",
    "chromadb_collection_count",
    # Events
    "api_errors_total",
    "email_sends_total",
    "email_send_duration_seconds",
    "email_circuit_breaker_state",
    "cache_hits_total",
    "cache_misses_total",
    "vector_search_fallback_total",
    "chromadb_circuit_breaker_state",
    "circuit_breaker_transitions_total",
    # LLM
    "llm_requests_total",
    "llm_tokens_total",
    "llm_fallback_total",
    "llm_circuit_breaker_state",
]
