import { COMPANIES } from "./companies.js";
import type {
  Company,
  CompanyId,
  JobSource,
  SourceId,
  SourceProvider,
} from "./schemas.js";
import { JOB_SOURCES } from "./sources.js";

const companyById = new Map<CompanyId, Company>(
  COMPANIES.map((company) => [company.id, company]),
);

const companyBySlug = new Map<string, Company>(
  COMPANIES.map((company) => [company.slug, company]),
);

const sourceById = new Map<SourceId, JobSource>(
  JOB_SOURCES.map((source) => [source.id, source]),
);

const sourcesByCompanyId = new Map<CompanyId, readonly JobSource[]>();
const sourcesByProvider = new Map<SourceProvider, readonly JobSource[]>();

for (const company of COMPANIES) {
  sourcesByCompanyId.set(
    company.id,
    Object.freeze(JOB_SOURCES.filter((source) => source.companyId === company.id)),
  );
}

for (const provider of [
  "greenhouse",
  "lever",
  "ashby",
  "smartrecruiters",
  "workday",
  "icims",
  "successfactors",
  "taleo",
  "custom",
] as const satisfies readonly SourceProvider[]) {
  sourcesByProvider.set(
    provider,
    Object.freeze(JOB_SOURCES.filter((source) => source.provider === provider)),
  );
}

export const getCompanyById = (companyId: CompanyId): Company | null =>
  companyById.get(companyId) ?? null;

export const getCompanyBySlug = (slug: string): Company | null =>
  companyBySlug.get(slug.trim().toLowerCase()) ?? null;

export const getJobSourceById = (sourceId: SourceId): JobSource | null =>
  sourceById.get(sourceId) ?? null;

export const getSourcesForCompany = (
  companyId: CompanyId,
): readonly JobSource[] => sourcesByCompanyId.get(companyId) ?? Object.freeze([]);

export const getSourcesByProvider = (
  provider: SourceProvider,
): readonly JobSource[] => sourcesByProvider.get(provider) ?? Object.freeze([]);

export const getEnabledJobSources = (): readonly JobSource[] =>
  Object.freeze(
    JOB_SOURCES.filter(
      (source) => source.status === "active" && source.crawlEnabled,
    ),
  );

export const getCrawlableJobSources = (): readonly JobSource[] =>
  Object.freeze(
    JOB_SOURCES.filter(
      (source) =>
        source.status === "active" &&
        source.crawlEnabled &&
        source.verification.status === "verified",
    ),
  );

export const resolveCompanyForSource = (source: JobSource): Company => {
  const company = companyById.get(source.companyId);
  if (!company) {
    throw new Error(`Unknown company ${source.companyId} for source ${source.id}.`);
  }
  return company;
};

export const getSourceConnectionKey = (source: JobSource): string => {
  switch (source.provider) {
    case "greenhouse":
      return `greenhouse:${source.config.boardToken.toLowerCase()}`;
    case "lever":
      return `lever:${source.config.siteSlug.toLowerCase()}`;
    case "ashby":
      return `ashby:${source.config.organizationSlug.toLowerCase()}`;
    case "smartrecruiters":
      return `smartrecruiters:${source.config.companyIdentifier.toLowerCase()}`;
    case "workday":
      return `workday:${source.config.host.toLowerCase()}:${source.config.tenant.toLowerCase()}:${source.config.site.toLowerCase()}`;
    case "icims":
      return `icims:${source.config.host.toLowerCase()}:${source.config.sitePath.toLowerCase()}`;
    case "successfactors":
      return `successfactors:${source.config.host.toLowerCase()}:${source.config.sitePath.toLowerCase()}:${source.config.companyIdentifier?.toLowerCase() ?? "none"}`;
    case "taleo":
      return `taleo:${source.config.host.toLowerCase()}:${source.config.careerSection.toLowerCase()}:${source.config.locale.toLowerCase()}`;
    case "custom":
      return `custom:${[...source.config.seedUrls].sort().join("|")}`;
  }
};
