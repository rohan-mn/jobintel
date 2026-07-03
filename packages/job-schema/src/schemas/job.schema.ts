import { z } from "zod";

import {
  confidenceScoreSchema,
  contentHashSchema,
  countryCodeSchema,
  currencyCodeSchema,
  entityIdSchema,
  httpUrlSchema,
  isoDateStringSchema,
  isoDateTimeStringSchema,
  jsonObjectSchema,
  nonEmptyStringSchema,
  nonNegativeIntegerSchema,
  nonNegativeNumberSchema,
  nullableNonEmptyStringSchema,
  positiveNumberSchema,
} from "./common.schema.js";

import {
  jobSourceTypeSchema,
} from "./source.schema.js";

export const workplaceTypeValues = [
  "remote",
  "hybrid",
  "onsite",
  "unspecified",
] as const;

export const workplaceTypeSchema = z.enum(
  workplaceTypeValues,
);

export const salaryPeriodValues = [
  "hourly",
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "unspecified",
] as const;

export const salaryPeriodSchema = z.enum(
  salaryPeriodValues,
);

export const skillRequirementTypeValues = [
  "required",
  "preferred",
  "implicit",
] as const;

export const skillRequirementTypeSchema = z.enum(
  skillRequirementTypeValues,
);

export const qualificationRequirementTypeValues = [
  "required",
  "preferred",
  "unspecified",
] as const;

export const qualificationRequirementTypeSchema = z.enum(
  qualificationRequirementTypeValues,
);

export const extractionSourceValues = [
  "source",
  "rule",
  "regex",
  "dictionary",
  "llm",
  "manual",
] as const;

export const extractionSourceSchema = z.enum(
  extractionSourceValues,
);

export const jobStatusValues = [
  "active",
  "closed",
  "unknown",
] as const;

export const jobStatusSchema = z.enum(
  jobStatusValues,
);

export const canonicalCompanySchema = z.strictObject({
  companyId: entityIdSchema.nullable(),

  name: nonEmptyStringSchema,
  legalName: nullableNonEmptyStringSchema,
  slug: nonEmptyStringSchema
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Company slug must use lowercase letters, numbers and hyphens.",
    )
    .nullable(),

  websiteUrl: httpUrlSchema.nullable(),
});

export const canonicalLocationSchema = z.strictObject({
  locationId: entityIdSchema.nullable(),

  originalText: nullableNonEmptyStringSchema,

  country: nullableNonEmptyStringSchema,
  countryCode: countryCodeSchema.nullable(),

  state: nullableNonEmptyStringSchema,
  stateCode: nullableNonEmptyStringSchema,

  city: nullableNonEmptyStringSchema,

  workplaceType: workplaceTypeSchema,
});

export const canonicalRoleTagSchema = z.strictObject({
  roleTagId: entityIdSchema.nullable(),

  /**
   * Controlled role-tag values will be introduced in Step 8.
   */
  name: nonEmptyStringSchema,

  isPrimary: z.boolean(),

  confidence: confidenceScoreSchema.nullable(),
  classificationSource: extractionSourceSchema.nullable(),

  evidence: nullableNonEmptyStringSchema,
});

export const canonicalSkillSchema = z.strictObject({
  skillId: entityIdSchema.nullable(),

  name: nonEmptyStringSchema,
  normalizedName: nonEmptyStringSchema,

  /**
   * Controlled skill-category values will be introduced in Step 8.
   */
  category: nullableNonEmptyStringSchema,

  requirementType: skillRequirementTypeSchema,

  confidence: confidenceScoreSchema.nullable(),
  extractionSource: extractionSourceSchema.nullable(),

  evidence: nullableNonEmptyStringSchema,
});

export const requiredCanonicalSkillSchema =
  canonicalSkillSchema.extend({
    requirementType: z.literal("required"),
  });

export const preferredCanonicalSkillSchema =
  canonicalSkillSchema.extend({
    requirementType: z.literal("preferred"),
  });

export const implicitCanonicalSkillSchema =
  canonicalSkillSchema.extend({
    requirementType: z.literal("implicit"),
  });

export const canonicalQualificationSchema = z.strictObject({
  text: nonEmptyStringSchema,

  requirementType: qualificationRequirementTypeSchema,

  confidence: confidenceScoreSchema.nullable(),
  extractionSource: extractionSourceSchema.nullable(),

  evidence: nullableNonEmptyStringSchema,
});

export const canonicalCertificationSchema = z.strictObject({
  name: nonEmptyStringSchema,

  issuer: nullableNonEmptyStringSchema,
  requirementType: qualificationRequirementTypeSchema,

  confidence: confidenceScoreSchema.nullable(),
  extractionSource: extractionSourceSchema.nullable(),

  evidence: nullableNonEmptyStringSchema,
});

export const canonicalCompensationSchema = z
  .strictObject({
    originalText: nullableNonEmptyStringSchema,

    salaryMinimum: nonNegativeNumberSchema.nullable(),
    salaryMaximum: nonNegativeNumberSchema.nullable(),

    salaryCurrency: currencyCodeSchema.nullable(),
    salaryPeriod: salaryPeriodSchema.nullable(),

    annualSalaryMinimumLocal:
      nonNegativeNumberSchema.nullable(),

    annualSalaryMaximumLocal:
      nonNegativeNumberSchema.nullable(),

    annualSalaryMinimumUsd:
      nonNegativeNumberSchema.nullable(),

    annualSalaryMaximumUsd:
      nonNegativeNumberSchema.nullable(),

    exchangeRate: positiveNumberSchema.nullable(),
    exchangeRateDate: isoDateStringSchema.nullable(),

    isDisclosed: z.boolean(),

    confidence: confidenceScoreSchema.nullable(),
    extractionSource: extractionSourceSchema.nullable(),
  })
  .refine(
    ({ salaryMinimum, salaryMaximum }) =>
      salaryMinimum === null ||
      salaryMaximum === null ||
      salaryMaximum >= salaryMinimum,
    {
      error:
        "Maximum salary cannot be lower than minimum salary.",
      path: ["salaryMaximum"],
    },
  )
  .refine(
    ({
      annualSalaryMinimumLocal,
      annualSalaryMaximumLocal,
    }) =>
      annualSalaryMinimumLocal === null ||
      annualSalaryMaximumLocal === null ||
      annualSalaryMaximumLocal >=
        annualSalaryMinimumLocal,
    {
      error:
        "Maximum annual local salary cannot be lower than the minimum.",
      path: ["annualSalaryMaximumLocal"],
    },
  )
  .refine(
    ({
      annualSalaryMinimumUsd,
      annualSalaryMaximumUsd,
    }) =>
      annualSalaryMinimumUsd === null ||
      annualSalaryMaximumUsd === null ||
      annualSalaryMaximumUsd >= annualSalaryMinimumUsd,
    {
      error:
        "Maximum annual USD salary cannot be lower than the minimum.",
      path: ["annualSalaryMaximumUsd"],
    },
  );

export const canonicalExperienceSchema = z
  .strictObject({
    originalText: nullableNonEmptyStringSchema,

    minimumYearsExperience:
      nonNegativeIntegerSchema.nullable(),

    maximumYearsExperience:
      nonNegativeIntegerSchema.nullable(),

    /**
     * Controlled experience-band values will be introduced in Step 8.
     */
    experienceBand: nullableNonEmptyStringSchema,

    confidence: confidenceScoreSchema.nullable(),
    extractionSource: extractionSourceSchema.nullable(),
  })
  .refine(
    ({
      minimumYearsExperience,
      maximumYearsExperience,
    }) =>
      minimumYearsExperience === null ||
      maximumYearsExperience === null ||
      maximumYearsExperience >= minimumYearsExperience,
    {
      error:
        "Maximum years of experience cannot be lower than minimum years.",
      path: ["maximumYearsExperience"],
    },
  );

export const canonicalJobProvenanceSchema = z.strictObject({
  jobSourceId: entityIdSchema.nullable(),
  crawlRunId: entityIdSchema.nullable(),
  rawJobId: entityIdSchema.nullable(),

  sourceType: jobSourceTypeSchema,
  adapterKey: nonEmptyStringSchema,

  fetchedAt: isoDateTimeStringSchema,

  rawContentHash: contentHashSchema.nullable(),
  normalizedContentHash: contentHashSchema.nullable(),
});

export const canonicalJobSchema = z
  .strictObject({
    schemaVersion: z.literal("1.0"),

    externalJobId: nonEmptyStringSchema,

    title: nonEmptyStringSchema,
    normalizedTitle: nullableNonEmptyStringSchema,

    company: canonicalCompanySchema,

    description: nonEmptyStringSchema,

    /**
     * Controlled role-family values will be introduced in Step 8.
     */
    roleFamily: nullableNonEmptyStringSchema,

    roleTags: z.array(canonicalRoleTagSchema),

    location: canonicalLocationSchema,

    experience: canonicalExperienceSchema,

    compensation: canonicalCompensationSchema.nullable(),

    requiredSkills: z.array(
      requiredCanonicalSkillSchema,
    ),

    preferredSkills: z.array(
      preferredCanonicalSkillSchema,
    ),

    implicitSkills: z.array(
      implicitCanonicalSkillSchema,
    ),

    qualifications: z.array(
      canonicalQualificationSchema,
    ),

    certifications: z.array(
      canonicalCertificationSchema,
    ),

    postedDate: isoDateStringSchema.nullable(),
    expiresDate: isoDateStringSchema.nullable(),

    applicationUrl: httpUrlSchema,
    sourceUrl: httpUrlSchema,

    status: jobStatusSchema,

    provenance: canonicalJobProvenanceSchema,

    metadata: jsonObjectSchema,
  })
  .refine(
    ({ roleTags }) =>
      roleTags.filter((roleTag) => roleTag.isPrimary)
        .length <= 1,
    {
      error: "A job cannot have more than one primary role tag.",
      path: ["roleTags"],
    },
  )
  .refine(
    ({ postedDate, expiresDate }) =>
      postedDate === null ||
      expiresDate === null ||
      expiresDate >= postedDate,
    {
      error:
        "Job expiry date cannot be earlier than the posted date.",
      path: ["expiresDate"],
    },
  );

export const normalizationWarningSchema = z.strictObject({
  code: nonEmptyStringSchema.regex(
    /^[A-Z][A-Z0-9_]*$/,
    "Warning code must use uppercase letters, numbers and underscores.",
  ),

  message: nonEmptyStringSchema,

  field: nullableNonEmptyStringSchema,
  originalValue: z.string().nullable(),
});

export const normalizationResultSchema = z.strictObject({
  job: canonicalJobSchema,

  warnings: z.array(normalizationWarningSchema),

  requiresAiEnrichment: z.boolean(),
  requiresManualReview: z.boolean(),
});