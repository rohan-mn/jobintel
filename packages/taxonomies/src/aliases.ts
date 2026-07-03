import type { Role, RoleAlias, Skill, SkillAlias } from "./schemas.js";
import { ROLES } from "./roles.js";
import { SKILLS } from "./skills.js";

type AliasGroup = readonly [targetSlug: string, aliases: readonly string[]];

type MatchKind = "canonical-id" | "canonical-label" | "canonical-slug" | "alias";

export type RoleTermResolution = Readonly<{
  input: string;
  normalizedInput: string;
  matchedBy: MatchKind;
  matchedTerm: string;
  role: Role;
}>;

export type SkillTermResolution = Readonly<{
  input: string;
  normalizedInput: string;
  matchedBy: MatchKind;
  matchedTerm: string;
  skill: Skill;
}>;

export function normalizeAliasText(value: string): string {
  return value
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/&/gu, " and ")
    .replace(/\+/gu, " plus ")
    .replace(/#/gu, " sharp ")
    .replace(/[’'`]/gu, "")
    .replace(/[._/\\-]+/gu, " ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function defineRoleAliases(groups: readonly AliasGroup[]): readonly RoleAlias[] {
  return Object.freeze(
    groups.flatMap(([targetSlug, aliases]) =>
      aliases.map((alias) => ({
        alias,
        targetId: `role:${targetSlug}`,
        status: "active" as const,
      })),
    ),
  );
}

function defineSkillAliases(groups: readonly AliasGroup[]): readonly SkillAlias[] {
  return Object.freeze(
    groups.flatMap(([targetSlug, aliases]) =>
      aliases.map((alias) => ({
        alias,
        targetId: `skill:${targetSlug}`,
        status: "active" as const,
      })),
    ),
  );
}

export const ROLE_ALIASES: readonly RoleAlias[] = defineRoleAliases([
  ["software-engineer", ["Software Developer", "Application Developer", "Application Engineer", "SWE", "SDE", "Software Development Engineer"]],
  ["backend-engineer", ["Back-End Engineer", "Backend Developer", "Back-End Developer", "Server-Side Engineer", "Server Side Developer"]],
  ["frontend-engineer", ["Front-End Engineer", "Frontend Developer", "Front-End Developer", "Web UI Engineer"]],
  ["full-stack-engineer", ["Full Stack Developer", "Fullstack Engineer", "Fullstack Developer"]],
  ["mobile-engineer", ["Mobile App Developer", "Mobile Application Developer"]],
  ["ios-engineer", ["iOS Developer", "Apple Platform Engineer"]],
  ["android-engineer", ["Android Developer"]],
  ["embedded-software-engineer", ["Embedded Software Developer", "Embedded Engineer"]],
  ["firmware-engineer", ["Firmware Developer"]],
  ["game-developer", ["Game Engineer", "Gameplay Engineer"]],
  ["data-engineer", ["Big Data Engineer", "Data Pipeline Engineer"]],
  ["analytics-engineer", ["Analytics Developer"]],
  ["data-analyst", ["Reporting Analyst", "Data Analytics Analyst"]],
  ["business-intelligence-engineer", ["BI Engineer", "Business Intelligence Developer", "BI Developer"]],
  ["machine-learning-engineer", ["ML Engineer", "Machine Learning Developer"]],
  ["ai-engineer", ["Artificial Intelligence Engineer", "Generative AI Engineer", "GenAI Engineer"]],
  ["applied-scientist", ["Applied Research Scientist"]],
  ["mlops-engineer", ["ML Ops Engineer", "Machine Learning Operations Engineer"]],
  ["nlp-engineer", ["Natural Language Processing Engineer"]],
  ["computer-vision-engineer", ["CV Engineer", "Vision Engineer"]],
  ["research-scientist", ["AI Research Scientist", "ML Research Scientist"]],
  ["devops-engineer", ["Dev Ops Engineer"]],
  ["site-reliability-engineer", ["SRE", "Reliability Engineer"]],
  ["platform-engineer", ["Developer Platform Engineer", "Internal Platform Engineer"]],
  ["build-release-engineer", ["Release Engineer", "Build Engineer", "CI/CD Engineer", "CICD Engineer"]],
  ["security-engineer", ["Cybersecurity Engineer", "Cyber Security Engineer"]],
  ["application-security-engineer", ["AppSec Engineer", "Application Security Specialist"]],
  ["cloud-security-engineer", ["Cloud Security Specialist"]],
  ["security-analyst", ["Cybersecurity Analyst", "Cyber Security Analyst", "Information Security Analyst"]],
  ["penetration-tester", ["Pentester", "Penetration Testing Engineer", "Ethical Hacker"]],
  ["identity-access-engineer", ["IAM Engineer", "Identity Engineer", "Access Management Engineer"]],
  ["soc-analyst", ["Security Operations Center Analyst", "Security Operations Analyst"]],
  ["qa-engineer", ["Quality Assurance Engineer", "Quality Engineer", "Software Tester", "QA Analyst"]],
  ["test-automation-engineer", ["Automation Test Engineer", "QA Automation Engineer", "Automation QA Engineer"]],
  ["performance-test-engineer", ["Performance Testing Engineer", "Load Test Engineer"]],
  ["software-development-engineer-in-test", ["SDET", "Software Engineer in Test"]],
  ["solutions-architect", ["Solution Architect"]],
  ["software-architect", ["Application Architect"]],
  ["cloud-architect", ["Cloud Solutions Architect"]],
  ["enterprise-architect", ["Enterprise Solutions Architect"]],
  ["product-manager", ["Product Management Manager"]],
  ["technical-product-manager", ["Technical PM"]],
  ["product-owner", ["Agile Product Owner"]],
  ["program-manager", ["Programme Manager"]],
  ["technical-program-manager", ["Technical Programme Manager", "TPM"]],
  ["project-manager", ["Technology Project Manager", "IT Project Manager"]],
  ["scrum-master", ["Agile Scrum Master"]],
  ["product-designer", ["Digital Product Designer"]],
  ["ux-designer", ["User Experience Designer"]],
  ["ui-designer", ["User Interface Designer"]],
  ["ux-researcher", ["User Experience Researcher"]],
  ["technical-writer", ["Technical Documentation Writer"]],
  ["systems-engineer", ["System Engineer"]],
  ["database-administrator", ["DBA", "Database Admin"]],
  ["support-engineer", ["Technical Support Engineer", "Application Support Engineer"]],
  ["it-administrator", ["IT Admin"]],
  ["salesforce-developer", ["Salesforce Engineer", "SFDC Developer"]],
  ["sap-consultant", ["SAP Functional Consultant", "SAP Technical Consultant"]],
  ["pega-developer", ["Pega Engineer"]],
  ["servicenow-developer", ["ServiceNow Engineer"]],
  ["camunda-developer", ["Camunda Engineer"]],
  ["engineering-manager", ["Software Engineering Manager", "Development Manager"]],
  ["senior-engineering-manager", ["Senior Software Engineering Manager"]],
  ["director-of-engineering", ["Engineering Director"]],
  ["vp-of-engineering", ["Vice President of Engineering", "Engineering VP"]],
  ["head-of-engineering", ["Engineering Head"]],
  ["chief-technology-officer", ["CTO", "Chief Technical Officer"]],
  ["data-engineering-manager", ["Manager of Data Engineering"]],
  ["machine-learning-manager", ["ML Engineering Manager", "Machine Learning Engineering Manager"]],
  ["business-analyst", ["IT Business Analyst", "Technology Business Analyst"]],
  ["systems-analyst", ["System Analyst"]],
  ["solutions-consultant", ["Solution Consultant"]],
  ["implementation-consultant", ["Implementation Specialist"]],
  ["pre-sales-engineer", ["Presales Engineer", "Sales Engineer"]],
] as const);

export const SKILL_ALIASES: readonly SkillAlias[] = defineSkillAliases([
  ["javascript", ["JS", "ECMAScript"]],
  ["typescript", ["TS"]],
  ["python", ["Python 3"]],
  ["java", ["Java SE", "Core Java"]],
  ["go", ["Golang"]],
  ["react", ["ReactJS", "React.js"]],
    ["vuejs", ["Vue"]],
  ["tailwind-css", ["Tailwind", "TailwindCSS"]],
  ["nodejs", ["Node"]],
  ["expressjs", ["Express"]],
  ["nestjs", ["Nest", "Nest.js"]],
  ["spring-boot", ["SpringBoot", "Spring Boot Framework"]],
  ["aspnet-core", ["ASP.NET", ".NET Core", "Dotnet Core"]],
  ["ruby-on-rails", ["Rails"]],
  ["rest-api", ["REST", "RESTful API", "REST APIs"]],
  ["react-native", ["ReactNative"]],
  ["apache-spark", ["Spark"]],
  ["apache-hadoop", ["Hadoop"]],
  ["apache-airflow", ["Airflow"]],
  ["apache-flink", ["Flink"]],
  ["apache-beam", ["Beam"]],
  ["bigquery", ["Google BigQuery"]],
    ["azure-data-factory", ["ADF"]],
  ["power-bi", ["PowerBI"]],
  ["microsoft-excel", ["Excel", "MS Excel"]],
  ["scikit-learn", ["sklearn"]],
  ["hugging-face", ["HuggingFace", "HF Transformers"]],
  ["large-language-models", ["LLM", "LLMs"]],
  ["retrieval-augmented-generation", ["RAG"]],
  ["natural-language-processing", ["NLP"]],
  ["computer-vision", ["CV"]],
  ["generative-ai", ["GenAI", "Gen AI"]],
  ["postgresql", ["Postgres", "Postgre SQL"]],
  ["microsoft-sql-server", ["SQL Server", "MS SQL Server", "MSSQL"]],
  ["oracle-database", ["Oracle DB"]],
  ["mongodb", ["Mongo", "Mongo DB"]],
  ["elasticsearch", ["Elastic Search"]],
  ["dynamodb", ["Dynamo DB"]],
  ["aws", ["Amazon AWS"]],
  ["microsoft-azure", ["Azure"]],
  ["google-cloud", ["GCP", "Google Cloud Platform"]],
  ["aws-ec2", ["EC2"]],
  ["aws-lambda", ["Lambda"]],
  ["aws-s3", ["S3"]],
  ["aws-eks", ["EKS"]],
  ["aws-ecs", ["ECS"]],
  ["azure-aks", ["AKS"]],
  ["google-gke", ["GKE"]],
  ["google-cloud-run", ["Cloud Run"]],
  ["github-actions", ["GHA"]],
  ["gitlab-ci", ["GitLab CICD"]],
  ["argo-cd", ["ArgoCD"]],
  ["kubernetes", ["K8s", "Kube"]],
  ["openshift", ["Open Shift"]],
  ["apache-kafka", ["Kafka"]],
  ["aws-sqs", ["SQS"]],
  ["aws-sns", ["SNS"]],
  ["amazon-kinesis", ["Kinesis"]],
  ["google-pubsub", ["Google Pub/Sub", "PubSub"]],
  ["end-to-end-testing", ["E2E Testing", "End to End Tests"]],
  ["test-automation", ["Automated Testing", "Automation Testing"]],
  ["oauth2", ["OAuth", "OAuth 2"]],
  ["openid-connect", ["OIDC"]],
    ["hashicorp-vault", ["Vault"]],
  ["spiffe-spire", ["SPIFFE", "SPIRE"]],
  ["owasp-zap", ["ZAP", "Zed Attack Proxy"]],
  ["identity-access-management", ["IAM"]],
  ["sast", ["Static Analysis Security Testing"]],
  ["dast", ["Dynamic Analysis Security Testing"]],
  ["opentelemetry", ["Open Telemetry", "OTel"]],
  ["elastic-stack", ["ELK", "ELK Stack"]],
  ["event-driven-architecture", ["EDA"]],
  ["domain-driven-design", ["DDD"]],
  ["macos", ["Mac OS", "OS X", "OSX"]],
  ["salesforce", ["SFDC"]],
  ["servicenow", ["Service Now"]],
  ["fincrime", ["Fin Crime"]],
    ] as const);

type IndexedRoleTerm = Readonly<{
  role: Role;
  matchedBy: Exclude<MatchKind, "canonical-id">;
  matchedTerm: string;
}>;

type IndexedSkillTerm = Readonly<{
  skill: Skill;
  matchedBy: Exclude<MatchKind, "canonical-id">;
  matchedTerm: string;
}>;

function addRoleTerm(
  index: Map<string, IndexedRoleTerm>,
  term: string,
  role: Role,
  matchedBy: IndexedRoleTerm["matchedBy"],
): void {
  const normalizedTerm = normalizeAliasText(term);
  const existing = index.get(normalizedTerm);

  if (existing !== undefined && existing.role.id !== role.id) {
    throw new Error(
      `Role alias collision: "${term}" resolves to both "${existing.role.id}" and "${role.id}".`,
    );
  }

  if (existing === undefined) {
    index.set(normalizedTerm, { role, matchedBy, matchedTerm: term });
  }
}

function addSkillTerm(
  index: Map<string, IndexedSkillTerm>,
  term: string,
  skill: Skill,
  matchedBy: IndexedSkillTerm["matchedBy"],
): void {
  const normalizedTerm = normalizeAliasText(term);
  const existing = index.get(normalizedTerm);

  if (existing !== undefined && existing.skill.id !== skill.id) {
    throw new Error(
      `Skill alias collision: "${term}" resolves to both "${existing.skill.id}" and "${skill.id}".`,
    );
  }

  if (existing === undefined) {
    index.set(normalizedTerm, { skill, matchedBy, matchedTerm: term });
  }
}

const ROLE_BY_ID = new Map(ROLES.map((role) => [role.id, role] as const));
const SKILL_BY_ID = new Map(SKILLS.map((skill) => [skill.id, skill] as const));
const ROLE_TERM_INDEX = new Map<string, IndexedRoleTerm>();
const SKILL_TERM_INDEX = new Map<string, IndexedSkillTerm>();

for (const role of ROLES) {
  addRoleTerm(ROLE_TERM_INDEX, role.label, role, "canonical-label");
  addRoleTerm(ROLE_TERM_INDEX, role.slug, role, "canonical-slug");
}

for (const alias of ROLE_ALIASES) {
  const role = ROLE_BY_ID.get(alias.targetId);
  if (role !== undefined && alias.status === "active") {
    addRoleTerm(ROLE_TERM_INDEX, alias.alias, role, "alias");
  }
}

for (const skill of SKILLS) {
  addSkillTerm(SKILL_TERM_INDEX, skill.label, skill, "canonical-label");
  addSkillTerm(SKILL_TERM_INDEX, skill.slug, skill, "canonical-slug");
}

for (const alias of SKILL_ALIASES) {
  const skill = SKILL_BY_ID.get(alias.targetId);
  if (skill !== undefined && alias.status === "active") {
    addSkillTerm(SKILL_TERM_INDEX, alias.alias, skill, "alias");
  }
}

export function resolveRoleTerm(input: string): RoleTermResolution | null {
  const trimmedInput = input.trim();
  const roleById = ROLE_BY_ID.get(trimmedInput);

  if (roleById !== undefined) {
    return {
      input,
      normalizedInput: trimmedInput,
      matchedBy: "canonical-id",
      matchedTerm: trimmedInput,
      role: roleById,
    };
  }

  const normalizedInput = normalizeAliasText(input);
  if (normalizedInput.length === 0) {
    return null;
  }

  const match = ROLE_TERM_INDEX.get(normalizedInput);
  return match === undefined
    ? null
    : {
        input,
        normalizedInput,
        matchedBy: match.matchedBy,
        matchedTerm: match.matchedTerm,
        role: match.role,
      };
}

export function resolveSkillTerm(input: string): SkillTermResolution | null {
  const trimmedInput = input.trim();
  const skillById = SKILL_BY_ID.get(trimmedInput);

  if (skillById !== undefined) {
    return {
      input,
      normalizedInput: trimmedInput,
      matchedBy: "canonical-id",
      matchedTerm: trimmedInput,
      skill: skillById,
    };
  }

  const normalizedInput = normalizeAliasText(input);
  if (normalizedInput.length === 0) {
    return null;
  }

  const match = SKILL_TERM_INDEX.get(normalizedInput);
  return match === undefined
    ? null
    : {
        input,
        normalizedInput,
        matchedBy: match.matchedBy,
        matchedTerm: match.matchedTerm,
        skill: match.skill,
      };
}

export function resolveRoleId(input: string): string | null {
  return resolveRoleTerm(input)?.role.id ?? null;
}

export function resolveSkillId(input: string): string | null {
  return resolveSkillTerm(input)?.skill.id ?? null;
}

export function getRoleAliases(roleId: string): readonly string[] {
  return Object.freeze(
    ROLE_ALIASES.filter((alias) => alias.targetId === roleId).map((alias) => alias.alias),
  );
}

export function getSkillAliases(skillId: string): readonly string[] {
  return Object.freeze(
    SKILL_ALIASES.filter((alias) => alias.targetId === skillId).map((alias) => alias.alias),
  );
}
