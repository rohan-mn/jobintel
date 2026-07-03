import type { Role, RoleFamily } from "./schemas.js";

const defineRoleFamilies = (
  entries: readonly (readonly [slug: string, label: string, description: string])[],
): readonly RoleFamily[] =>
  Object.freeze(
    entries.map(([slug, label, description]) => ({
      id: `role-family:${slug}`,
      slug,
      label,
      description,
      status: "active" as const,
    })),
  );

const defineRoles = (
  familySlug: string,
  entries: readonly (readonly [slug: string, label: string])[],
): readonly Role[] =>
  Object.freeze(
    entries.map(([slug, label]) => ({
      id: `role:${slug}`,
      slug,
      label,
      familyId: `role-family:${familySlug}`,
      status: "active" as const,
    })),
  );

export const ROLE_FAMILIES = defineRoleFamilies(
  [
    ["software-engineering", "Software Engineering", "Application, service, web, mobile, embedded, and firmware engineering roles."],
    ["data-ai", "Data and AI", "Data engineering, analytics, data science, machine learning, and applied AI roles."],
    ["cloud-platform-devops", "Cloud, Platform and DevOps", "Cloud infrastructure, reliability, platform engineering, and delivery automation roles."],
    ["cybersecurity", "Cybersecurity", "Application, cloud, infrastructure, identity, offensive, and defensive security roles."],
    ["quality-engineering", "Quality Engineering", "Manual, automated, performance, and software quality engineering roles."],
    ["architecture", "Architecture", "Solution, software, cloud, enterprise, data, and security architecture roles."],
    ["product-program", "Product and Program Management", "Product, project, program, delivery, and agile coordination roles."],
    ["design-research", "Design and Research", "Product design, user experience, user research, and technical content roles."],
    ["it-operations", "IT Operations and Support", "Systems, networking, database administration, support, and IT operations roles."],
    ["enterprise-applications", "Enterprise Applications", "Roles focused on major enterprise workflow, CRM, ERP, and service-management platforms."],
    ["leadership-management", "Engineering Leadership", "People-management and executive leadership roles across engineering, data, and AI."],
    ["business-analysis-consulting", "Business Analysis and Consulting", "Analysis, implementation, solution consulting, and technical pre-sales roles."],
  ] as const,
);

export const ROLES: readonly Role[] = Object.freeze([
  ...defineRoles(
    "software-engineering",
    [
      ["software-engineer", "Software Engineer"],
      ["backend-engineer", "Backend Engineer"],
      ["frontend-engineer", "Frontend Engineer"],
      ["full-stack-engineer", "Full-Stack Engineer"],
      ["mobile-engineer", "Mobile Engineer"],
      ["ios-engineer", "iOS Engineer"],
      ["android-engineer", "Android Engineer"],
      ["embedded-software-engineer", "Embedded Software Engineer"],
      ["firmware-engineer", "Firmware Engineer"],
      ["game-developer", "Game Developer"],
    ] as const,
  ),
  ...defineRoles(
    "data-ai",
    [
      ["data-engineer", "Data Engineer"],
      ["analytics-engineer", "Analytics Engineer"],
      ["data-analyst", "Data Analyst"],
      ["business-intelligence-engineer", "Business Intelligence Engineer"],
      ["data-scientist", "Data Scientist"],
      ["machine-learning-engineer", "Machine Learning Engineer"],
      ["ai-engineer", "AI Engineer"],
      ["applied-scientist", "Applied Scientist"],
      ["mlops-engineer", "MLOps Engineer"],
      ["nlp-engineer", "NLP Engineer"],
      ["computer-vision-engineer", "Computer Vision Engineer"],
      ["research-scientist", "Research Scientist"],
    ] as const,
  ),
  ...defineRoles(
    "cloud-platform-devops",
    [
      ["devops-engineer", "DevOps Engineer"],
      ["site-reliability-engineer", "Site Reliability Engineer"],
      ["cloud-engineer", "Cloud Engineer"],
      ["platform-engineer", "Platform Engineer"],
      ["infrastructure-engineer", "Infrastructure Engineer"],
      ["build-release-engineer", "Build and Release Engineer"],
    ] as const,
  ),
  ...defineRoles(
    "cybersecurity",
    [
      ["security-engineer", "Security Engineer"],
      ["application-security-engineer", "Application Security Engineer"],
      ["cloud-security-engineer", "Cloud Security Engineer"],
      ["security-analyst", "Security Analyst"],
      ["penetration-tester", "Penetration Tester"],
      ["identity-access-engineer", "Identity and Access Engineer"],
      ["soc-analyst", "SOC Analyst"],
    ] as const,
  ),
  ...defineRoles(
    "quality-engineering",
    [
      ["qa-engineer", "QA Engineer"],
      ["test-automation-engineer", "Test Automation Engineer"],
      ["performance-test-engineer", "Performance Test Engineer"],
      ["software-development-engineer-in-test", "Software Development Engineer in Test"],
    ] as const,
  ),
  ...defineRoles(
    "architecture",
    [
      ["solutions-architect", "Solutions Architect"],
      ["software-architect", "Software Architect"],
      ["cloud-architect", "Cloud Architect"],
      ["enterprise-architect", "Enterprise Architect"],
      ["data-architect", "Data Architect"],
      ["security-architect", "Security Architect"],
    ] as const,
  ),
  ...defineRoles(
    "product-program",
    [
      ["product-manager", "Product Manager"],
      ["technical-product-manager", "Technical Product Manager"],
      ["product-owner", "Product Owner"],
      ["program-manager", "Program Manager"],
      ["technical-program-manager", "Technical Program Manager"],
      ["project-manager", "Project Manager"],
      ["scrum-master", "Scrum Master"],
    ] as const,
  ),
  ...defineRoles(
    "design-research",
    [
      ["product-designer", "Product Designer"],
      ["ux-designer", "UX Designer"],
      ["ui-designer", "UI Designer"],
      ["ux-researcher", "UX Researcher"],
      ["technical-writer", "Technical Writer"],
    ] as const,
  ),
  ...defineRoles(
    "it-operations",
    [
      ["systems-engineer", "Systems Engineer"],
      ["network-engineer", "Network Engineer"],
      ["database-administrator", "Database Administrator"],
      ["support-engineer", "Support Engineer"],
      ["site-support-engineer", "Site Support Engineer"],
      ["it-administrator", "IT Administrator"],
    ] as const,
  ),
  ...defineRoles(
    "enterprise-applications",
    [
      ["salesforce-developer", "Salesforce Developer"],
      ["sap-consultant", "SAP Consultant"],
      ["pega-developer", "Pega Developer"],
      ["servicenow-developer", "ServiceNow Developer"],
      ["camunda-developer", "Camunda Developer"],
    ] as const,
  ),
  ...defineRoles(
    "leadership-management",
    [
      ["engineering-manager", "Engineering Manager"],
      ["senior-engineering-manager", "Senior Engineering Manager"],
      ["director-of-engineering", "Director of Engineering"],
      ["vp-of-engineering", "VP of Engineering"],
      ["head-of-engineering", "Head of Engineering"],
      ["chief-technology-officer", "Chief Technology Officer"],
      ["data-engineering-manager", "Data Engineering Manager"],
      ["machine-learning-manager", "Machine Learning Manager"],
    ] as const,
  ),
  ...defineRoles(
    "business-analysis-consulting",
    [
      ["business-analyst", "Business Analyst"],
      ["systems-analyst", "Systems Analyst"],
      ["solutions-consultant", "Solutions Consultant"],
      ["implementation-consultant", "Implementation Consultant"],
      ["pre-sales-engineer", "Pre-Sales Engineer"],
    ] as const,
  ),
]);

export const ROLE_FAMILY_BY_ID: ReadonlyMap<string, RoleFamily> = new Map(
  ROLE_FAMILIES.map((family) => [family.id, family] as const),
);

export const ROLE_BY_ID: ReadonlyMap<string, Role> = new Map(
  ROLES.map((role) => [role.id, role] as const),
);

export const getRolesForFamily = (familyId: string): readonly Role[] =>
  ROLES.filter((role) => role.familyId === familyId);
