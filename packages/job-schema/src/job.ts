import type {
  ConfidenceScore,
  ContentHash,
  CountryCode,
  CurrencyCode,
  EntityId,
  ISODateString,
  ISODateTimeString,
  JsonObject,
} from "./common.js";

import type {
  JobSourceType,
} from "./source.js";

export type WorkplaceType =
  | "remote"
  | "hybrid"
  | "onsite"
  | "unspecified";

export type SalaryPeriod =
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "unspecified";

export type SkillRequirementType =
  | "required"
  | "preferred"
  | "implicit";

export type QualificationRequirementType =
  | "required"
  | "preferred"
  | "unspecified";

export type ExtractionSource =
  | "source"
  | "rule"
  | "regex"
  | "dictionary"
  | "llm"
  | "manual";

export type JobStatus =
  | "active"
  | "closed"
  | "unknown";

export interface CanonicalCompany {
  companyId: EntityId | null;

  name: string;
  legalName: string | null;
  slug: string | null;

  websiteUrl: string | null;
}

export interface CanonicalLocation {
  locationId: EntityId | null;

  originalText: string | null;

  country: string | null;
  countryCode: CountryCode | null;

  state: string | null;
  stateCode: string | null;

  city: string | null;

  workplaceType: WorkplaceType;
}

export interface CanonicalRoleTag {
  roleTagId: EntityId | null;

  name: string;

  isPrimary: boolean;

  confidence: ConfidenceScore | null;
  classificationSource: ExtractionSource | null;

  evidence: string | null;
}

export interface CanonicalSkill {
  skillId: EntityId | null;

  name: string;
  normalizedName: string;

  category: string | null;
  requirementType: SkillRequirementType;

  confidence: ConfidenceScore | null;
  extractionSource: ExtractionSource | null;

  evidence: string | null;
}

export interface CanonicalQualification {
  text: string;

  requirementType: QualificationRequirementType;

  confidence: ConfidenceScore | null;
  extractionSource: ExtractionSource | null;

  evidence: string | null;
}

export interface CanonicalCertification {
  name: string;

  issuer: string | null;
  requirementType: QualificationRequirementType;

  confidence: ConfidenceScore | null;
  extractionSource: ExtractionSource | null;

  evidence: string | null;
}

export interface CanonicalCompensation {
  originalText: string | null;

  salaryMinimum: number | null;
  salaryMaximum: number | null;

  salaryCurrency: CurrencyCode | null;
  salaryPeriod: SalaryPeriod | null;

  annualSalaryMinimumLocal: number | null;
  annualSalaryMaximumLocal: number | null;

  annualSalaryMinimumUsd: number | null;
  annualSalaryMaximumUsd: number | null;

  exchangeRate: number | null;
  exchangeRateDate: ISODateString | null;

  isDisclosed: boolean;

  confidence: ConfidenceScore | null;
  extractionSource: ExtractionSource | null;
}

export interface CanonicalExperience {
  originalText: string | null;

  minimumYearsExperience: number | null;
  maximumYearsExperience: number | null;

  /**
   * Controlled experience-band values will be defined in Step 8.
   */
  experienceBand: string | null;

  confidence: ConfidenceScore | null;
  extractionSource: ExtractionSource | null;
}

export interface CanonicalJobProvenance {
  jobSourceId: EntityId | null;
  crawlRunId: EntityId | null;
  rawJobId: EntityId | null;

  sourceType: JobSourceType;
  adapterKey: string;

  fetchedAt: ISODateTimeString;

  rawContentHash: ContentHash | null;
  normalizedContentHash: ContentHash | null;
}

/**
 * Canonical normalized job contract.
 *
 * Every adapter must ultimately produce this structure before normalized
 * persistence.
 */
export interface CanonicalJob {
  schemaVersion: "1.0";

  externalJobId: string;

  title: string;
  normalizedTitle: string | null;

  company: CanonicalCompany;

  description: string;

  /**
   * Controlled role-family and role-tag values will be added in Step 8.
   */
  roleFamily: string | null;
  roleTags: CanonicalRoleTag[];

  location: CanonicalLocation;

  experience: CanonicalExperience;

  compensation: CanonicalCompensation | null;

  requiredSkills: CanonicalSkill[];
  preferredSkills: CanonicalSkill[];
  implicitSkills: CanonicalSkill[];

  qualifications: CanonicalQualification[];
  certifications: CanonicalCertification[];

  postedDate: ISODateString | null;
  expiresDate: ISODateString | null;

  applicationUrl: string;
  sourceUrl: string;

  status: JobStatus;

  provenance: CanonicalJobProvenance;

  metadata: JsonObject;
}

export interface NormalizationWarning {
  code: string;
  message: string;

  field: string | null;
  originalValue: string | null;
}

export interface NormalizationResult {
  job: CanonicalJob;

  warnings: NormalizationWarning[];

  requiresAiEnrichment: boolean;
  requiresManualReview: boolean;
}