"""Infrastructure metrics - BACKEND ONLY.

These gauges are updated by the scheduled metrics collector in backend.
Worker should NOT import this module to avoid duplicate gauge exposure.
"""

from prometheus_client import Gauge

# Redis Metrics
redis_connections = Gauge(
    "geetanjali_redis_connections",
    "Number of active Redis connections",
)

redis_memory_usage_percent = Gauge(
    "geetanjali_redis_memory_usage_percent",
    "Redis memory usage as percentage of maxmemory",
)

# Worker/Queue Metrics (collected from Redis by backend)
queue_depth = Gauge(
    "geetanjali_queue_depth",
    "Number of jobs in the RQ queue",
)

worker_count = Gauge(
    "geetanjali_worker_count",
    "Number of active RQ workers",
)

failed_jobs = Gauge(
    "geetanjali_failed_jobs",
    "Number of failed jobs in the RQ failed registry",
)

# PostgreSQL Metrics
postgres_connections_active = Gauge(
    "geetanjali_postgres_connections_active",
    "Number of active PostgreSQL connections",
)

postgres_connections_idle = Gauge(
    "geetanjali_postgres_connections_idle",
    "Number of idle PostgreSQL connections",
)

postgres_database_size_bytes = Gauge(
    "geetanjali_postgres_database_size_bytes",
    "PostgreSQL database size in bytes",
)

postgres_up = Gauge(
    "geetanjali_postgres_up",
    "PostgreSQL availability (1=up, 0=down)",
)

# Ollama Metrics
ollama_up = Gauge(
    "geetanjali_ollama_up",
    "Ollama availability (1=up, 0=down)",
)

ollama_models_loaded = Gauge(
    "geetanjali_ollama_models_loaded",
    "Number of models loaded in Ollama",
)

# ChromaDB Metrics
chromadb_up = Gauge(
    "geetanjali_chromadb_up",
    "ChromaDB availability (1=up, 0=down)",
)

chromadb_collection_count = Gauge(
    "geetanjali_chromadb_collection_count",
    "Number of vectors in ChromaDB collection",
)
