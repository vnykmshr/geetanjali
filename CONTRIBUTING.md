# Contributing to Geetanjali

Thank you for your interest in contributing to Geetanjali!

## Development Setup

### Prerequisites
- Python 3.10+
- Node.js 20+
- Docker and Docker Compose
- PostgreSQL 15+ (or use Docker)

### Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/vnykmshr/geetanjali.git
   cd geetanjali
   ```

2. Copy environment file and configure:
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. Start with Docker Compose:
   ```bash
   docker compose up -d
   ```

   Or run locally:
   ```bash
   # Backend
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   uvicorn main:app --reload

   # Frontend (new terminal)
   cd frontend
   npm install
   npm run dev
   ```

## Code Style

### Backend (Python)
- Use Black for formatting: `black .`
- Use flake8 for linting: `flake8 .`
- Use mypy for type checking: `mypy .`

### Frontend (TypeScript)
- Use ESLint: `npm run lint`
- Use Prettier for formatting

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes with clear commit messages
3. Ensure all tests pass locally
4. Update documentation if needed
5. Submit a PR with a clear description

### Commit Messages

Follow conventional commits:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `chore:` Maintenance tasks
- `ci:` CI/CD changes

## Testing

```bash
# Backend tests
cd backend
pytest

# Frontend lint
cd frontend
npm run lint
npm run build
```

## Questions?

Open an issue for questions or suggestions.
