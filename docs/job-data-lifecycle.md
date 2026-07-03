# Job Data Lifecycle

jobIntel separates source captures, current normalized records, and historical
normalized versions.

## 1. Raw jobs

`raw_jobs` contains the exact response obtained from a source during a crawl.

Raw records are append-only.

The application must not:

- update an existing raw payload;
- replace an old raw payload;
- normalize data inside the raw record;
- delete raw data during normal processing;
- use raw data directly for dashboard analytics.

Each raw record belongs to:

- one job source;
- one crawl run;
- one external job identifier.

`raw_jobs.content_hash` is calculated from the original source content.

The raw hash must be calculated consistently after removing only transport-level
noise such as non-content response metadata. It must not be calculated from the
normalized job.

## 2. Normalized jobs

`jobs` contains the current normalized state of a posting.

There is normally one current job record for each:

```text
job_source_id + external_job_id
```

Unlike raw_jobs, a normalized job may be updated.

jobs.latest_raw_job_id identifies the raw source record that produced the
current normalized version.

jobs.normalized_content_hash represents the canonical normalized fields used
for meaningful change detection.

The normalized hash must not include operational fields such as:

updated_at;
last_seen_at;
worker identifiers;
crawl-run identifiers;
processing duration;
retry count.

Otherwise, every crawl would incorrectly appear to be a job change.

## 3. Job snapshots

job_snapshots contains immutable historical normalized versions.

A snapshot is created when:

a job is first normalized;
a meaningful normalized field changes;
a job closes;
a previously closed job reopens.

A snapshot is not created merely because:

the job was crawled again;
last_seen_at changed;
HTML formatting changed;
JSON key ordering changed;
crawler metadata changed;
a retry occurred.

Each snapshot stores:

its sequential version;
the raw job that produced it;
the normalized content hash;
the complete normalized state;
the fields that changed;
the type of change;
when the version was observed.
  
## 4. Change types

Initially supported lifecycle change types:

created
updated
closed
reopened

These values will later be formalized in application schemas.

## 5. Write sequence

Processing one source record follows this order:

1. Fetch source response
2. Calculate raw content hash
3. Insert raw_jobs record
4. Validate and normalize the raw record
5. Calculate normalized content hash
6. Find jobs record by source and external job ID
7. Compare normalized hashes
8. Insert job snapshot when the normalized state changed
9. Insert or update the current jobs record
10. Commit the operation

Steps 8 and 9 must eventually execute in the same database transaction.

## 6. First observation

When a job is encountered for the first time:

raw_jobs
    Insert exact source response

jobs
    Insert current normalized record

job_snapshots
    Insert version 1 with change_type = created
## 7. Unchanged observation

When the same normalized job appears in a later crawl:

raw_jobs
    Insert the new source capture

jobs
    Update latest_raw_job_id and last_seen_at

job_snapshots
    Do not insert a new version
      
## 8. Changed observation

When meaningful normalized content changes:

raw_jobs
    Insert the new source capture

job_snapshots
    Insert the next version

jobs
    Update the current normalized state
      
## 9. Closed jobs

A job should not be considered closed after a single missed crawl.

Closure detection must account for:

successful source crawl completion;
source-level failures;
pagination failures;
temporary job disappearance;
repeated absence across crawl runs.

The exact closure threshold will be implemented with crawling and persistence
logic later.

 ## 10. Database enforcement

Application services must follow these lifecycle rules.

Database triggers, migration-level protections, and transaction enforcement will
be added when database migrations and persistence are implemented.


PostgreSQL’s `jsonb` type remains suitable for preserving variable structured source payloads and complete normalized snapshot documents. :contentReference[oaicite:1]{index=1}

---