# jobIntel

A production-oriented job-market intelligence platform that collects,
normalizes, enriches, and analyzes job postings across multiple companies,
regions, ATS platforms, roles, experience levels, skills, and compensation
bands.

## Repository structure

- `apps/crawler-worker` — crawl and processing workers
- `apps/scheduler` — scheduled source-crawl orchestration
- `apps/api` — Fastify API
- `apps/dashboard` — Next.js analytics dashboard
- `packages/database` — PostgreSQL and Drizzle ORM layer
- `packages/job-schema` — canonical job contracts and Zod schemas
- `packages/source-adapters` — reusable ATS and custom-site adapters
- `packages/taxonomies` — controlled role, skill, and experience taxonomies
- `packages/analytics` — analytics queries and aggregation logic
- `packages/shared` — shared utilities and types
- `services/ai-enrichment` — Ollama-based enrichment
- `infrastructure` — Docker and monitoring configuration