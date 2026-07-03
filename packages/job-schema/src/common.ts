/**
 * These aliases document expected string formats.
 *
 * Runtime validation will be added using Zod in Step 7.
 */
export type ISODateString = string;
export type ISODateTimeString = string;

export type CountryCode = string;
export type CurrencyCode = string;

export type EntityId = string;
export type ContentHash = string;

export type ConfidenceScore = number;

export type JsonPrimitive =
  | string
  | number
  | boolean
  | null;

export type JsonValue =
  | JsonPrimitive
  | JsonObject
  | JsonValue[];

export interface JsonObject {
  readonly [key: string]: JsonValue;
}

export interface MoneyRange {
  minimum: number | null;
  maximum: number | null;
}