import type { ExperienceBand } from "./schemas.js";

export const EXPERIENCE_BANDS: readonly ExperienceBand[] = Object.freeze([
  {
    id: "experience:0-1-years",
    slug: "0-1-years",
    label: "0–1 years",
    minYears: 0,
    maxYearsExclusive: 1,
    sortOrder: 1,
    status: "active",
  },
  {
    id: "experience:1-3-years",
    slug: "1-3-years",
    label: "1–3 years",
    minYears: 1,
    maxYearsExclusive: 3,
    sortOrder: 2,
    status: "active",
  },
  {
    id: "experience:3-5-years",
    slug: "3-5-years",
    label: "3–5 years",
    minYears: 3,
    maxYearsExclusive: 5,
    sortOrder: 3,
    status: "active",
  },
  {
    id: "experience:5-8-years",
    slug: "5-8-years",
    label: "5–8 years",
    minYears: 5,
    maxYearsExclusive: 8,
    sortOrder: 4,
    status: "active",
  },
  {
    id: "experience:8-10-years",
    slug: "8-10-years",
    label: "8–10 years",
    minYears: 8,
    maxYearsExclusive: 10,
    sortOrder: 5,
    status: "active",
  },
  {
    id: "experience:10-15-years",
    slug: "10-15-years",
    label: "10–15 years",
    minYears: 10,
    maxYearsExclusive: 15,
    sortOrder: 6,
    status: "active",
  },
  {
    id: "experience:15-plus-years",
    slug: "15-plus-years",
    label: "15+ years",
    minYears: 15,
    maxYearsExclusive: null,
    sortOrder: 7,
    status: "active",
  },
]);

export const EXPERIENCE_BAND_BY_ID: ReadonlyMap<string, ExperienceBand> = new Map(
  EXPERIENCE_BANDS.map((band) => [band.id, band] as const),
);

export const getExperienceBand = (years: number): ExperienceBand | undefined => {
  if (!Number.isFinite(years) || years < 0) {
    return undefined;
  }

  return EXPERIENCE_BANDS.find(
    (band) =>
      years >= band.minYears &&
      (band.maxYearsExclusive === null || years < band.maxYearsExclusive),
  );
};
