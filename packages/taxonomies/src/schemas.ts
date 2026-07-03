import { z } from "zod";

export const taxonomyStatusSchema = z.enum(["active", "deprecated"]);

export const taxonomyIdSchema = z
  .string()
  .min(3)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*(?::[a-z0-9]+(?:-[a-z0-9]+)*)+$/,
    "Taxonomy IDs must be lowercase, stable, namespaced identifiers.",
  );

export const taxonomySlugSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slugs must use lowercase kebab-case.");

const baseTaxonomyEntrySchema = z
  .object({
    id: taxonomyIdSchema,
    slug: taxonomySlugSchema,
    label: z.string().trim().min(1),
    status: taxonomyStatusSchema,
  })
  .strict();

export const roleFamilySchema = baseTaxonomyEntrySchema.extend({
  description: z.string().trim().min(10),
});

export const roleSchema = baseTaxonomyEntrySchema.extend({
  familyId: taxonomyIdSchema,
});

export const skillCategorySchema = baseTaxonomyEntrySchema.extend({
  description: z.string().trim().min(10),
});

export const skillKindSchema = z.enum([
  "language",
  "framework",
  "library",
  "platform",
  "database",
  "tool",
  "concept",
  "standard",
  "methodology",
  "domain",
]);

export const skillSchema = baseTaxonomyEntrySchema.extend({
  categoryId: taxonomyIdSchema,
  kind: skillKindSchema,
});


export const roleAliasSchema = z
  .object({
    alias: z.string().trim().min(1).max(160),
    targetId: taxonomyIdSchema.refine(
      (value) => value.startsWith("role:"),
      "Role alias targets must use the role: namespace.",
    ),
    status: taxonomyStatusSchema,
  })
  .strict();

export const skillAliasSchema = z
  .object({
    alias: z.string().trim().min(1).max(160),
    targetId: taxonomyIdSchema.refine(
      (value) => value.startsWith("skill:"),
      "Skill alias targets must use the skill: namespace.",
    ),
    status: taxonomyStatusSchema,
  })
  .strict();

export const experienceBandSchema = baseTaxonomyEntrySchema.extend({
  minYears: z.number().nonnegative(),
  maxYearsExclusive: z.number().positive().nullable(),
  sortOrder: z.number().int().positive(),
});

export const locationLevelSchema = z.enum(["country", "admin1", "city"]);

export const locationSchema = baseTaxonomyEntrySchema.extend({
  level: locationLevelSchema,
  countryCode: z.string().regex(/^[A-Z]{2}$/, "countryCode must be ISO-style uppercase alpha-2."),
  subdivisionCode: z.string().trim().min(1).max(10).nullable(),
  parentId: taxonomyIdSchema.nullable(),
});

export type TaxonomyStatus = z.infer<typeof taxonomyStatusSchema>;
export type RoleFamily = z.infer<typeof roleFamilySchema>;
export type Role = z.infer<typeof roleSchema>;
export type SkillCategory = z.infer<typeof skillCategorySchema>;
export type SkillKind = z.infer<typeof skillKindSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type RoleAlias = z.infer<typeof roleAliasSchema>;
export type SkillAlias = z.infer<typeof skillAliasSchema>;
export type ExperienceBand = z.infer<typeof experienceBandSchema>;
export type LocationLevel = z.infer<typeof locationLevelSchema>;
export type Location = z.infer<typeof locationSchema>;
