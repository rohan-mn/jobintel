import "dotenv/config";
import { Worker } from "bullmq";
import axios from "axios";
import { QUEUE_NAME, redisConnection } from "./redis.js";

/* =======================
   Types
======================= */
type WorkMode = "REMOTE" | "ONSITE" | "HYBRID" | "UNKNOWN";
type ExperienceLevel = "INTERN" | "JUNIOR" | "MID" | "SENIOR" | "LEAD" | "UNKNOWN";
type RoleCategory =
  | "BACKEND"
  | "FRONTEND"
  | "FULLSTACK"
  | "DATA"
  | "ML"
  | "DEVOPS"
  | "SECURITY"
  | "MOBILE"
  | "QA"
  | "PM"
  | "OTHER";

type IngestJob = {
  source: string;
  sourceJobId?: string;
  title: string;
  company?: string;
  location?: string;
  url: string;
  postedAt?: string;

  // enrichment fields (optional)
  workMode?: WorkMode;
  experienceLevel?: ExperienceLevel;
  roleCategory?: RoleCategory;
};

/* =======================
   Classification logic
======================= */
function classify(job: IngestJob): {
  workMode: WorkMode;
  experienceLevel: ExperienceLevel;
  roleCategory: RoleCategory;
} {
  const title = (job.title ?? "").toLowerCase();
  const loc = (job.location ?? "").toLowerCase();

  // Work mode
  let workMode: WorkMode = "UNKNOWN";
  if (title.includes("remote") || loc.includes("remote") || loc.includes("anywhere")) {
    workMode = "REMOTE";
  } else if (title.includes("hybrid") || loc.includes("hybrid")) {
    workMode = "HYBRID";
  } else if (title.includes("onsite") || title.includes("on-site") || loc.includes("onsite")) {
    workMode = "ONSITE";
  }

  // Experience
  let experienceLevel: ExperienceLevel = "UNKNOWN";
  if (title.includes("intern")) experienceLevel = "INTERN";
  else if (title.includes("junior") || title.includes("jr")) experienceLevel = "JUNIOR";
  else if (title.includes("senior") || title.includes("sr") || title.includes("staff") || title.includes("principal"))
    experienceLevel = "SENIOR";
  else if (title.includes("lead") || title.includes("manager") || title.includes("head"))
    experienceLevel = "LEAD";
  else if (title.includes("engineer") || title.includes("developer"))
    experienceLevel = "MID";

  // Role category
  let roleCategory: RoleCategory = "OTHER";
  if (title.includes("backend") || title.includes("back end") || title.includes("api"))
    roleCategory = "BACKEND";
  else if (title.includes("frontend") || title.includes("front end") || title.includes("ui"))
    roleCategory = "FRONTEND";
  else if (title.includes("fullstack") || title.includes("full stack"))
    roleCategory = "FULLSTACK";
  else if (title.includes("devops") || title.includes("sre"))
    roleCategory = "DEVOPS";
  else if (title.includes("data engineer") || title.includes("data analyst"))
    roleCategory = "DATA";
  else if (title.includes("machine learning") || title.includes("ml engineer") || title.includes("ai "))
    roleCategory = "ML";
  else if (title.includes("security") || title.includes("infosec"))
    roleCategory = "SECURITY";
  else if (title.includes("mobile") || title.includes("android") || title.includes("ios"))
    roleCategory = "MOBILE";
  else if (title.includes("qa") || title.includes("test") || title.includes("sdet"))
    roleCategory = "QA";
  else if (title.includes("product manager") || title.includes(" pm "))
    roleCategory = "PM";

  return { workMode, experienceLevel, roleCategory };
}

/* =======================
   Worker
======================= */
const API_BASE_URL = process.env.API_BASE_URL ?? "http://127.0.0.1:3000";

new Worker(
  QUEUE_NAME,
  async (job) => {
    const rawJobs: IngestJob[] = job.data.jobs;

    if (!Array.isArray(rawJobs) || rawJobs.length === 0) {
      return { inserted: 0, skipped: 0 };
    }

    // ✅ ENRICH JOBS HERE
    const enrichedJobs = rawJobs.map((j) => ({
      ...j,
      ...classify(j),
    }));

    const res = await axios.post(
      `${API_BASE_URL}/ingest/jobs`,
      { jobs: enrichedJobs },
      { timeout: 30_000 }
    );

    return res.data;
  },
  { connection: redisConnection }
);

console.log(`[worker] Listening on queue: ${QUEUE_NAME}`);
