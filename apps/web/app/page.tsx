export default function Home() {
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">JobIntel</h1>
      <div className="flex gap-3">
        <a className="underline" href="/dashboard">Dashboard</a>
        <a className="underline" href="/jobs">Jobs</a>
      </div>
    </main>
  );
}
