import "dotenv/config";
import axios from "axios";
import { sleep, withRetries } from "./utils";
import { jobsQueue, QUEUE_NAME } from "./queue";

type RemoteOkJob = {
  id?: number | string;
  position?: string;
  company?: string;
  location?: string;
  url?: string;
  date?: string; // ISO-like string
  slug?: string;
};

type IngestJob = {
  source: string;
  sourceJobId?: string;
  title: string;
  company?: string;
  location?: string;
  url: string;
  postedAt?: string;
};

function mustGetEnv(name: string): string {
  const v = process.env[name];
  if (!v || typeof v !== "string" || v.trim().length === 0) {
    throw new Error(`Missing env var: ${name}`);
  }
  return v.trim();
}

function toIngestJob(source: string, j: RemoteOkJob): IngestJob | null {
  const title = (j.position ?? "").trim();
  const url = (j.url ?? "").trim();

  if (!title || !url) return null;

  return {
    source,
    sourceJobId:
      j.id !== undefined ? String(j.id) : j.slug ? String(j.slug) : undefined,
    title,
    company: j.company?.trim() || undefined,
    location: j.location?.trim() || undefined,
    url,
    postedAt: j.date ? new Date(j.date).toISOString() : undefined,
  };
}

async function fetchRemoteOkJobs(): Promise<RemoteOkJob[]> {
  const res = await withRetries(
    () =>
      axios.get("https://remoteok.com/api", {
        headers: {
          "User-Agent": "jobintel-scraper/1.0 (+learning project)",
          Accept: "application/json",
        },
        timeout: 30_000,
      }),
    { tries: 3, baseDelayMs: 800 }
  );

  const data = res.data;
  if (!Array.isArray(data)) {
    throw new Error("RemoteOK returned non-array JSON");
  }

  // Keep only objects that look like jobs
  return data.filter(
    (x: any) =>
      x &&
      typeof x === "object" &&
      ("position" in x || "company" in x || "url" in x)
  );
}

async function ensureRedisUp(): Promise<void> {
  // BullMQ will throw when adding if Redis is down, but this gives a cleaner error early.
  await withRetries(
    async () => {
      const client = await jobsQueue.client;
      await client.ping();
    },
    { tries: 5, baseDelayMs: 500 }
  );
}

async function main() {
  const source = process.env.SOURCE?.trim() || "remoteok";

  // Optional but nice: keep API_BASE_URL for later steps; not used in Step 5 producer mode.
  // If you still want to require it, uncomment the next line.
  // mustGetEnv("API_BASE_URL");

  console.log(`[scraper] Queue: ${QUEUE_NAME}`);
  console.log(`[scraper] Ensuring Redis is reachable...`);
  await ensureRedisUp();

  console.log(`[scraper] Fetching jobs from RemoteOK...`);
  const rawJobs = await fetchRemoteOkJobs();

  const mapped = rawJobs
    .map((j) => toIngestJob(source, j))
    .filter((x): x is IngestJob => x !== null);

  console.log(`[scraper] RemoteOK raw: ${rawJobs.length}, mapped: ${mapped.length}`);

  const chunkSize = Number(process.env.CHUNK_SIZE ?? 100);
  const paceMs = Number(process.env.PACE_MS ?? 250);

  let enqueuedJobsTotal = 0;
  let enqueuedChunksTotal = 0;

  for (let i = 0; i < mapped.length; i += chunkSize) {
    const chunk = mapped.slice(i, i + chunkSize);

    // Rate limit / pacing (polite + avoids bursts)
    await sleep(paceMs);

    if (i === 0 && chunk[0]) {
      console.log("[scraper] Payload sample:", JSON.stringify(chunk[0], null, 2));
    }

    // Enqueue chunk with retry/backoff handled by BullMQ itself
    await withRetries(
      () =>
        jobsQueue.add(
          "jobs-chunk",
          { jobs: chunk, source, fetchedAt: new Date().toISOString() },
          {
            attempts: 3,
            backoff: { type: "exponential", delay: 1000 },
            removeOnComplete: true,
            removeOnFail: false,
          }
        ),
      { tries: 3, baseDelayMs: 500 }
    );

    enqueuedJobsTotal += chunk.length;
    enqueuedChunksTotal += 1;

    console.log(`[scraper] Enqueued chunk ${enqueuedChunksTotal} (${chunk.length} jobs)`);
  }

  console.log(
    `[scraper] DONE. enqueuedChunks=${enqueuedChunksTotal} enqueuedJobs=${enqueuedJobsTotal}`
  );

  // Close queue connections so process exits cleanly
  await jobsQueue.close();
}

main().catch((e: any) => {
  // Axios errors (RemoteOK fetch) + BullMQ/Redis errors
  if (e?.response) {
    console.error("[scraper] HTTP ERROR");
    console.error("Status:", e.response.status);
    console.error("Data:", JSON.stringify(e.response.data, null, 2));
  } else {
    console.error("[scraper] ERROR:", e?.message ?? e);
    if (e?.stack) console.error(e.stack);
  }
  process.exit(1);
});
