# Changelog

All notable changes to Geetanjali will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Rate limiting on authentication endpoints
- Nginx security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- SECURITY.md with vulnerability reporting guidelines
- GitHub Actions CI workflow
- Dependabot configuration for automated dependency updates
- 404 Not Found page with app-consistent theming

### Changed
- Updated chromadb from 0.4.22 to 0.5.0
- Updated anthropic SDK from 0.39.0 to 0.40.0
- Removed numpy <2.0 constraint

### Fixed
- Timing attack vulnerability in admin API key verification
- Bare exception handlers replaced with specific exception types
- Console statements removed for production builds
- React key props using stable IDs instead of array indices

### Security
- Added `secrets.compare_digest()` for API key comparison
- Rate limiting: 5/min signup, 10/min login, 30/min refresh

## [0.1.0] - 2024-12-03

### Added
- Initial release
- Bhagavad Geeta verse database with semantic search
- Consultation system with AI-powered ethical guidance
- User authentication with JWT tokens
- Anonymous session support with migration on signup
- Verse browser with chapter/verse navigation
- Multi-school commentary support
