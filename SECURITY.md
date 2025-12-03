# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do not** create a public GitHub issue
2. Email security concerns to the project maintainers
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested fixes (optional)

We aim to respond within 48 hours and will work with you to understand and address the issue.

## Security Measures

### Authentication
- JWT-based authentication with short-lived access tokens (7 days)
- HTTP-only refresh tokens stored in cookies (90 days)
- Password hashing using bcrypt
- Rate limiting on authentication endpoints:
  - Signup: 5 requests/minute
  - Login: 10 requests/minute
  - Token refresh: 30 requests/minute

### Data Protection
- All passwords are hashed before storage
- Sensitive data is never logged
- Session IDs are used for anonymous users (non-persistent)
- User data is isolated by user_id

### Infrastructure
- CORS configured for specific origins only
- Security headers via nginx (X-Frame-Options, X-Content-Type-Options, etc.)
- Environment variables for all secrets (never committed)
- Admin API endpoints protected by API key

### Best Practices
- Input validation on all endpoints
- SQL injection prevention via SQLAlchemy ORM
- XSS prevention through React's default escaping
- CSRF protection via SameSite cookies

## Environment Variables

Never commit actual secrets. Required environment variables:

- `JWT_SECRET_KEY` - Used for signing JWT tokens (use a strong random string)
- `DATABASE_URL` - Database connection string
- `ANTHROPIC_API_KEY` - API key for Claude (if using cloud LLM)
- `API_KEY` - Admin API key for protected endpoints

See `.env.example` for the full list.
