
"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

type Summary = {
  totalJobs: number;
  bySource: Array<{ source: string; count: number }>;
};

type Point = { day: string; count: number };

export default async function DashboardPage() {
  const [summaryRes, tsRes] = await Promise.all([
    fetch("http://localhost:3001/api/summary", { cache: "no-store" }),
    fetch("http://localhost:3001/api/timeseries?days=30", { cache: "no-store" }),
  ]);

  const summary = (await summaryRes.json()) as Summary;
  const series = (await tsRes.json()) as Point[];

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-500">Total jobs</div>
          <div className="text-3xl font-bold">{summary.totalJobs ?? 0}</div>
        </div>

        <div className="rounded-xl border p-4 md:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Jobs over time (last 30 days)</h2>
            <div className="text-sm text-gray-500">{series.length} days</div>
          </div>

          <div className="h-56 mt-3">
            {series.length === 0 ? (
              <div className="text-gray-500 text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series}>
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border p-4">
        <h2 className="text-lg font-semibold mb-3">Jobs by source</h2>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-64">
            {(summary.bySource ?? []).length === 0 ? (
              <div className="text-gray-500 text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.bySource}>
                  <XAxis dataKey="source" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">Source</th>
                  <th className="py-2 pr-4">Count</th>
                </tr>
              </thead>
              <tbody>
                {(summary.bySource ?? []).map((r) => (
                  <tr key={r.source} className="border-b">
                    <td className="py-2 pr-4">{r.source}</td>
                    <td className="py-2 pr-4">{r.count}</td>
                  </tr>
                ))}
                {(summary.bySource ?? []).length === 0 && (
                  <tr>
                    <td className="py-3 text-gray-500" colSpan={2}>
                      No data yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
