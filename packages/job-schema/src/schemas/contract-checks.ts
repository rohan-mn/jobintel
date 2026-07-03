import type {
  ZodType,
  output,
} from "zod";

import type {
  CanonicalJob,
  ExtractionSource,
  JobStatus,
  NormalizationResult,
  QualificationRequirementType,
  SalaryPeriod,
  SkillRequirementType,
  WorkplaceType,
} from "../job.js";

import type {
  JobSourceType,
  RawJobDetails,
  RawJobListing,
} from "../source.js";

import {
  canonicalJobSchema,
  extractionSourceSchema,
  jobStatusSchema,
  normalizationResultSchema,
  qualificationRequirementTypeSchema,
  salaryPeriodSchema,
  skillRequirementTypeSchema,
  workplaceTypeSchema,
} from "./job.schema.js";

import {
  jobSourceTypeSchema,
  rawJobDetailsSchema,
  rawJobListingSchema,
} from "./source.schema.js";

/**
 * These assignments fail during TypeScript compilation if the schema output
 * is no longer assignable to the corresponding Step 6 contract.
 */
const rawJobListingContractCheck:
  ZodType<RawJobListing> = rawJobListingSchema;

const rawJobDetailsContractCheck:
  ZodType<RawJobDetails> = rawJobDetailsSchema;

const canonicalJobContractCheck:
  ZodType<CanonicalJob> = canonicalJobSchema;

const normalizationResultContractCheck:
  ZodType<NormalizationResult> =
    normalizationResultSchema;

/**
 * Exact equality checks for fixed union types.
 */
type IsExact<Left, Right> =
  (<Type>() => Type extends Left ? 1 : 2) extends
  (<Type>() => Type extends Right ? 1 : 2)
    ? (
        (<Type>() => Type extends Right ? 1 : 2) extends
        (<Type>() => Type extends Left ? 1 : 2)
          ? true
          : false
      )
    : false;

type Assert<Condition extends true> = Condition;

type JobSourceTypeMatches = Assert<
  IsExact<
    output<typeof jobSourceTypeSchema>,
    JobSourceType
  >
>;

type WorkplaceTypeMatches = Assert<
  IsExact<
    output<typeof workplaceTypeSchema>,
    WorkplaceType
  >
>;

type SalaryPeriodMatches = Assert<
  IsExact<
    output<typeof salaryPeriodSchema>,
    SalaryPeriod
  >
>;

type SkillRequirementTypeMatches = Assert<
  IsExact<
    output<typeof skillRequirementTypeSchema>,
    SkillRequirementType
  >
>;

type QualificationRequirementTypeMatches = Assert<
  IsExact<
    output<typeof qualificationRequirementTypeSchema>,
    QualificationRequirementType
  >
>;

type ExtractionSourceMatches = Assert<
  IsExact<
    output<typeof extractionSourceSchema>,
    ExtractionSource
  >
>;

type JobStatusMatches = Assert<
  IsExact<
    output<typeof jobStatusSchema>,
    JobStatus
  >
>;

void [
  rawJobListingContractCheck,
  rawJobDetailsContractCheck,
  canonicalJobContractCheck,
  normalizationResultContractCheck,
];

export type {
  ExtractionSourceMatches,
  JobSourceTypeMatches,
  JobStatusMatches,
  QualificationRequirementTypeMatches,
  SalaryPeriodMatches,
  SkillRequirementTypeMatches,
  WorkplaceTypeMatches,
};