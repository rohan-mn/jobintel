import { z } from "zod";

export const companyIdSchema = z
  .string()
  .regex(
    /^company:[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Company IDs must use the company:<kebab-case-slug> format.",
  );

export const sourceIdSchema = z
  .string()
  .regex(
    /^source:[a-z0-9]+(?:-[a-z0-9]+)*:[a-z0-9]+(?:-[a-z0-9]+)*(?::[a-z0-9]+(?:-[a-z0-9]+)*)?$/,
    "Source IDs must use source:<company-slug>:<provider>[:<variant>].",
  );

export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slugs must use lowercase kebab-case.");

export const httpsUrlSchema = z
  .string()
  .url()
  .refine((value) => value.startsWith("https://"), "URLs must use HTTPS.");

export const hostnameSchema = z
  .string()
  .trim()
  .min(1)
  .regex(
    /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/,
    "Hostnames must be lowercase DNS hostnames without a protocol or path.",
  );

export const countryCodeSchema = z
  .string()
  .regex(/^[A-Z]{2}$/, "Country codes must be uppercase ISO-style alpha-2 values.");

export const localeSchema = z
  .string()
  .regex(/^[a-z]{2}(?:-[A-Z]{2})?$/, "Locales must look like en or en-US.");

export const calendarDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Dates must use YYYY-MM-DD.");

export const companyStatusSchema = z.enum(["active", "inactive"]);

export const companyIndustrySchema = z.enum([
  "artificial-intelligence",
  "cybersecurity",
  "design-software",
  "developer-tools",
  "enterprise-software",
  "financial-services",
  "hr-technology",
  "industrial-technology",
  "professional-services",
  "sales-enablement",
  "semiconductors",
  "other",
]);

export const companySchema = z
  .object({
    id: companyIdSchema,
    slug: slugSchema,
    name: z.string().trim().min(1),
    websiteUrl: httpsUrlSchema,
    careersUrl: httpsUrlSchema,
    industry: companyIndustrySchema,
    status: companyStatusSchema,
  })
  .strict();

export const sourceProviderSchema = z.enum([
  "greenhouse",
  "lever",
  "ashby",
  "smartrecruiters",
  "workday",
  "icims",
  "successfactors",
  "taleo",
  "custom",
]);

export const sourceStatusSchema = z.enum(["active", "paused", "retired"]);
export const sourceVerificationStatusSchema = z.enum([
  "verified",
  "unverified",
  "blocked",
]);

export const sourceCoverageSchema = z.discriminatedUnion("mode", [
  z
    .object({
      mode: z.literal("global"),
    })
    .strict(),
  z
    .object({
      mode: z.literal("countries"),
      countryCodes: z.array(countryCodeSchema).min(1),
    })
    .strict(),
]);

export const sourceVerificationSchema = z
  .object({
    status: sourceVerificationStatusSchema,
    lastCheckedAt: calendarDateSchema.nullable(),
  })
  .strict();

const baseJobSourceFields = {
  id: sourceIdSchema,
  companyId: companyIdSchema,
  displayName: z.string().trim().min(1),
  listingUrl: httpsUrlSchema,
  defaultLocale: localeSchema,
  coverage: sourceCoverageSchema,
  status: sourceStatusSchema,
  crawlEnabled: z.boolean(),
  priority: z.number().int().min(1).max(100),
  verification: sourceVerificationSchema,
};

const tokenSchema = z
  .string()
  .trim()
  .min(1)
  .regex(/^[A-Za-z0-9_-]+$/, "Provider tokens may contain letters, numbers, _ and -.");

export const greenhouseSourceSchema = z
  .object({
    ...baseJobSourceFields,
    provider: z.literal("greenhouse"),
    config: z
      .object({
        boardToken: tokenSchema,
      })
      .strict(),
  })
  .strict();

export const leverSourceSchema = z
  .object({
    ...baseJobSourceFields,
    provider: z.literal("lever"),
    config: z
      .object({
        siteSlug: tokenSchema,
      })
      .strict(),
  })
  .strict();

export const ashbySourceSchema = z
  .object({
    ...baseJobSourceFields,
    provider: z.literal("ashby"),
    config: z
      .object({
        organizationSlug: tokenSchema,
      })
      .strict(),
  })
  .strict();

export const smartRecruitersSourceSchema = z
  .object({
    ...baseJobSourceFields,
    provider: z.literal("smartrecruiters"),
    config: z
      .object({
        companyIdentifier: tokenSchema,
      })
      .strict(),
  })
  .strict();

export const workdaySourceSchema = z
  .object({
    ...baseJobSourceFields,
    provider: z.literal("workday"),
    config: z
      .object({
        host: hostnameSchema,
        tenant: tokenSchema,
        site: tokenSchema,
      })
      .strict(),
  })
  .strict();

export const icimsSourceSchema = z
  .object({
    ...baseJobSourceFields,
    provider: z.literal("icims"),
    config: z
      .object({
        host: hostnameSchema,
        sitePath: z.string().trim().min(1).regex(/^[a-z0-9/_-]+$/i),
      })
      .strict(),
  })
  .strict();

export const successFactorsSourceSchema = z
  .object({
    ...baseJobSourceFields,
    provider: z.literal("successfactors"),
    config: z
      .object({
        host: hostnameSchema,
        sitePath: z.string().trim().min(1).startsWith("/"),
        companyIdentifier: tokenSchema.nullable(),
      })
      .strict(),
  })
  .strict();

export const taleoSourceSchema = z
  .object({
    ...baseJobSourceFields,
    provider: z.literal("taleo"),
    config: z
      .object({
        host: hostnameSchema,
        careerSection: tokenSchema,
        pageName: z.string().trim().min(1).regex(/^[A-Za-z0-9_.-]+$/),
        locale: localeSchema,
      })
      .strict(),
  })
  .strict();

export const customSourceSchema = z
  .object({
    ...baseJobSourceFields,
    provider: z.literal("custom"),
    config: z
      .object({
        seedUrls: z.array(httpsUrlSchema).min(1),
      })
      .strict(),
  })
  .strict();

export const jobSourceSchema = z.discriminatedUnion("provider", [
  greenhouseSourceSchema,
  leverSourceSchema,
  ashbySourceSchema,
  smartRecruitersSourceSchema,
  workdaySourceSchema,
  icimsSourceSchema,
  successFactorsSourceSchema,
  taleoSourceSchema,
  customSourceSchema,
]);

export type CompanyId = z.infer<typeof companyIdSchema>;
export type SourceId = z.infer<typeof sourceIdSchema>;
export type CompanyStatus = z.infer<typeof companyStatusSchema>;
export type CompanyIndustry = z.infer<typeof companyIndustrySchema>;
export type Company = z.infer<typeof companySchema>;
export type SourceProvider = z.infer<typeof sourceProviderSchema>;
export type SourceStatus = z.infer<typeof sourceStatusSchema>;
export type SourceCoverage = z.infer<typeof sourceCoverageSchema>;
export type SourceVerification = z.infer<typeof sourceVerificationSchema>;
export type GreenhouseSource = z.infer<typeof greenhouseSourceSchema>;
export type LeverSource = z.infer<typeof leverSourceSchema>;
export type AshbySource = z.infer<typeof ashbySourceSchema>;
export type SmartRecruitersSource = z.infer<typeof smartRecruitersSourceSchema>;
export type WorkdaySource = z.infer<typeof workdaySourceSchema>;
export type IcimsSource = z.infer<typeof icimsSourceSchema>;
export type SuccessFactorsSource = z.infer<typeof successFactorsSourceSchema>;
export type TaleoSource = z.infer<typeof taleoSourceSchema>;
export type CustomSource = z.infer<typeof customSourceSchema>;
export type JobSource = z.infer<typeof jobSourceSchema>;
