<!--
Sync Impact Report
- Version change: N/A → 1.0.0 (initial ratification)
- Added principles:
  - I. Static-First Architecture
  - II. API Responsibility Separation
  - III. Simplicity & YAGNI
  - IV. Type Safety
  - V. Testability
- Added sections:
  - Technology Stack
  - Development Workflow
  - Governance
- Templates checked:
  - .specify/templates/plan-template.md ✅ compatible
  - .specify/templates/spec-template.md ✅ compatible
  - .specify/templates/tasks-template.md ✅ compatible
- Follow-up TODOs: none
-->

# Qiita AI Ranking Constitution

## Core Principles

### I. Static-First Architecture

The site MUST be buildable as a static site with pre-rendered HTML.
Data fetching from external APIs (Qiita) MUST happen at build time
or via scheduled batch processes, NOT on every user request.
This ensures fast page loads, minimal hosting costs, and resilience
against API rate limits.

### II. API Responsibility Separation

Data fetching, scoring/ranking logic, and presentation MUST be
clearly separated into distinct modules. The data layer handles
Qiita API communication and caching. The ranking layer computes
scores from raw article data. The presentation layer renders the
UI. No layer may directly depend on implementation details of
another.

### III. Simplicity & YAGNI

Start with the minimum viable implementation. Do NOT add
abstractions, configuration options, or features beyond what is
explicitly required. A single-page application with a flat file
structure is preferred over a complex multi-route architecture
until proven insufficient. Prefer standard library and built-in
platform features over third-party dependencies.

### IV. Type Safety

All code MUST use TypeScript with strict mode enabled. API
response types MUST be explicitly defined. No use of `any` type
except where unavoidable with documented justification.

### V. Testability

Core business logic (ranking algorithm, score computation) MUST
have unit tests. API integration points MUST use typed mocks for
testing. UI components SHOULD be testable in isolation.

## Technology Stack

- **Runtime**: Node.js (LTS)
- **Language**: TypeScript (strict mode)
- **Framework**: Next.js (Static Export / SSG)
- **Styling**: Tailwind CSS
- **Data Source**: Qiita API v2
- **Package Manager**: npm
- **Hosting Target**: Static hosting (Vercel, GitHub Pages, etc.)
- **Testing**: Vitest

## Development Workflow

- All code changes MUST pass TypeScript compilation with no errors
  before commit.
- Linting (ESLint) and formatting (Prettier) MUST be configured
  and enforced.
- Feature branches MUST be used for all changes; direct commits
  to main are prohibited.
- Each commit SHOULD represent a single logical change.
- Environment-specific values (API tokens, base URLs) MUST be
  managed via environment variables, NEVER hardcoded.

## Governance

This constitution defines the non-negotiable standards for the
Qiita AI Ranking project. All implementation decisions MUST be
evaluated against these principles.

- **Amendments**: Any change to this constitution MUST be
  documented with rationale and version bump.
- **Versioning**: Follows semantic versioning (MAJOR.MINOR.PATCH).
  MAJOR for principle removals/redefinitions, MINOR for new
  principles or material expansions, PATCH for clarifications.
- **Compliance**: All pull requests MUST be verified against
  these principles before merge.

**Version**: 1.0.0 | **Ratified**: 2026-03-09 | **Last Amended**: 2026-03-09
