import { COMPANIES } from "./companies.js";
import { getSourceConnectionKey } from "./registry.js";
import {
  companySchema,
  jobSourceSchema,
  type Company,
  type JobSource,
  type SourceProvider,
} from "./schemas.js";
import { JOB_SOURCES } from "./sources.js";

export interface SourceRegistryValidationSummary {
  companyCount: number;
  sourceCount: number;
  enabledSourceCount: number;
  providerCounts: Readonly<Record<SourceProvider, number>>;
}

const assertUnique = (
  values: readonly string[],
  label: string,
): void => {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      throw new Error(`Duplicate ${label}: ${value}`);
    }
    seen.add(value);
  }
};

const validateCompanyRecords = (
  records: readonly Company[],
): readonly Company[] => records.map((record) => companySchema.parse(record));

const validateSourceRecords = (
  records: readonly JobSource[],
): readonly JobSource[] => records.map((record) => jobSourceSchema.parse(record));

export const validateSourceRegistry = (
  companies: readonly Company[] = COMPANIES,
  sources: readonly JobSource[] = JOB_SOURCES,
): SourceRegistryValidationSummary => {
  const validCompanies = validateCompanyRecords(companies);
  const validSources = validateSourceRecords(sources);

  assertUnique(
    validCompanies.map((company) => company.id),
    "company ID",
  );
  assertUnique(
    validCompanies.map((company) => company.slug),
    "company slug",
  );
  assertUnique(
    validCompanies.map((company) => company.websiteUrl),
    "company website URL",
  );
  assertUnique(
    validSources.map((source) => source.id),
    "source ID",
  );
  assertUnique(
    validSources.map((source) => getSourceConnectionKey(source)),
    "source connection",
  );

  const companyById = new Map(
    validCompanies.map((company) => [company.id, company] as const),
  );

  for (const source of validSources) {
    const company = companyById.get(source.companyId);
    if (!company) {
      throw new Error(
        `Source ${source.id} references missing company ${source.companyId}.`,
      );
    }

    const expectedPrefix = `source:${company.slug}:${source.provider}`;
    if (source.id !== expectedPrefix && !source.id.startsWith(`${expectedPrefix}:`)) {
      throw new Error(
        `Source ${source.id} must start with ${expectedPrefix}.`,
      );
    }

    if (source.coverage.mode === "countries") {
      assertUnique(
        source.coverage.countryCodes,
        `country code in source ${source.id}`,
      );
    }

    if (
      source.verification.status === "verified" &&
      source.verification.lastCheckedAt === null
    ) {
      throw new Error(
        `Verified source ${source.id} must have verification.lastCheckedAt.`,
      );
    }

    if (source.crawlEnabled && source.status !== "active") {
      throw new Error(
        `Crawl-enabled source ${source.id} must have active status.`,
      );
    }

    if (
      source.crawlEnabled &&
      source.verification.status !== "verified"
    ) {
      throw new Error(
        `Crawl-enabled source ${source.id} must be verified first.`,
      );
    }
  }

  for (const company of validCompanies) {
    if (company.status !== "active") {
      continue;
    }

    const liveSources = validSources.filter(
      (source) =>
        source.companyId === company.id && source.status !== "retired",
    );

    if (liveSources.length === 0) {
      throw new Error(
        `Active company ${company.id} must have at least one non-retired source.`,
      );
    }
  }

  const providerCounts: Record<SourceProvider, number> = {
    greenhouse: 0,
    lever: 0,
    ashby: 0,
    smartrecruiters: 0,
    workday: 0,
    icims: 0,
    successfactors: 0,
    taleo: 0,
    custom: 0,
  };

  for (const source of validSources) {
    providerCounts[source.provider] += 1;
  }

  return {
    companyCount: validCompanies.length,
    sourceCount: validSources.length,
    enabledSourceCount: validSources.filter(
      (source) => source.status === "active" && source.crawlEnabled,
    ).length,
    providerCounts: Object.freeze(providerCounts),
  };
};
