import { NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://127.0.0.1:3000";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const days = url.searchParams.get("days") ?? "30";

  const upstream = await fetch(
    `${API_BASE_URL}/ingest/analytics/timeseries?days=${encodeURIComponent(days)}`,
    { cache: "no-store" }
  );

  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}
