# jobIntel Database Schema

## Core entities

| Table | Purpose |
|---|---|
| `companies` | Companies whose job postings are collected |
| `job_sources` | ATS endpoints and company career sites |
| `crawl_runs` | Individual source-crawl executions |
| `crawl_failures` | Persistent crawl and extraction failures |
| `raw_jobs` | Exact data returned by a source |
| `jobs` | Current normalized job record |
| `job_snapshots` | Historical normalized job versions |
| `locations` | Hierarchical country, state and city records |
| `role_tags` | Controlled job-role taxonomy |
| `job_role_tags` | Job-to-role many-to-many association |
| `skills` | Canonical skill catalogue |
| `job_skills` | Skills extracted from jobs |
| `compensation_records` | Original and normalized compensation |
| `job_analysis` | Structured enrichment and AI analysis |

## Entity relationships

```mermaid
erDiagram
    LOCATIONS ||--o{ LOCATIONS : contains
    LOCATIONS ||--o{ COMPANIES : headquarters
    LOCATIONS ||--o{ JOBS : assigned_to

    COMPANIES ||--o{ JOB_SOURCES : owns
    COMPANIES ||--o{ JOBS : advertises

    JOB_SOURCES ||--o{ CRAWL_RUNS : crawled_by
    JOB_SOURCES ||--o{ RAW_JOBS : returns
    JOB_SOURCES ||--o{ JOBS : publishes

    CRAWL_RUNS ||--o{ RAW_JOBS : discovers
    CRAWL_RUNS ||--o{ CRAWL_FAILURES : records

    RAW_JOBS ||--o{ JOB_SNAPSHOTS : supports
    JOBS ||--o{ JOB_SNAPSHOTS : has

    JOBS ||--o{ JOB_ROLE_TAGS : classified_as
    ROLE_TAGS ||--o{ JOB_ROLE_TAGS : classifies

    JOBS ||--o{ JOB_SKILLS : requires
    SKILLS ||--o{ JOB_SKILLS : appears_in

    JOBS ||--o{ COMPENSATION_RECORDS : offers
    JOBS ||--o{ JOB_ANALYSIS : analyzed_by