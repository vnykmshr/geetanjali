# Operations Overview: Consultation Flows

Core business logic for the Geetanjali ethical consultation system.

---

## System Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   FastAPI   │────▶│   Worker    │
│  (React)    │◀────│   Backend   │◀────│   (RQ)      │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ Postgres │ │ ChromaDB │ │   LLM    │
        │  (Data)  │ │ (Vectors)│ │(Anthropic│
        └──────────┘ └──────────┘ │/Ollama)  │
                                  └──────────┘
```

---

## Two Consultation Modes

### 1. Initial Consultation (Analyze)

Full RAG pipeline with verse retrieval and structured output.

```
POST /cases/{id}/analyze/async → 202 Accepted

┌────────┐   ┌─────────┐   ┌────────────┐   ┌───────────┐
│ DRAFT  │──▶│ PENDING │──▶│ PROCESSING │──▶│ COMPLETED │
└────────┘   └─────────┘   └────────────┘   └───────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
             ┌────────────────┐        ┌──────────┐
             │POLICY_VIOLATION│        │  FAILED  │
             └────────────────┘        └──────────┘
```

**Pipeline Steps:**
1. Content validation (blocklist filter)
2. Vector similarity search (ChromaDB)
3. Verse retrieval (top-K relevant)
4. LLM generation (structured JSON)
5. Response parsing & validation
6. Output + Message creation

**Creates:**
- `Output` record (structured JSON with options, steps, sources)
- `Message` records (user question + assistant response)

---

### 2. Follow-up Conversation

Lightweight conversational mode using prior context.

```
POST /cases/{id}/follow-up → 202 Accepted

┌───────────┐   ┌────────────┐   ┌───────────┐
│ COMPLETED │──▶│ PROCESSING │──▶│ COMPLETED │
└───────────┘   └────────────┘   └───────────┘
                      │
                      ▼
               ┌──────────┐
               │  FAILED  │
               └──────────┘
```

**Pipeline Steps:**
1. Content validation (blocklist filter)
2. Create user message immediately
3. Load prior Output context
4. Load conversation history (rolling window)
5. LLM generation (markdown prose)
6. Create assistant message

**Creates:**
- `Message` records only (no new Output)

---

## Key Differences

| Aspect | Analyze | Follow-up |
|--------|---------|-----------|
| Retrieval | Vector search + verse fetch | None (uses prior context) |
| Output format | Structured JSON | Markdown prose |
| Creates Output | Yes | No |
| Token limit | 2048 (Anthropic) | 1024 (configurable) |
| Use case | Initial dilemma analysis | Clarification, refinement |

---

## State Machine

```
                    ┌─────────────────────────────┐
                    │                             │
                    ▼                             │
┌───────┐  create  ┌───────┐  analyze  ┌─────────┐│
│ (new) │─────────▶│ DRAFT │──────────▶│ PENDING ││
└───────┘          └───────┘           └─────────┘│
                                            │     │
                                    task    │     │
                                    start   │     │
                                            ▼     │
                                     ┌────────────┴┐
                                     │ PROCESSING  │◀──┐
                                     └─────────────┘   │
                                            │          │
                       ┌────────────────────┼──────────┤
                       │                    │          │
                       ▼                    ▼          │ follow-up
                ┌──────────┐         ┌────────────────┐│
                │  FAILED  │         │   COMPLETED    │┘
                └──────────┘         └────────────────┘
                       │                    │
                       │    retry           │
                       └────────────────────┘

Terminal: COMPLETED, FAILED, POLICY_VIOLATION
```

---

## Frontend Polling

Status changes are detected via polling:

```javascript
// Fixed 5-second interval
// ~24 requests for 2-minute operation
// Max 5s latency after completion
const POLL_INTERVAL = 5000;

setInterval(async () => {
  const data = await casesApi.get(caseId);
  if (isTerminal(data.status)) {
    fetchFinalData();
  }
}, POLL_INTERVAL);
```

---

## Background Task Queue

```
┌──────────────┐     ┌───────────┐     ┌────────────┐
│   Endpoint   │────▶│   Redis   │────▶│   Worker   │
│ (enqueue)    │     │   Queue   │     │ (process)  │
└──────────────┘     └───────────┘     └────────────┘
                           │
                    Fallback if Redis
                    unavailable:
                           │
                           ▼
                   ┌───────────────┐
                   │ BackgroundTask│
                   │  (in-process) │
                   └───────────────┘
```

**Retry Policy:**
- 2 retries with exponential backoff
- Delays: 30s, 120s (configurable)

---

## Content Moderation

Three-layer defense:

1. **Pre-submission blocklist** - Regex patterns for explicit/violent content
2. **LLM refusal detection** - Detect if LLM refuses to respond
3. **Policy violation handling** - Educational response for flagged content

---

## Configuration Reference

```python
# RAG Pipeline
RAG_TOP_K_VERSES = 5          # Verses to retrieve
RAG_CONFIDENCE_THRESHOLD = 0.7 # Below triggers scholar flag

# Follow-up Pipeline
FOLLOW_UP_MAX_TOKENS = 1024   # Token limit for responses

# Rate Limits
ANALYZE_RATE_LIMIT = "5/minute"
FOLLOW_UP_RATE_LIMIT = "10/minute"

# Queue
RQ_JOB_TIMEOUT = 600          # 10 minutes max
RQ_RETRY_DELAYS = "30,120"    # Retry after 30s, 2min
```

---

## Error Handling

| Status | Meaning | Recovery |
|--------|---------|----------|
| `FAILED` | LLM/system error | Retry via `/cases/{id}/retry` |
| `POLICY_VIOLATION` | Content flagged | Edit and resubmit |
| `409 CONFLICT` | Already processing | Wait for completion |

---

*Last updated: 2025-12-11*
