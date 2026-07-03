import { validateSourceRegistry } from "./validation.js";

const summary = validateSourceRegistry();
const providers = Object.entries(summary.providerCounts)
  .filter(([, count]) => count > 0)
  .map(([provider, count]) => `${provider}: ${count}`)
  .join(" | ");

console.log(
  [
    "Source registry is valid.",
    `${summary.companyCount} companies`,
    `${summary.sourceCount} job sources`,
    `${summary.enabledSourceCount} crawl-enabled`,
    providers,
  ].join(" | "),
);
