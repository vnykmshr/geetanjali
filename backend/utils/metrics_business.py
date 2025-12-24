"""Business metrics - BACKEND ONLY.

These gauges are updated by the scheduled metrics collector in backend.
Worker should NOT import this module to avoid duplicate gauge exposure.
"""

from prometheus_client import Gauge

# Consultation Metrics
consultations_total = Gauge(
    "geetanjali_consultations_total",
    "Total number of consultations in the system",
)

verses_served_total = Gauge(
    "geetanjali_verses_served_total",
    "Total number of verses served across all consultations",
)

exports_total = Gauge(
    "geetanjali_exports_total",
    "Total number of exports generated",
)

consultations_24h = Gauge(
    "geetanjali_consultations_24h",
    "Number of consultations completed in the last 24 hours",
)

consultation_completion_rate = Gauge(
    "geetanjali_consultation_completion_rate",
    "Ratio of completed to total consultations (0-1)",
)

exports_24h = Gauge(
    "geetanjali_exports_24h",
    "Number of exports generated in the last 24 hours",
)

avg_messages_per_case = Gauge(
    "geetanjali_avg_messages_per_case",
    "Average number of messages per consultation",
)

# User Metrics
registered_users_total = Gauge(
    "geetanjali_registered_users_total",
    "Total number of registered users",
)

active_users_24h = Gauge(
    "geetanjali_active_users_24h",
    "Number of users active in the last 24 hours",
)

signups_24h = Gauge(
    "geetanjali_signups_24h",
    "Number of new user registrations in the last 24 hours",
)

# Newsletter & Engagement Metrics
newsletter_subscribers_total = Gauge(
    "geetanjali_newsletter_subscribers_total",
    "Total active newsletter subscribers",
)

newsletter_subscribers_by_time = Gauge(
    "geetanjali_newsletter_subscribers_by_time",
    "Newsletter subscribers by preferred send time",
    ["send_time"],
)

newsletter_emails_sent_24h = Gauge(
    "geetanjali_newsletter_emails_sent_24h",
    "Newsletter emails sent in the last 24 hours",
)

shared_cases_total = Gauge(
    "geetanjali_shared_cases_total",
    "Total shared cases by visibility mode",
    ["mode"],
)

case_views_24h = Gauge(
    "geetanjali_case_views_24h",
    "Views on shared cases in the last 24 hours",
)

feedback_positive_rate = Gauge(
    "geetanjali_feedback_positive_rate",
    "Percentage of positive feedback (0-1)",
)
