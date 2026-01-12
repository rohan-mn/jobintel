import "dotenv/config";
import axios from "axios";
import { sleep, withRetries } from "./utils";


const apiBaseUrl = mustGetEnv("API_BASE_URL");



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

function mustGetEnv(name: string): string
{
  const v = process.env[name];
  if (!v || typeof v !== "string" || v.trim().length === 0)
  {
    throw new Error(`Missing env var: ${name}`);
  }
  return v.trim();
}


function toIngestJob(source: string, j: RemoteOkJob): IngestJob | null
{
  const title = (j.position ?? "").trim();
  const url = (j.url ?? "").trim();

  if (!title || !url)
  {
    return null;
  }

  return {
    source,
    sourceJobId: j.id !== undefined ? String(j.id) : (j.slug ? String(j.slug) : undefined),
    title,
    company: j.company?.trim() || undefined,
    location: j.location?.trim() || undefined,
    url,
    postedAt: j.date ? new Date(j.date).toISOString() : undefined,
  };
}

async function fetchRemoteOkJobs(): Promise<RemoteOkJob[]>
{
  // RemoteOK API is a JSON endpoint. First element may be metadata; we’ll filter.
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
  if (!Array.isArray(data))
  {
    throw new Error("RemoteOK returned non-array JSON");
  }

  // Keep only objects that look like jobs
  return data.filter((x: any) => x && typeof x === "object" && ("position" in x || "company" in x || "url" in x));
}

async function ensureApiUp(apiBaseUrl: string) {
  return withRetries(
    () => axios.get(`${apiBaseUrl}/health`, { timeout: 5_000 }),
    { tries: 5, baseDelayMs: 500 }
  );
}

async function main()
{
  

  const apiBaseUrl = mustGetEnv("API_BASE_URL");
  await ensureApiUp(apiBaseUrl);
  const source = process.env.SOURCE?.trim() || "remoteok";

  console.log(`[scraper] Fetching jobs from RemoteOK...`);
  const rawJobs = await fetchRemoteOkJobs();

  const mapped = rawJobs
    .map(j => toIngestJob(source, j))
    .filter((x): x is IngestJob => x !== null);

  console.log(`[scraper] RemoteOK raw: ${rawJobs.length}, mapped: ${mapped.length}`);

  // To be safe with payload sizes, send in chunks
  const chunkSize = 100;
  let insertedTotal = 0;
  let skippedTotal = 0;

  for (let i = 0; i < mapped.length; i += chunkSize)
  {
    const chunk = mapped.slice(i, i + chunkSize);

    // small pacing (polite + avoids bursts)
    await sleep(250);
    

    const url = `${apiBaseUrl}/ingest/jobs`;

    if (i === 0) {
  console.log("[scraper] Payload sample:", JSON.stringify(chunk[0], null, 2));
}


    const res = await withRetries(
  () =>
    axios.post(
      url,
      { jobs: chunk },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 30_000,
      }
    ),
  { tries: 3, baseDelayMs: 800 }
);


    const { inserted, skipped } = res.data ?? {};
    insertedTotal += Number(inserted ?? 0);
    skippedTotal += Number(skipped ?? 0);

    console.log(`[scraper] Sent ${chunk.length} jobs -> inserted=${inserted ?? "?"} skipped=${skipped ?? "?"}`);
  }

  console.log(`[scraper] DONE. insertedTotal=${insertedTotal} skippedTotal=${skippedTotal}`);
}

main().catch((e) =>
{
  if (e.response)
  {
    console.error("[scraper] API ERROR");
    console.error("Status:", e.response.status);
    console.error("Data:", JSON.stringify(e.response.data, null, 2));
  }
  else if (e.request)
  {
    console.error("[scraper] NO RESPONSE FROM API");
    console.error(e.request);
  }
  else
  {
    console.error("[scraper] ERROR:", e.message);
  }

  process.exit(1);
});

