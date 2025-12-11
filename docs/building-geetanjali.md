---
layout: default
title: Building Geetanjali - A RAG System for Ethical Decision Support
description: How we built a RAG system that grounds ethical guidance in the Bhagavad Geeta. Architecture, LLM strategy, deployment, and design decisions.
---

# Building Geetanjali: A RAG System for Ethical Decision Support

## The Problem

Leaders face ethical dilemmas without easy answers. Layoffs versus gradual restructuring. Whistleblowing versus internal resolution. Stakeholder conflicts where every choice carries moral weight.

Traditional decision frameworks (cost-benefit analysis, stakeholder mapping) help structure thinking but don't address the underlying ethical dimensions. Meanwhile, general-purpose LLMs can generate advice but without grounding in established wisdom traditions, their output tends toward generic platitudes.

Geetanjali addresses this gap: provide structured ethical guidance grounded in the Bhagavad Geeta's 701 verses, with explicit citations and confidence scores.

## Why RAG for Ethical Guidance

Retrieval-Augmented Generation solves two problems:

1. **Grounding** - Instead of hallucinating advice, the LLM receives relevant verses as context. Every recommendation traces back to specific scripture.

2. **Transparency** - Users see which verses informed the guidance. They can verify interpretations, explore further, or disagree.

A naive approach would fine-tune an LLM on Geeta content. RAG avoids this because:
- Scripture interpretation evolves; RAG allows updating the knowledge base without retraining
- Citations matter; RAG naturally preserves source attribution
- The corpus is small (701 verses); fine-tuning would likely overfit

With this architecture in mind, let's look at where Geetanjali fits—and where it doesn't.

## When to Use Geetanjali

**Good fit:**
- Leadership ethical dilemmas requiring structured analysis
- Situations where traditional wisdom provides perspective
- Decisions benefiting from multiple options with tradeoffs
- Cases where citation and transparency matter

**Not a good fit:**
- Legal or medical decisions (requires professional advice)
- Situations requiring real-time or emergency response
- Contexts where Bhagavad Geeta framework doesn't apply

## Usage Example

### API Request

```bash
curl -X POST http://localhost:8000/api/v1/cases \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Whistleblowing dilemma",
    "description": "I discovered financial irregularities at my company.
                    Reporting internally has failed. Do I go public?",
    "role": "Senior Manager",
    "stakeholders": ["employees", "shareholders", "regulators"],
    "constraints": ["NDA", "career risk"]
  }'
```

### API Response (Simplified)

```json
{
  "executive_summary": "This case presents a classic tension between loyalty and truth-telling...",
  "options": [
    {"title": "Internal Escalation", "sources": ["BG_18_63"]},
    {"title": "External Disclosure", "sources": ["BG_2_47"]},
    {"title": "Document and Wait", "sources": ["BG_3_19"]}
  ],
  "recommended_action": {
    "option": 1,
    "steps": ["Request audit committee meeting", "Present documented evidence", "Set timeline"]
  },
  "sources": [{"canonical_id": "BG_18_63", "paraphrase": "Choose with knowledge and freedom.", "relevance": 0.92}],
  "confidence": 0.84
}
```

Each option includes pros, cons, and verse citations. The full response includes reflection prompts and a scholar review flag for low-confidence cases.

## Architecture

```mermaid
flowchart TB
    subgraph Client
        UI[React Frontend]
    end

    subgraph Edge["Nginx"]
        Proxy[Reverse Proxy]
        Static[Static Assets]
    end

    subgraph API["FastAPI Backend"]
        Cases["/api/v1/cases"]
        Analysis["/api/v1/cases/{id}/analyze"]
        Verses["/api/v1/verses"]
    end

    subgraph Worker["Background Worker"]
        Async[Async Analysis]
    end

    subgraph RAG["RAG Pipeline"]
        Embed[Embedding Service]
        Search[Vector Search]
        Generate[LLM Generation]
        Validate[Output Validation]
    end

    subgraph Storage
        PG[(PostgreSQL)]
        Chroma[(ChromaDB)]
        Redis[(Redis)]
    end

    subgraph LLM["LLM Layer (configurable)"]
        Ollama[Ollama - local]
        Claude[Anthropic Claude]
    end

    UI --> Proxy
    Proxy --> API
    Proxy --> Static

    Cases --> PG
    Analysis --> Worker
    Worker --> RAG
    Verses --> PG

    Embed --> Chroma
    Search --> Chroma
    Generate --> LLM

    RAG --> PG
    Redis --> API
```

### Component Responsibilities

| Component | Purpose |
|-----------|---------|
| Nginx | Reverse proxy, TLS termination, static assets, rate limiting |
| PostgreSQL | Cases, users, outputs, verses with translations |
| ChromaDB | 384-dimensional verse embeddings for semantic search |
| Redis | Response caching, session storage, rate limit state |
| Ollama | Local LLM for self-hosted deployments |
| Anthropic Claude | Cloud LLM option when local resources are limited |

## The RAG Pipeline

```mermaid
sequenceDiagram
    participant User
    participant API
    participant Filter
    participant Embedder
    participant ChromaDB
    participant LLM
    participant Validator

    User->>API: POST /cases/{id}/analyze
    API->>Filter: Layer 1: Blocklist check
    alt Content blocked
        Filter-->>User: 422 + Educational message
    end
    Filter->>Embedder: Encode case description
    Embedder->>ChromaDB: Vector similarity search (top-k)
    ChromaDB-->>API: Retrieved verses with scores
    API->>API: Enrich verses with translations
    API->>API: Construct prompt with context
    API->>LLM: Generate consulting brief
    LLM-->>Filter: Layer 2: Refusal detection
    alt LLM refused
        Filter-->>API: Policy violation response
    end
    Filter->>Validator: Validate structure
    Validator-->>API: Validated output
    API->>User: Consulting brief with citations
```

### Step 1: Embedding

User case descriptions are embedded using `sentence-transformers/all-MiniLM-L6-v2`. We chose this model for its balance of speed (~14ms per sentence), compact size (384 dimensions), and strong semantic similarity performance. It runs locally without API calls.

### Step 2: Retrieval

ChromaDB finds semantically similar verses using cosine similarity. Each verse is stored with metadata including `canonical_id` (e.g., BG_2_47), a modern English `paraphrase`, extracted `principles`, and thematic tags. The top-k results (default 5) are returned with relevance scores.

### Step 3: Context Construction

Retrieved verses are formatted into a structured prompt that presents the user's dilemma alongside relevant scripture. The prompt template includes the case title, role, description, stakeholders, and constraints, followed by the retrieved verses with their paraphrases.

### Step 4: LLM Generation

The LLM receives the constructed prompt with a system message defining the expected JSON structure:

```python
def generate_brief(self, prompt: str, retrieved_verses: List[Dict]) -> Dict:
    result = self.llm_service.generate(
        prompt=prompt,
        system_prompt=SYSTEM_PROMPT,
        temperature=0.7,
        fallback_prompt=build_ollama_prompt(case_data, retrieved_verses),
        fallback_system=OLLAMA_SYSTEM_PROMPT
    )
    return json.loads(result["response"])
```

The system prompt enforces structure: executive summary, three options with pros/cons/sources, recommended action with steps, reflection prompts, cited sources with relevance scores, confidence score, and a scholar review flag.

### Step 5: Validation and Fallback

Output validation ensures completeness. Missing fields get sensible defaults. Low-confidence responses (below threshold) are flagged for scholar review. The pipeline never fails completely—if verse retrieval fails, it continues without verses; if LLM generation fails, it returns a graceful fallback response.

## LLM Provider Strategy

```mermaid
flowchart TD
    Request[Generate Request] --> Config{LLM_PROVIDER}

    Config -->|ollama| Ollama[Local Ollama]
    Config -->|anthropic| Claude[Anthropic Claude]

    Ollama -->|Success| PostProcess[Post-Process JSON]
    Ollama -->|Failure| Fallback{Fallback?}

    Claude -->|Success| Response[JSON Response]
    Claude -->|Failure| Fallback

    Fallback -->|Enabled| Secondary[Fallback Provider]
    Fallback -->|Disabled| Error[Return Error]

    Secondary --> Response
    PostProcess --> Response
```

### Local-First Design

The system is designed to run entirely self-hosted:

1. **Ollama** (Default)
   - Runs locally, no API costs
   - Works offline
   - Full Docker deployment
   - Prompt optimized for smaller models

2. **Anthropic Claude** (Alternative)
   - Higher quality structured output
   - Faster response times
   - Useful when local GPU resources are limited

Configuration via environment:
```bash
LLM_PROVIDER=ollama           # or "anthropic"
LLM_FALLBACK_PROVIDER=anthropic
LLM_FALLBACK_ENABLED=true
```

The Ollama prompt is optimized for smaller models:

```python
OLLAMA_SYSTEM_PROMPT = """You are an ethical leadership consultant.
Output JSON with: executive_summary, options (3), recommended_action,
reflection_prompts (2), sources, confidence, scholar_flag.
Use verse IDs like BG_2_47. Output ONLY valid JSON."""
```

## Data Pipeline

```mermaid
flowchart LR
    subgraph Sources
        Geeta[gita/gita repo]
        Vedic[VedicScriptures API]
    end

    subgraph Ingestion
        Parse[JSON Parser]
        Validate[Validator]
        Enrich[Enricher]
    end

    subgraph Storage
        PG[(PostgreSQL)]
        Chroma[(ChromaDB)]
    end

    Geeta --> Parse
    Vedic --> Parse
    Parse --> Validate
    Validate --> Enrich
    Enrich --> PG
    Enrich --> Chroma
```

### Verse Data Structure

```json
{
  "canonical_id": "BG_2_47",
  "chapter": 2,
  "verse": 47,
  "sanskrit_devanagari": "कर्मण्येवाधिकारस्ते...",
  "sanskrit_iast": "karmaṇy-evādhikāras te...",
  "translations": [
    {
      "author": "Swami Sivananda",
      "text": "Your right is to work only..."
    }
  ],
  "paraphrase": "Act focused on duty, not fruits.",
  "principles": ["detachment", "duty", "action"]
}
```

### Embedding Strategy

Each verse is embedded as concatenated text:
- Sanskrit IAST transliteration
- Primary English translation
- Modern paraphrase

This captures both the original language's semantic content and accessible interpretation.

## Key Design Decisions

### Session-Based Anonymous Access

Anonymous users can create cases using session IDs:

```python
@router.post("", response_model=CaseResponse)
async def create_case(
    case_data: CaseCreate,
    current_user: Optional[User] = Depends(get_optional_user),
    session_id: Optional[str] = Depends(get_session_id)
):
    case_dict["user_id"] = current_user.id if current_user else None
    case_dict["session_id"] = session_id
```

This lowers friction for first-time users while allowing authenticated users to build persistent history.

### Content Moderation

A two-layer system handles inappropriate content while maintaining focus on genuine ethical dilemmas:

```
User Input → [Layer 1: Blocklist] → LLM → [Layer 2: Refusal Detection] → Response
```

**Layer 1 (Pre-submission):** Regex blocklist catches explicit content before database write. Returns HTTP 422 with educational message suggesting how to rephrase.

**Layer 2 (Post-LLM):** Detects when the LLM refuses to process content (pattern matching on "I can't assist...", "This request contains..."). Returns a policy violation response with guidance on rephrasing.

Both layers use educational messaging—helping users understand what Geetanjali is designed for rather than punishing bad requests. No user content is logged; only violation types for monitoring.

Configuration via environment:
```bash
CONTENT_FILTER_ENABLED=true              # Master switch
CONTENT_FILTER_BLOCKLIST_ENABLED=true    # Layer 1
CONTENT_FILTER_LLM_REFUSAL_DETECTION=true # Layer 2
```

See [Content Moderation](content-moderation.md) for pattern details and extending the blocklist.

### Graceful Degradation

The pipeline never fails completely:

```python
def run(self, case_data: Dict, top_k: int = None) -> Dict:
    # Step 1: Try verse retrieval
    try:
        retrieved_verses = self.retrieve_verses(query, top_k)
    except Exception:
        retrieved_verses = []  # Continue without verses

    # Step 2: Try LLM generation
    try:
        output = self.generate_brief(prompt, ...)
    except Exception:
        return self._create_fallback_response(case_data, "LLM unavailable")

    # Step 3: Validate (with defaults for missing fields)
    return self.validate_output(output)
```

## Operations

### Deployment

Docker Compose orchestrates seven core services. A single `docker compose up` brings up the full stack: nginx (reverse proxy + static assets), FastAPI backend, RQ worker for async processing, PostgreSQL, Redis, ChromaDB, and Ollama.

Key deployment features:
- Background worker handles long-running RAG jobs (15-30s for local LLM)
- Nginx serves static assets with aggressive caching (1 year for hashed files)
- Rate limiting at both nginx and application layers

### Security

**Container hardening:** Non-root users, minimal Linux capabilities (drop all, add only required), internal services not exposed to host network.

**Secrets management:** SOPS + age encryption for `.env` files. Encrypted secrets committed to git, decrypted at deploy time.

**Application security:** Security headers (HSTS, CSP, X-Frame-Options), rate limiting (60 req/min per IP), session-based anonymous access (no PII required).

See [Security](security.md) for full hardening checklist and incident response procedures.

### Performance

| Operation | Latency |
|-----------|---------|
| Embedding + Vector search | ~40ms |
| LLM generation (local) | 15-30s |
| LLM generation (cloud) | 2-5s |
| **Total pipeline** | **3-35s** |

### Observability

Prometheus + Grafana provide optional monitoring. Business metrics track consultations and active users. Infrastructure metrics monitor service health. The stack deploys separately from core services.

See [Observability](observability.md) for metric reference and alerting setup.

## Conclusion

Geetanjali demonstrates that RAG can bring ancient wisdom into modern decision support. The key is treating scripture not as training data but as retrievable context—preserving attribution and enabling verification.

The architecture patterns here (local-first LLM, graceful degradation, confidence scoring) apply broadly to any domain-specific RAG system where grounding and transparency matter.

---

**Live:** [geetanjaliapp.com](https://geetanjaliapp.com) · **Source:** [GitHub](https://github.com/geetanjaliapp/geetanjali) · MIT License
