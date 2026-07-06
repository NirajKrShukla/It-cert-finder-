# CertHub — IT Certifications Directory

## Original Problem Statement
> Create a web app for all type of IT certificates in one place. Allow to search certificates and see all possible details including pricing, learning docs and videos. Home page must show list of certificates and cost of each.

## Architecture
- **Backend**: FastAPI + MongoDB (motor). All routes prefixed `/api`. Cookie-based JWT auth (access 24h + refresh 30d, HttpOnly, Secure, SameSite=none). Passwords bcrypt-hashed.
- **Frontend**: React 19 + React Router, TailwindCSS, shadcn/ui + Sonner toasts. Design: Swiss Brutalism (Clash Display + Satoshi + JetBrains Mono) with International Klein Blue (#002FA7) + Highlighter Yellow (#E4FF00) accents on white paper, 1px hard black borders, rounded-none.
- **AI**: Claude Sonnet 4.5 via emergentintegrations + Emergent LLM key for on-the-fly cert enrichment (persisted + cached in DB by query).

## User Personas
1. **IT professional** exploring next cert to earn (search, filter by vendor/level/price/domain).
2. **Beginner** browsing what certifications exist and cost.
3. **Learner** saving certs to a personal dashboard to track intent/progress.

## Core Requirements (static)
- Public homepage: list ALL certificates with cost visible.
- Full-text search across certificates.
- Filters: vendor, level (beginner/intermediate/expert), domain, price range.
- Detail page per cert: pricing, exam duration, questions, passing score, validity, prerequisites, official docs URL, curated YouTube learning videos, practice tests.
- Optional JWT auth: register/login/logout.
- Authenticated dashboard: save favorites.

## Implemented (2026-02-06)
- Backend endpoints:
  - `GET /api/certificates` (search + multi-value filters + sort)
  - `GET /api/certificates/facets` — vendor/level/domain lists for filter UI
  - `GET /api/certificates/{slug}` — detail
  - `POST /api/certificates/ai-search` — Claude enrichment with DB caching
  - `POST /api/auth/register|login|logout`, `GET /api/auth/me`
  - `GET|POST|DELETE /api/favorites`
- 35 curated certificates seeded (AWS, Azure, GCP, CompTIA, Cisco, ISC2, PMI, Kubernetes, Terraform, Docker, Red Hat, Salesforce, Databricks, Google Data, etc.)
- Frontend pages: Home (hero + search + filters + grid), Certificate Detail (sticky left card + scrolling docs/videos), Login, Register, Dashboard.
- Fully responsive Swiss Brutalist UI with hard shadow hover on cards.

## Test Coverage
- Backend 100%: 7/7 cert endpoints + all auth + favorites + AI search (with caching verified).
- Frontend 100%: search, cert detail, register→dashboard, login→dashboard, favorite flow.
Report: `/app/test_reports/iteration_1.json`

## Backlog (P1)
- Compare 2-3 certificates side by side
- Learning path / roadmap (chain: A+ → Network+ → Security+ → CISSP)
- Study progress tracker per saved cert
- Reviews/community discussion per cert
- Email digest of newly-added certs

## Backlog (P2)
- Admin UI to CRUD certificates (currently seed-only)
- Sponsored/partner practice-test affiliate links
- Public API + share links
- Localized pricing (EUR/INR/GBP)
