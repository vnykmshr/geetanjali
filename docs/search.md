---
layout: default
title: Search
description: How search works in Geetanjali - unified hybrid search across Bhagavad Geeta verses.
---

# Search

Geetanjali provides a unified hybrid search that automatically detects query intent and returns relevant verses with full transparency about why each result matched.

## Search Strategies

The search system uses five strategies, executed in priority order:

| Strategy | Trigger | Example Query | Score |
|----------|---------|---------------|-------|
| **Canonical** | Verse reference pattern | `2.47`, `BG_2_47`, `chapter 2 verse 47` | 1.0 |
| **Sanskrit** | Devanagari or IAST text | `कर्मणयेवाधिकारस्ते`, `karmaṇy` | 0.95 |
| **Keyword** | English text | `duty`, `attachment`, `action` | 0.7-1.0 |
| **Principle** | Topic filter | `?principle=detachment` | 0.65 |
| **Semantic** | Meaning-based (fallback) | `how to handle failure` | 0.3-0.7 |

### Strategy Selection

```
Query: "2.47"
  → Detected as canonical reference
  → Returns exact verse match (BG_2_47)

Query: "कर्म"
  → Detected as Sanskrit (Devanagari)
  → Searches sanskrit_devanagari and sanskrit_iast fields

Query: "duty dharma karma"
  → Detected as English keywords
  → Uses hybrid OR logic (matches ANY keyword)
  → Ranks by match count (more keywords = higher rank)
```

## Hybrid OR Search

Multi-word queries use **OR logic** with match-count ranking:

```
Query: "duty dharma karma attachment"

Instead of: verses containing ALL keywords (restrictive)
We search:  verses containing ANY keyword (inclusive)

Ranking:
  - 4/4 keywords match → highest rank
  - 3/4 keywords match → high rank
  - 2/4 keywords match → medium rank
  - 1/4 keywords match → lower rank
```

### Search Priority Order

Keyword search checks fields in this order (first match wins in deduplication):

1. **Verse.translation_en** — Preferred scholar translation (score 0.7-1.0)
2. **Translation.text** — Other scholar translations (score 0.6-1.0)
3. **Verse.paraphrase_en** — Leadership paraphrase (score 0.5-0.9)

## Ranking Algorithm

Results are ranked using a weighted combination:

```
rank_score = (weight_match_type × type_score)
           + (weight_score × raw_score)
           + (weight_match_count × match_count)
           + (featured_boost if is_featured)
```

Default weights:
- `weight_match_type`: 1.0
- `weight_score`: 0.5
- `weight_match_count`: 0.1 (bonus per keyword matched)
- `featured_boost`: 0.15

### Match Type Priorities

| Type | Base Score | After Weighting |
|------|------------|-----------------|
| Exact canonical | 1.0 | 1.0 |
| Exact Sanskrit | 0.95 | 0.95 |
| Keyword (translation_en) | 0.7-1.0 | varies by match ratio |
| Keyword (Translation.text) | 0.6-1.0 | varies by match ratio |
| Keyword (paraphrase) | 0.5-0.9 | varies by match ratio |
| Principle filter | 0.65 | 0.65 |
| Semantic match | varies | 0.3-0.7 |

Featured verses (curated selection) get a +0.15 boost.

## API Reference

### Search Verses

```
GET /api/v1/search?q={query}&principle={tag}&limit={n}&offset={n}
```

**Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Search query (required) |
| `principle` | string | Filter by consulting principle |
| `limit` | int | Results per page (default: 20) |
| `offset` | int | Pagination offset |

**Response:**

```json
{
  "query": "duty dharma karma",
  "strategy": "keyword",
  "total": 20,
  "total_count": 45,
  "results": [
    {
      "canonical_id": "BG_2_47",
      "chapter": 2,
      "verse": 47,
      "sanskrit_devanagari": "कर्मण्येवाधिकारस्ते...",
      "sanskrit_iast": "karmaṇy-evādhikāras te...",
      "translation_en": "You have the right to work only...",
      "paraphrase_en": "Focus on your duty without attachment...",
      "principles": ["duty_focused_action", "non_attachment"],
      "is_featured": true,
      "match": {
        "type": "keyword_translation",
        "field": "translation_en",
        "score": 0.85,
        "highlight": "Focus on your <mark>duty</mark> without...",
        "match_count": 3
      },
      "rank_score": 1.45
    }
  ],
  "moderation": null,
  "suggestion": null
}
```

### Get Available Principles

```
GET /api/v1/search/principles
```

Returns list of all consulting principles that can be used as filters.

## Match Transparency

Every search result includes a `match` object explaining why it appeared:

- **type**: Which strategy matched (canonical, sanskrit, keyword_translation, keyword_paraphrase, semantic, principle)
- **field**: Which database field contained the match
- **score**: Raw match quality score (0-1)
- **highlight**: Matched text with `<mark>` tags for display
- **match_count**: Number of query keywords found (for hybrid OR ranking)

This transparency lets users understand and verify why each verse was returned.

## Content Moderation

### Search-Specific Filter

Search queries use a **separate content filter** from consultation submissions:

| Check | Search Rule | Rationale |
|-------|-------------|-----------|
| Profanity | Block ANY profanity | Sacred text search |
| Explicit | Block always | Safety |
| Slurs | Block always | Safety |
| Gibberish | Skip for ≤3 words | Allow "karma", "dharma" |
| Gibberish | Check for 4+ words | Prevent spam |

**Why separate from consultation?**
- Consultation allows contextual profanity ("my boss said bullshit")
- Search should not contain profanity regardless of context
- Short spiritual terms must be allowed

### Frontend/Backend Alignment

Both `validateSearchQuery()` (frontend) and `check_search_query()` (backend) use identical rules:

```
Frontend: Instant UX feedback (can be bypassed)
Backend:  Authoritative enforcement
```

Test case alignment ensures predictable behavior:

| Query | Result |
|-------|--------|
| karma | ✅ PASS |
| fuck | 🚫 BLOCK |
| xyzabc | ✅ PASS (0 results) |
| asdf qwer zxcv tyui | 🚫 BLOCK |

### Blocked Response

```json
{
  "query": "...",
  "strategy": "blocked",
  "total": 0,
  "results": [],
  "moderation": {
    "blocked": true,
    "message": "Content policy violation: profanity_abuse"
  }
}
```

Canonical verse references (e.g., "BG 2.47") and Sanskrit queries bypass moderation since they're known-safe lookups.

## Situational Query Detection

Queries that look like personal situations trigger a consultation suggestion:

```
Query: "How do I handle stress at work?"
  → Detected as situational query
  → Response includes suggestion:
    {
      "type": "consultation",
      "message": "Looking for guidance? Try our consultation feature...",
      "cta": "Get Guidance"
    }
```

Trigger patterns:
- Starts with "my", "i am", "i'm", "i feel"
- Contains "how do i", "how can i", "what should i"
- Contains "struggling", "confused", "anxious", "stressed"

## Frontend Integration

### Search Page (`/search`)

Dedicated search experience with:
- **Inline search button** — Attached to input field (pill-shaped)
- **Recent searches** — Dropdown on focus
- **Quick examples** — "2.47", "कर्म", "duty" buttons
- **Topic pills** — Browse by principle
- **Featured verse** — Random verse spotlight
- **Match transparency** — Type badge, highlighted text
- **Consultation banner** — For situational queries
- **Keyboard shortcut** — Cmd/Ctrl+K to focus

### Verse Browser Bridge

The verse browser (`/verses`) includes a search bar that navigates to `/search?q=...`, bridging the browse and search experiences.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  services/search/                                            │
├─────────────────────────────────────────────────────────────┤
│  __init__.py      Public exports                            │
│  types.py         Dataclasses, enums, serialization         │
│  config.py        SearchConfig with ranking weights         │
│  parser.py        QueryParser for intent detection          │
│  utils.py         SQL escaping, highlighting                │
│  ranking.py       Score computation, result merging         │
│  service.py       SearchService orchestrator                │
│                                                              │
│  strategies/                                                 │
│    canonical.py   Exact verse reference lookup              │
│    sanskrit.py    Devanagari/IAST text search              │
│    keyword.py     Hybrid OR search with match counting      │
│    principle.py   JSONB principle filtering                 │
│    semantic.py    ChromaDB vector similarity                │
├─────────────────────────────────────────────────────────────┤
│  services/content_filter.py                                  │
│    check_search_query()   Search-specific moderation        │
│    check_blocklist()      Consultation moderation           │
└─────────────────────────────────────────────────────────────┘
```

## Performance

| Operation | Latency |
|-----------|---------|
| Canonical lookup | ~5ms |
| Keyword search | ~20ms |
| Semantic search | ~40ms |
| Full hybrid (all strategies) | ~60ms |

Semantic search includes embedding generation (~15ms) and ChromaDB query (~25ms).

## Configuration

Search weights can be adjusted in `SearchConfig`:

```python
@dataclass
class SearchConfig:
    limit: int = 20
    offset: int = 0
    semantic_top_k: int = 10
    semantic_min_score: float = 0.3
    weight_match_type: float = 1.0
    weight_featured: float = 0.15
    weight_score: float = 0.5
    weight_match_count: float = 0.1  # Hybrid OR bonus per keyword
```

For production tuning, these could be moved to environment variables or settings.
