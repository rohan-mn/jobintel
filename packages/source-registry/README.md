# @jobintel/source-registry

Controlled company and job-source registry for jobIntel.

## Responsibilities

- Stable company IDs and metadata.
- Stable job-source IDs.
- Provider-specific connection metadata.
- Source verification and crawl-enable state.
- Deterministic lookup helpers.
- Runtime validation with Zod.

## Deliberate boundaries

This package does not fetch, parse, schedule, queue, or persist jobs. Adapter behavior starts in Step 11, and each concrete adapter is built in later steps.

Every seeded source is initially `crawlEnabled: false`. Enable a source only after its adapter exists and the source has passed a live smoke test.
