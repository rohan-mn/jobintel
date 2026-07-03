import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

type JsonObject = Record<string, unknown>;

const auditColumns = () => ({
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "date",
  })
    .defaultNow()
    .notNull(),
});

/*
 * Canonical geographic hierarchy.
 *
 * Taxonomy records and hierarchy population will be handled in Step 8.
 */
export const locations = pgTable(
  "locations",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    parentId: uuid("parent_id").references(
      (): AnyPgColumn => locations.id,
      { onDelete: "set null" },
    ),

    canonicalKey: text("canonical_key").notNull(),
    name: text("name").notNull(),
    canonicalName: text("canonical_name").notNull(),

    locationType: text("location_type").notNull(),

    countryCode: varchar("country_code", {
      length: 2,
    }),

    subdivisionCode: varchar("subdivision_code", {
      length: 16,
    }),

    timezone: text("timezone"),

    latitude: numeric("latitude", {
      precision: 9,
      scale: 6,
    }),

    longitude: numeric("longitude", {
      precision: 9,
      scale: 6,
    }),

    metadata: jsonb("metadata")
      .$type<JsonObject>()
      .default(sql`'{}'::jsonb`)
      .notNull(),

    isActive: boolean("is_active").default(true).notNull(),

    ...auditColumns(),
  },
  (table) => [
    uniqueIndex("locations_canonical_key_uq").on(table.canonicalKey),
    index("locations_parent_id_idx").on(table.parentId),
    index("locations_country_code_idx").on(table.countryCode),
    index("locations_type_idx").on(table.locationType),
  ],
);

/*
 * Controlled role taxonomy.
 *
 * Actual role values will be added in Step 8.
 */
export const roleTags = pgTable(
  "role_tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    parentId: uuid("parent_id").references(
      (): AnyPgColumn => roleTags.id,
      { onDelete: "set null" },
    ),

    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),

    isActive: boolean("is_active").default(true).notNull(),

    ...auditColumns(),
  },
  (table) => [
    uniqueIndex("role_tags_slug_uq").on(table.slug),
    index("role_tags_parent_id_idx").on(table.parentId),
  ],
);

/*
 * Canonical skill catalogue.
 *
 * Skill categories and aliases will be handled in Steps 8 and 9.
 */
export const skills = pgTable(
  "skills",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: text("name").notNull(),
    normalizedName: text("normalized_name").notNull(),
    slug: text("slug").notNull(),

    category: text("category"),
    description: text("description"),

    isActive: boolean("is_active").default(true).notNull(),

    ...auditColumns(),
  },
  (table) => [
    uniqueIndex("skills_slug_uq").on(table.slug),
    uniqueIndex("skills_normalized_name_uq").on(table.normalizedName),
    index("skills_category_idx").on(table.category),
  ],
);

/*
 * Employers whose jobs are collected.
 */
export const companies = pgTable(
  "companies",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: text("name").notNull(),
    legalName: text("legal_name"),
    slug: text("slug").notNull(),

    websiteUrl: text("website_url"),
    careersUrl: text("careers_url"),
    industry: text("industry"),

    headquartersLocationId: uuid(
      "headquarters_location_id",
    ).references(() => locations.id, {
      onDelete: "set null",
    }),

    metadata: jsonb("metadata")
      .$type<JsonObject>()
      .default(sql`'{}'::jsonb`)
      .notNull(),

    isActive: boolean("is_active").default(true).notNull(),

    ...auditColumns(),
  },
  (table) => [
    uniqueIndex("companies_slug_uq").on(table.slug),
    index("companies_name_idx").on(table.name),
    index("companies_industry_idx").on(table.industry),
  ],
);

/*
 * Individual ATS endpoints, company career sites, and regional sources.
 *
 * Registry population and source behaviour will be implemented in Step 10.
 */
export const jobSources = pgTable(
  "job_sources",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, {
        onDelete: "cascade",
      }),

    name: text("name").notNull(),
    careersUrl: text("careers_url").notNull(),

    sourceType: text("source_type").notNull(),
    adapterKey: text("adapter_key").notNull(),

    countryCoverage: text("country_coverage")
      .array()
      .default(sql`ARRAY[]::text[]`)
      .notNull(),

    crawlFrequencyMinutes: integer(
      "crawl_frequency_minutes",
    )
      .default(720)
      .notNull(),

    enabled: boolean("enabled").default(true).notNull(),
    status: text("status").default("active").notNull(),

    configuration: jsonb("configuration")
      .$type<JsonObject>()
      .default(sql`'{}'::jsonb`)
      .notNull(),

    lastCrawledAt: timestamp("last_crawled_at", {
      withTimezone: true,
      mode: "date",
    }),

    nextCrawlAt: timestamp("next_crawl_at", {
      withTimezone: true,
      mode: "date",
    }),

    ...auditColumns(),
  },
  (table) => [
    uniqueIndex("job_sources_company_name_uq").on(
      table.companyId,
      table.name,
    ),

    index("job_sources_company_id_idx").on(table.companyId),
    index("job_sources_adapter_key_idx").on(table.adapterKey),
    index("job_sources_enabled_idx").on(table.enabled),
    index("job_sources_next_crawl_at_idx").on(table.nextCrawlAt),

    check(
      "job_sources_crawl_frequency_positive_check",
      sql`${table.crawlFrequencyMinutes} > 0`,
    ),
  ],
);

/*
 * One execution of a source crawl.
 */
export const crawlRuns = pgTable(
  "crawl_runs",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    jobSourceId: uuid("job_source_id")
      .notNull()
      .references(() => jobSources.id, {
        onDelete: "restrict",
      }),

    status: text("status").default("queued").notNull(),
    triggerType: text("trigger_type").default("scheduled").notNull(),

    workerId: text("worker_id"),

    startedAt: timestamp("started_at", {
      withTimezone: true,
      mode: "date",
    }),

    finishedAt: timestamp("finished_at", {
      withTimezone: true,
      mode: "date",
    }),

    jobsDiscovered: integer("jobs_discovered").default(0).notNull(),
    jobsFetched: integer("jobs_fetched").default(0).notNull(),
    jobsInserted: integer("jobs_inserted").default(0).notNull(),
    jobsUpdated: integer("jobs_updated").default(0).notNull(),
    jobsFailed: integer("jobs_failed").default(0).notNull(),

    errorSummary: text("error_summary"),

    metadata: jsonb("metadata")
      .$type<JsonObject>()
      .default(sql`'{}'::jsonb`)
      .notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("crawl_runs_source_id_idx").on(table.jobSourceId),
    index("crawl_runs_status_idx").on(table.status),
    index("crawl_runs_started_at_idx").on(table.startedAt),

    check(
      "crawl_runs_counts_non_negative_check",
      sql`
        ${table.jobsDiscovered} >= 0
        AND ${table.jobsFetched} >= 0
        AND ${table.jobsInserted} >= 0
        AND ${table.jobsUpdated} >= 0
        AND ${table.jobsFailed} >= 0
      `,
    ),
  ],
);

/*
 * Persistent crawl and extraction failures.
 */
export const crawlFailures = pgTable(
  "crawl_failures",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    crawlRunId: uuid("crawl_run_id")
      .notNull()
      .references(() => crawlRuns.id, {
        onDelete: "cascade",
      }),

    jobSourceId: uuid("job_source_id")
      .notNull()
      .references(() => jobSources.id, {
        onDelete: "restrict",
      }),

    externalJobId: text("external_job_id"),

    stage: text("stage").notNull(),
    errorCode: text("error_code"),
    errorMessage: text("error_message").notNull(),

    retryable: boolean("retryable").default(true).notNull(),
    attemptCount: integer("attempt_count").default(1).notNull(),

    context: jsonb("context")
      .$type<JsonObject>()
      .default(sql`'{}'::jsonb`)
      .notNull(),

    occurredAt: timestamp("occurred_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),

    resolvedAt: timestamp("resolved_at", {
      withTimezone: true,
      mode: "date",
    }),
  },
  (table) => [
    index("crawl_failures_run_id_idx").on(table.crawlRunId),
    index("crawl_failures_source_id_idx").on(table.jobSourceId),
    index("crawl_failures_stage_idx").on(table.stage),
    index("crawl_failures_unresolved_idx").on(table.resolvedAt),

    check(
      "crawl_failures_attempt_count_positive_check",
      sql`${table.attemptCount} > 0`,
    ),
  ],
);

/*
 * Exact source response.
 *
 * Step 5 will define its immutability and retention rules.
 */
export const rawJobs = pgTable(
  "raw_jobs",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    jobSourceId: uuid("job_source_id")
      .notNull()
      .references(() => jobSources.id, {
        onDelete: "restrict",
      }),

    crawlRunId: uuid("crawl_run_id")
      .notNull()
      .references(() => crawlRuns.id, {
        onDelete: "restrict",
      }),

    externalJobId: text("external_job_id").notNull(),

    sourceUrl: text("source_url").notNull(),
    applicationUrl: text("application_url"),

    responseStatus: integer("response_status"),

    rawPayload: jsonb("raw_payload").$type<unknown>().notNull(),
    rawHtml: text("raw_html"),

    contentHash: varchar("content_hash", {
      length: 64,
    }).notNull(),

    fetchedAt: timestamp("fetched_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("raw_jobs_crawl_source_external_uq").on(
      table.crawlRunId,
      table.jobSourceId,
      table.externalJobId,
    ),

    index("raw_jobs_crawl_run_id_idx").on(table.crawlRunId),

    index("raw_jobs_source_external_id_idx").on(
      table.jobSourceId,
      table.externalJobId,
    ),

    index("raw_jobs_fetched_at_idx").on(table.fetchedAt),
    index("raw_jobs_content_hash_idx").on(table.contentHash),
  ],
);

/*
 * Current normalized representation of a job.
 *
 * The canonical application-level job model will be defined in Step 6.
 */
export const jobs = pgTable(
  "jobs",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, {
        onDelete: "restrict",
      }),

    jobSourceId: uuid("job_source_id")
      .notNull()
      .references(() => jobSources.id, {
        onDelete: "restrict",
      }),

    externalJobId: text("external_job_id").notNull(),

    latestRawJobId: uuid("latest_raw_job_id")
    .notNull()
    .references(() => rawJobs.id, {
      onDelete: "restrict",
    }),

    title: text("title").notNull(),
    normalizedTitle: text("normalized_title"),

    description: text("description").notNull(),

    locationId: uuid("location_id").references(() => locations.id, {
      onDelete: "set null",
    }),

    workplaceType: text("workplace_type"),

    minimumYearsExperience: integer(
      "minimum_years_experience",
    ),

    maximumYearsExperience: integer(
      "maximum_years_experience",
    ),

    experienceBand: text("experience_band"),

    postedDate: date("posted_date", {
      mode: "string",
    }),

    expiresDate: date("expires_date", {
      mode: "string",
    }),

    applicationUrl: text("application_url").notNull(),
    sourceUrl: text("source_url").notNull(),

    status: text("status").default("active").notNull(),

    normalizedContentHash: varchar("normalized_content_hash", {
      length: 64,
    }).notNull(),

    normalizedAt: timestamp("normalized_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),

    firstSeenAt: timestamp("first_seen_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),

    lastSeenAt: timestamp("last_seen_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),

    ...auditColumns(),
  },
  (table) => [
    uniqueIndex("jobs_source_external_id_uq").on(
      table.jobSourceId,
      table.externalJobId,
    ),

    index("jobs_company_id_idx").on(table.companyId),
    index("jobs_source_id_idx").on(table.jobSourceId),
    index("jobs_latest_raw_job_id_idx").on(table.latestRawJobId),
    index("jobs_location_id_idx").on(table.locationId),
    index("jobs_normalized_title_idx").on(table.normalizedTitle),
    index("jobs_experience_band_idx").on(table.experienceBand),
    index("jobs_posted_date_idx").on(table.postedDate),
    index("jobs_status_idx").on(table.status),

    check(
      "jobs_experience_non_negative_check",
      sql`
        (${table.minimumYearsExperience} IS NULL
          OR ${table.minimumYearsExperience} >= 0)
        AND
        (${table.maximumYearsExperience} IS NULL
          OR ${table.maximumYearsExperience} >= 0)
      `,
    ),

    check(
      "jobs_experience_range_check",
      sql`
        ${table.minimumYearsExperience} IS NULL
        OR ${table.maximumYearsExperience} IS NULL
        OR ${table.maximumYearsExperience}
           >= ${table.minimumYearsExperience}
      `,
    ),
  ],
);

/*
 * Historical normalized versions of jobs.
 *
 * Step 5 will define when and how snapshots are created.
 */
export const jobSnapshots = pgTable(
  "job_snapshots",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, {
        onDelete: "cascade",
      }),

    rawJobId: uuid("raw_job_id")
      .notNull()
      .references(() => rawJobs.id, {
        onDelete: "restrict",
      }),

    snapshotVersion: integer("snapshot_version").notNull(),

    changeType: text("change_type").notNull(),

    changedFields: text("changed_fields")
      .array()
      .default(sql`ARRAY[]::text[]`)
      .notNull(),

    snapshotHash: varchar("snapshot_hash", {
      length: 64,
    }).notNull(),

    snapshotData: jsonb("snapshot_data")
      .$type<JsonObject>()
      .notNull(),

    observedAt: timestamp("observed_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("job_snapshots_job_version_uq").on(
      table.jobId,
      table.snapshotVersion,
    ),

    uniqueIndex("job_snapshots_job_hash_uq").on(
      table.jobId,
      table.snapshotHash,
    ),

    index("job_snapshots_job_id_idx").on(table.jobId),
    index("job_snapshots_raw_job_id_idx").on(table.rawJobId),
    index("job_snapshots_observed_at_idx").on(table.observedAt),
    index("job_snapshots_change_type_idx").on(table.changeType),

    check(
      "job_snapshots_version_positive_check",
      sql`${table.snapshotVersion} > 0`,
    ),
  ],
);

/*
 * Many-to-many association between jobs and role tags.
 */
export const jobRoleTags = pgTable(
  "job_role_tags",
  {
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, {
        onDelete: "cascade",
      }),

    roleTagId: uuid("role_tag_id")
      .notNull()
      .references(() => roleTags.id, {
        onDelete: "restrict",
      }),

    isPrimary: boolean("is_primary").default(false).notNull(),

    confidence: numeric("confidence", {
      precision: 5,
      scale: 4,
      mode: "number",
    }),

    classificationSource: text("classification_source"),
    evidence: text("evidence"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.jobId, table.roleTagId],
      name: "job_role_tags_pk",
    }),

    index("job_role_tags_role_tag_id_idx").on(table.roleTagId),

    check(
      "job_role_tags_confidence_check",
      sql`
        ${table.confidence} IS NULL
        OR (${table.confidence} >= 0 AND ${table.confidence} <= 1)
      `,
    ),
  ],
);

/*
 * Skills extracted from normalized jobs.
 */
export const jobSkills = pgTable(
  "job_skills",
  {
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, {
        onDelete: "cascade",
      }),

    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id, {
        onDelete: "restrict",
      }),

    requirementType: text("requirement_type").notNull(),

    confidence: numeric("confidence", {
      precision: 5,
      scale: 4,
      mode: "number",
    }),

    extractionSource: text("extraction_source"),
    evidence: text("evidence"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({
      columns: [
        table.jobId,
        table.skillId,
        table.requirementType,
      ],
      name: "job_skills_pk",
    }),

    index("job_skills_skill_id_idx").on(table.skillId),
    index("job_skills_requirement_type_idx").on(
      table.requirementType,
    ),

    check(
      "job_skills_confidence_check",
      sql`
        ${table.confidence} IS NULL
        OR (${table.confidence} >= 0 AND ${table.confidence} <= 1)
      `,
    ),
  ],
);

/*
 * Extracted and normalized compensation data.
 */
export const compensationRecords = pgTable(
  "compensation_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, {
        onDelete: "cascade",
      }),

    originalText: text("original_text"),

    minimumAmount: numeric("minimum_amount", {
      precision: 19,
      scale: 4,
    }),

    maximumAmount: numeric("maximum_amount", {
      precision: 19,
      scale: 4,
    }),

    currency: varchar("currency", {
      length: 3,
    }),

    salaryPeriod: text("salary_period"),

    annualMinimumLocal: numeric("annual_minimum_local", {
      precision: 19,
      scale: 4,
    }),

    annualMaximumLocal: numeric("annual_maximum_local", {
      precision: 19,
      scale: 4,
    }),

    annualMinimumUsd: numeric("annual_minimum_usd", {
      precision: 19,
      scale: 4,
    }),

    annualMaximumUsd: numeric("annual_maximum_usd", {
      precision: 19,
      scale: 4,
    }),

    exchangeRate: numeric("exchange_rate", {
      precision: 20,
      scale: 10,
    }),

    exchangeRateDate: date("exchange_rate_date", {
      mode: "string",
    }),

    isDisclosed: boolean("is_disclosed").default(false).notNull(),

    confidence: numeric("confidence", {
      precision: 5,
      scale: 4,
      mode: "number",
    }),

    extractionSource: text("extraction_source"),

    ...auditColumns(),
  },
  (table) => [
    index("compensation_records_job_id_idx").on(table.jobId),
    index("compensation_records_currency_idx").on(table.currency),
    index("compensation_records_annual_usd_idx").on(
      table.annualMinimumUsd,
      table.annualMaximumUsd,
    ),

    check(
      "compensation_amount_range_check",
      sql`
        ${table.minimumAmount} IS NULL
        OR ${table.maximumAmount} IS NULL
        OR ${table.maximumAmount} >= ${table.minimumAmount}
      `,
    ),

    check(
      "compensation_confidence_check",
      sql`
        ${table.confidence} IS NULL
        OR (${table.confidence} >= 0 AND ${table.confidence} <= 1)
      `,
    ),
  ],
);

/*
 * Structured enrichment and model analysis.
 */
export const jobAnalysis = pgTable(
  "job_analysis",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, {
        onDelete: "cascade",
      }),

    analysisVersion: integer("analysis_version").default(1).notNull(),
    status: text("status").default("pending").notNull(),

    implicitKnowledge: jsonb("implicit_knowledge")
      .$type<string[]>()
      .default(sql`'[]'::jsonb`)
      .notNull(),

    responsibilityCategories: jsonb(
      "responsibility_categories",
    )
      .$type<string[]>()
      .default(sql`'[]'::jsonb`)
      .notNull(),

    qualifications: jsonb("qualifications")
      .$type<string[]>()
      .default(sql`'[]'::jsonb`)
      .notNull(),

    certifications: jsonb("certifications")
      .$type<string[]>()
      .default(sql`'[]'::jsonb`)
      .notNull(),

    modelName: text("model_name"),
    modelVersion: text("model_version"),
    promptVersion: text("prompt_version"),

    confidence: numeric("confidence", {
      precision: 5,
      scale: 4,
      mode: "number",
    }),

    analyzedAt: timestamp("analyzed_at", {
      withTimezone: true,
      mode: "date",
    }),

    errorMessage: text("error_message"),

    ...auditColumns(),
  },
  (table) => [
    uniqueIndex("job_analysis_job_version_uq").on(
      table.jobId,
      table.analysisVersion,
    ),

    index("job_analysis_status_idx").on(table.status),
    index("job_analysis_analyzed_at_idx").on(table.analyzedAt),

    check(
      "job_analysis_version_positive_check",
      sql`${table.analysisVersion} > 0`,
    ),

    check(
      "job_analysis_confidence_check",
      sql`
        ${table.confidence} IS NULL
        OR (${table.confidence} >= 0 AND ${table.confidence} <= 1)
      `,
    ),
  ],
);