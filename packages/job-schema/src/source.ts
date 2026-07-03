import type {
  ISODateTimeString,
  JsonObject,
  JsonValue,
} from "./common.js";

/**
 * ATS or source implementation family.
 *
 * These are infrastructure source types, not role or skill taxonomy values.
 */
export type JobSourceType =
  | "greenhouse"
  | "lever"
  | "ashby"
  | "smartrecruiters"
  | "workday"
  | "icims"
  | "successfactors"
  | "taleo"
  | "custom";

/**
 * Lightweight job record discovered while crawling a listings page.
 *
 * It may not contain the complete job description.
 */
export interface RawJobListing {
  externalJobId: string;

  title: string | null;
  locationText: string | null;

  sourceUrl: string;
  applicationUrl: string | null;

  postedDateText: string | null;

  metadata: JsonObject;
}

/**
 * Complete response captured from the source.
 *
 * This represents source data before canonical normalization.
 */
export interface RawJobDetails {
  externalJobId: string;

  sourceType: JobSourceType;
  adapterKey: string;

  sourceUrl: string;
  applicationUrl: string | null;

  responseStatus: number | null;
  fetchedAt: ISODateTimeString;

  titleText: string | null;
  companyText: string | null;
  descriptionText: string | null;
  locationText: string | null;
  salaryText: string | null;
  postedDateText: string | null;

  rawPayload: JsonValue;
  rawHtml: string | null;

  metadata: JsonObject;
}