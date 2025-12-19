"""Background jobs package for scheduled tasks.

Worker Jobs:
- send_subscriber_digest: Process single newsletter digest (run by RQ worker)

Schedulers (run by cron):
- newsletter_scheduler: Enqueues individual digest jobs
"""

from jobs.newsletter import send_subscriber_digest

__all__ = ["send_subscriber_digest"]
