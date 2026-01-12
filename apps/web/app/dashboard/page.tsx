export default async function DashboardPage() {
  const res = await fetch("http://localhost:3001/api/summary", { cache: "no-store" });
  const data = await res.json();

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="rounded-xl border p-4">
        <div className="text-sm text-gray-500">Total jobs</div>
        <div className="text-3xl font-bold">{data.totalJobs ?? 0}</div>
      </div>

      <div className="rounded-xl border p-4">
        <h2 className="text-lg font-semibold mb-3">Jobs by source</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">Source</th>
                <th className="py-2 pr-4">Count</th>
              </tr>
            </thead>
            <tbody>
              {(data.bySource ?? []).map((r: any) => (
                <tr key={r.source} className="border-b">
                  <td className="py-2 pr-4">{r.source}</td>
                  <td className="py-2 pr-4">{r.count}</td>
                </tr>
              ))}
              {(data.bySource ?? []).length === 0 && (
                <tr>
                  <td className="py-3 text-gray-500" colSpan={2}>No data yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
