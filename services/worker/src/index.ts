import "dotenv/config";
import { Worker } from "bullmq";
import axios from "axios";
import { QUEUE_NAME, redisConnection } from "./redis.js";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://127.0.0.1:3000";

type IngestJob = {
  source: string;
  sourceJobId?: string;
  title: string;
  company?: string;
  location?: string;
  url: string;
  postedAt?: string;
};

new Worker(
  QUEUE_NAME,
  async (job) => {
    const jobs: IngestJob[] = job.data.jobs;
    if (!Array.isArray(jobs) || jobs.length === 0) return { inserted: 0, skipped: 0 };

    const res = await axios.post(`${API_BASE_URL}/ingest/jobs`, { jobs }, { timeout: 30_000 });
    return res.data;
  },
  { connection: redisConnection }
);

console.log(`[worker] Listening on queue: ${QUEUE_NAME}`);
