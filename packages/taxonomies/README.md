# @jobintel/taxonomies

Controlled taxonomies and curated aliases for jobIntel.

## Governance rules

1. Taxonomy IDs are permanent and must never be renamed after use in stored job data.
2. Labels may be corrected without changing IDs.
3. New entries are appended; obsolete entries are marked `deprecated` rather than deleted.
4. Aliases must map to exactly one canonical role or skill. Ambiguous aliases are not allowed.
5. Do not add seniority stripping, fuzzy matching, or title-classification rules here; those belong to later normalization and classification steps.
6. Geographic hierarchy is `country -> admin1 -> city`, while city-states may use `country -> city`.
7. Experience ranges use an inclusive lower bound and an exclusive upper bound. For example, `3–5 years` represents `3 <= years < 5`.
8. Run `pnpm --filter @jobintel/taxonomies validate` after every taxonomy or alias change.

## Alias behavior

Alias matching is case-insensitive and normalizes Unicode, punctuation, separators, and repeated whitespace. Examples:

- `SRE` -> `role:site-reliability-engineer`
- `Software Developer` -> `role:software-engineer`
- `K8s` -> `skill:kubernetes`
- `Postgres` -> `skill:postgresql`
- `C++` -> `skill:cpp`

Unknown or ambiguous terms resolve to `null`.

## Public helpers

- `resolveRoleTerm(input)`
- `resolveSkillTerm(input)`
- `resolveRoleId(input)`
- `resolveSkillId(input)`
- `getRoleAliases(roleId)`
- `getSkillAliases(skillId)`
- `normalizeAliasText(input)`
- `getRolesForFamily(familyId)`
- `getSkillsForCategory(categoryId)`
- `getExperienceBand(years)`
- `getChildLocations(parentId)`
- `getDescendantLocationIds(locationId)`
- `expandLocationFilter(locationId)`
- `validateTaxonomies()`
