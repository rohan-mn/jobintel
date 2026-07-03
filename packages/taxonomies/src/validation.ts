import {
  experienceBandSchema,
  locationSchema,
  roleAliasSchema,
  roleFamilySchema,
  roleSchema,
  skillAliasSchema,
  skillCategorySchema,
  skillSchema,
  type Location,
} from "./schemas.js";
import { ROLE_ALIASES, SKILL_ALIASES, normalizeAliasText } from "./aliases.js";
import { EXPERIENCE_BANDS } from "./experience.js";
import { LOCATIONS } from "./locations.js";
import { ROLE_FAMILIES, ROLES } from "./roles.js";
import { SKILL_CATEGORIES, SKILLS } from "./skills.js";

function assertCondition(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Taxonomy validation failed: ${message}`);
  }
}

function assertUniqueIds(
  entries: readonly { id: string }[],
  taxonomyName: string,
): void {
  const seen = new Set<string>();

  for (const entry of entries) {
    assertCondition(
      !seen.has(entry.id),
      `${taxonomyName} contains duplicate ID "${entry.id}".`,
    );
    seen.add(entry.id);
  }
}

function assertUniqueSlugs(
  entries: readonly { slug: string }[],
  taxonomyName: string,
): void {
  const seen = new Set<string>();

  for (const entry of entries) {
    assertCondition(
      !seen.has(entry.slug),
      `${taxonomyName} contains duplicate slug "${entry.slug}".`,
    );
    seen.add(entry.slug);
  }
}

function validateRoleTaxonomy(): void {
  roleFamilySchema.array().parse(ROLE_FAMILIES);
  roleSchema.array().parse(ROLES);

  assertUniqueIds(ROLE_FAMILIES, "role families");
  assertUniqueSlugs(ROLE_FAMILIES, "role families");
  assertUniqueIds(ROLES, "roles");
  assertUniqueSlugs(ROLES, "roles");

  const familyIds = new Set(ROLE_FAMILIES.map((family) => family.id));

  for (const family of ROLE_FAMILIES) {
    assertCondition(
      family.id === `role-family:${family.slug}`,
      `role family "${family.id}" does not match its slug.`,
    );
  }

  for (const role of ROLES) {
    assertCondition(
      role.id === `role:${role.slug}`,
      `role "${role.id}" does not match its slug.`,
    );
    assertCondition(
      familyIds.has(role.familyId),
      `role "${role.id}" references missing family "${role.familyId}".`,
    );
  }
}

function validateSkillTaxonomy(): void {
  skillCategorySchema.array().parse(SKILL_CATEGORIES);
  skillSchema.array().parse(SKILLS);

  assertUniqueIds(SKILL_CATEGORIES, "skill categories");
  assertUniqueSlugs(SKILL_CATEGORIES, "skill categories");
  assertUniqueIds(SKILLS, "skills");
  assertUniqueSlugs(SKILLS, "skills");

  const categoryIds = new Set(SKILL_CATEGORIES.map((category) => category.id));

  for (const category of SKILL_CATEGORIES) {
    assertCondition(
      category.id === `skill-category:${category.slug}`,
      `skill category "${category.id}" does not match its slug.`,
    );
  }

  for (const skill of SKILLS) {
    assertCondition(
      skill.id === `skill:${skill.slug}`,
      `skill "${skill.id}" does not match its slug.`,
    );
    assertCondition(
      categoryIds.has(skill.categoryId),
      `skill "${skill.id}" references missing category "${skill.categoryId}".`,
    );
  }
}

function validateExperienceTaxonomy(): void {
  experienceBandSchema.array().parse(EXPERIENCE_BANDS);

  assertUniqueIds(EXPERIENCE_BANDS, "experience bands");
  assertUniqueSlugs(EXPERIENCE_BANDS, "experience bands");

  const orderedBands = [...EXPERIENCE_BANDS].sort(
    (left, right) => left.sortOrder - right.sortOrder,
  );

  for (const [index, band] of orderedBands.entries()) {
    assertCondition(
      band.id === `experience:${band.slug}`,
      `experience band "${band.id}" does not match its slug.`,
    );
    assertCondition(
      band.sortOrder === index + 1,
      `experience band "${band.id}" has a non-contiguous sort order.`,
    );

    if (band.maxYearsExclusive !== null) {
      assertCondition(
        band.maxYearsExclusive > band.minYears,
        `experience band "${band.id}" has an invalid range.`,
      );
    } else {
      assertCondition(
        index === orderedBands.length - 1,
        `only the final experience band may be open-ended.`,
      );
    }

    const nextBand = orderedBands[index + 1];
    if (nextBand !== undefined) {
      assertCondition(
        band.maxYearsExclusive === nextBand.minYears,
        `experience bands "${band.id}" and "${nextBand.id}" contain a gap or overlap.`,
      );
    }
  }
}

function validateLocationHierarchy(): void {
  locationSchema.array().parse(LOCATIONS);

  assertUniqueIds(LOCATIONS, "locations");

  const locationById = new Map<string, Location>(
    LOCATIONS.map((location) => [location.id, location] as const),
  );

  for (const location of LOCATIONS) {
    assertCondition(
      location.id.startsWith(`location:${location.level}:`),
      `location "${location.id}" does not match level "${location.level}".`,
    );

    if (location.level === "country") {
      assertCondition(
        location.parentId === null,
        `country "${location.id}" must not have a parent.`,
      );
      assertCondition(
        location.subdivisionCode === null,
        `country "${location.id}" must not have a subdivision code.`,
      );
      continue;
    }

    assertCondition(
      location.parentId !== null,
      `location "${location.id}" must have a parent.`,
    );

    const parent = locationById.get(location.parentId);
    assertCondition(
      parent !== undefined,
      `location "${location.id}" references missing parent "${location.parentId}".`,
    );
    assertCondition(
      parent.countryCode === location.countryCode,
      `location "${location.id}" has a different country code from its parent.`,
    );

    if (location.level === "admin1") {
      assertCondition(
        parent.level === "country",
        `admin1 location "${location.id}" must be beneath a country.`,
      );
      assertCondition(
        location.subdivisionCode !== null,
        `admin1 location "${location.id}" must have a subdivision code.`,
      );
    }

    if (location.level === "city") {
      assertCondition(
        parent.level === "admin1" || parent.level === "country",
        `city "${location.id}" must be beneath an admin1 location or country.`,
      );
      if (parent.level === "admin1") {
        assertCondition(
          location.subdivisionCode === parent.subdivisionCode,
          `city "${location.id}" must inherit its parent's subdivision code.`,
        );
      }
    }

    const visited = new Set<string>([location.id]);
    let cursor: Location | undefined = location;

    while (cursor.parentId !== null) {
      assertCondition(
        !visited.has(cursor.parentId),
        `location hierarchy contains a cycle at "${cursor.parentId}".`,
      );
      visited.add(cursor.parentId);
      cursor = locationById.get(cursor.parentId);
      assertCondition(cursor !== undefined, "location hierarchy traversal failed.");
    }
  }
}


function validateAliasSet(
  aliases: readonly { alias: string; targetId: string }[],
  canonicalEntries: readonly { id: string; label: string; slug: string }[],
  taxonomyName: string,
): void {
  const canonicalIds = new Set(canonicalEntries.map((entry) => entry.id));
  const canonicalTerms = new Map<string, string>();
  const explicitTerms = new Map<string, string>();

  for (const entry of canonicalEntries) {
    for (const term of [entry.label, entry.slug]) {
      const normalizedTerm = normalizeAliasText(term);
      const existingTargetId = canonicalTerms.get(normalizedTerm);

      assertCondition(
        existingTargetId === undefined || existingTargetId === entry.id,
        `${taxonomyName} canonical term "${term}" collides between "${existingTargetId}" and "${entry.id}".`,
      );

      canonicalTerms.set(normalizedTerm, entry.id);
    }
  }

  for (const alias of aliases) {
    assertCondition(
      canonicalIds.has(alias.targetId),
      `${taxonomyName} alias "${alias.alias}" references missing target "${alias.targetId}".`,
    );

    const normalizedAlias = normalizeAliasText(alias.alias);
    assertCondition(
      normalizedAlias.length > 0,
      `${taxonomyName} alias "${alias.alias}" normalizes to an empty string.`,
    );

    const canonicalTargetId = canonicalTerms.get(normalizedAlias);
    assertCondition(
      canonicalTargetId === undefined,
      canonicalTargetId === alias.targetId
        ? `${taxonomyName} alias "${alias.alias}" duplicates a canonical label or slug.`
        : `${taxonomyName} alias "${alias.alias}" collides with canonical target "${canonicalTargetId}".`,
    );

    const existingTargetId = explicitTerms.get(normalizedAlias);
    assertCondition(
      existingTargetId === undefined,
      existingTargetId === alias.targetId
        ? `${taxonomyName} alias "${alias.alias}" is duplicated after normalization.`
        : `${taxonomyName} alias "${alias.alias}" maps to both "${existingTargetId}" and "${alias.targetId}".`,
    );

    explicitTerms.set(normalizedAlias, alias.targetId);
  }
}

function validateAliasTaxonomies(): void {
  roleAliasSchema.array().parse(ROLE_ALIASES);
  skillAliasSchema.array().parse(SKILL_ALIASES);

  validateAliasSet(ROLE_ALIASES, ROLES, "role");
  validateAliasSet(SKILL_ALIASES, SKILLS, "skill");
}

export function validateTaxonomies(): void {
  validateRoleTaxonomy();
  validateSkillTaxonomy();
  validateAliasTaxonomies();
  validateExperienceTaxonomy();
  validateLocationHierarchy();

  assertUniqueIds(
    [
      ...ROLE_FAMILIES,
      ...ROLES,
      ...SKILL_CATEGORIES,
      ...SKILLS,
      ...EXPERIENCE_BANDS,
      ...LOCATIONS,
    ],
    "combined taxonomies",
  );
}
