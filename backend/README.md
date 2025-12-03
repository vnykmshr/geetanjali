# Geetanjali Backend

FastAPI backend for the Geetanjali ethical guidance platform.

## Architecture

```
backend/
├── api/              # API routes and schemas
│   ├── middleware/   # Auth middleware
│   ├── auth.py       # Authentication endpoints
│   ├── cases.py      # Consultation endpoints
│   ├── verses.py     # Verse browsing endpoints
│   └── outputs.py    # Analysis output endpoints
├── db/               # Database layer
│   ├── models/       # SQLAlchemy models
│   └── repositories/ # Data access layer
├── services/         # Business logic
│   ├── llm/          # LLM providers (Claude, Ollama)
│   ├── embeddings.py # Sentence transformers
│   └── vectorstore.py# ChromaDB operations
├── utils/            # Utilities
└── scripts/          # Data ingestion scripts
```

## Quick Start

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp ../.env.example ../.env
# Edit ../.env with your settings

# Run database migrations
alembic upgrade head

# Start server
uvicorn main:app --reload
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/v1/auth/signup` | POST | Create account |
| `/api/v1/auth/login` | POST | Login |
| `/api/v1/cases` | POST | Create consultation |
| `/api/v1/cases/{id}/analyze` | POST | Get AI guidance |
| `/api/v1/verses` | GET | Browse verses |
| `/api/v1/verses/search` | GET | Semantic search |

## LLM Configuration

Supports multiple LLM providers:

- **Anthropic Claude** (default for production)
- **Ollama** (for local development)

Configure in `.env`:
```env
LLM_PROVIDER=anthropic  # or "ollama"
ANTHROPIC_API_KEY=sk-ant-...
OLLAMA_BASE_URL=http://localhost:11434
```

## Testing

```bash
pytest -v
pytest --cov=. --cov-report=html
```

## Database

PostgreSQL with Alembic migrations:

```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```
