import { z } from "zod";

import {
  httpUrlSchema,
  isoDateTimeStringSchema,
  jsonObjectSchema,
  jsonValueSchema,
  nonEmptyStringSchema,
  nullableNonEmptyStringSchema,
} from "./common.schema.js";

export const jobSourceTypeValues = [
  "greenhouse",
  "lever",
  "ashby",
  "smartrecruiters",
  "workday",
  "icims",
  "successfactors",
  "taleo",
  "custom",
] as const;

export const jobSourceTypeSchema = z.enum(
  jobSourceTypeValues,
);

export const rawJobListingSchema = z.strictObject({
  externalJobId: nonEmptyStringSchema,

  title: nullableNonEmptyStringSchema,
  locationText: nullableNonEmptyStringSchema,

  sourceUrl: httpUrlSchema,
  applicationUrl: httpUrlSchema.nullable(),

  postedDateText: nullableNonEmptyStringSchema,

  metadata: jsonObjectSchema,
});

export const rawJobDetailsSchema = z.strictObject({
  externalJobId: nonEmptyStringSchema,

  sourceType: jobSourceTypeSchema,
  adapterKey: nonEmptyStringSchema,

  sourceUrl: httpUrlSchema,
  applicationUrl: httpUrlSchema.nullable(),

  responseStatus: z
    .number()
    .int()
    .min(100)
    .max(599)
    .nullable(),

  fetchedAt: isoDateTimeStringSchema,

  titleText: nullableNonEmptyStringSchema,
  companyText: nullableNonEmptyStringSchema,
  descriptionText: nullableNonEmptyStringSchema,
  locationText: nullableNonEmptyStringSchema,
  salaryText: nullableNonEmptyStringSchema,
  postedDateText: nullableNonEmptyStringSchema,

  rawPayload: jsonValueSchema,

  /**
   * Empty HTML is permitted because it may accurately represent the response
   * received from a source.
   */
  rawHtml: z.string().nullable(),

  metadata: jsonObjectSchema,
});