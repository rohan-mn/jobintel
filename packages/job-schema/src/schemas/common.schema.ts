import { z } from "zod";

/**
 * Requires meaningful text without modifying the original value.
 *
 * We intentionally do not call `.trim()` because validation should not
 * silently transform data. Normalization will perform transformations later.
 */
export const nonEmptyStringSchema = z
  .string()
  .min(1)
  .refine(
    (value) => value.trim().length > 0,
    {
      error: "Value must contain at least one non-whitespace character.",
    },
  );

export const nullableNonEmptyStringSchema =
  nonEmptyStringSchema.nullable();

export const isoDateStringSchema = z.iso.date();

export const isoDateTimeStringSchema = z.iso.datetime({
  offset: true,
});

export const countryCodeSchema = z
  .string()
  .regex(
    /^[A-Z]{2}$/,
    "Country code must contain exactly two uppercase letters.",
  );

export const currencyCodeSchema = z
  .string()
  .regex(
    /^[A-Z]{3}$/,
    "Currency code must contain exactly three uppercase letters.",
  );

export const entityIdSchema = z.uuid();

export const contentHashSchema = z
  .string()
  .regex(
    /^[a-f0-9]{64}$/,
    "Content hash must be a lowercase SHA-256 hexadecimal value.",
  );

export const confidenceScoreSchema = z
  .number()
  .finite()
  .min(0)
  .max(1);

export const nonNegativeNumberSchema = z
  .number()
  .finite()
  .nonnegative();

export const positiveNumberSchema = z
  .number()
  .finite()
  .positive();

export const nonNegativeIntegerSchema = z
  .number()
  .int()
  .nonnegative();

export const positiveIntegerSchema = z
  .number()
  .int()
  .positive();

export const httpUrlSchema = z.httpUrl();

/**
 * Accepts only values that can be represented in JSON.
 *
 * This excludes undefined, bigint, symbols, functions, dates, maps and sets.
 */
export const jsonValueSchema = z.json();

export const jsonObjectSchema = z.record(
  z.string(),
  jsonValueSchema,
);

export const moneyRangeSchema = z
  .strictObject({
    minimum: nonNegativeNumberSchema.nullable(),
    maximum: nonNegativeNumberSchema.nullable(),
  })
  .refine(
    ({ minimum, maximum }) =>
      minimum === null ||
      maximum === null ||
      maximum >= minimum,
    {
      error: "Maximum amount cannot be lower than minimum amount.",
      path: ["maximum"],
    },
  );