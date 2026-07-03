import { ROLE_ALIASES, SKILL_ALIASES } from "./aliases.js";
import { EXPERIENCE_BANDS } from "./experience.js";
import { LOCATIONS } from "./locations.js";
import { ROLE_FAMILIES, ROLES } from "./roles.js";
import { SKILL_CATEGORIES, SKILLS } from "./skills.js";
import { validateTaxonomies } from "./validation.js";

validateTaxonomies();

console.log(
  [
    "Taxonomies are valid.",
    `${ROLE_FAMILIES.length} role families`,
    `${ROLES.length} roles`,
    `${ROLE_ALIASES.length} role aliases`,
    `${SKILL_CATEGORIES.length} skill categories`,
    `${SKILLS.length} skills`,
    `${SKILL_ALIASES.length} skill aliases`,
    `${EXPERIENCE_BANDS.length} experience bands`,
    `${LOCATIONS.length} locations`,
  ].join(" | "),
);
