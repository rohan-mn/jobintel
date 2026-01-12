type SearchParams = {
  q?: string;
  company?: string;
  location?: string;
  take?: string;
  skip?: string;
};

function qsFrom(params: SearchParams) {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.company) sp.set("company", params.company);
  if (params.location) sp.set("location", params.location);
  sp.set("take", params.take ?? "25");
  sp.set("skip", params.skip ?? "0");
  return sp.toString();
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const qs = qsFrom(sp);

  const res = await fetch(`http://localhost:3001/api/jobs?${qs}`, { cache: "no-store" });
  const jobs = (await res.json()) as Array<{
    id: string;
    source: string;
    title: string;
    company?: string | null;
    location?: string | null;
    url: string;
    postedAt?: string | null;
    createdAt: string;
  }>;

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Jobs</h1>

      <div className="rounded-xl border p-4">
        <form className="grid gap-3 md:grid-cols-4" action="/jobs">
          <input
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Search title/company/location"
            className="rounded-md border px-3 py-2"
          />
          <input
            name="company"
            defaultValue={sp.company ?? ""}
            placeholder="Company"
            className="rounded-md border px-3 py-2"
          />
          <input
            name="location"
            defaultValue={sp.location ?? ""}
            placeholder="Location"
            className="rounded-md border px-3 py-2"
          />
          <button className="rounded-md border px-3 py-2 hover:bg-gray-50">
            Search
          </button>

          <input type="hidden" name="take" value={sp.take ?? "25"} />
          <input type="hidden" name="skip" value="0" />
        </form>
      </div>

      <div className="rounded-xl border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 px-3">Title</th>
              <th className="py-2 px-3">Company</th>
              <th className="py-2 px-3">Location</th>
              <th className="py-2 px-3">Source</th>
              <th className="py-2 px-3">Posted</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id} className="border-b align-top">
                <td className="py-2 px-3">
                  <a className="underline" href={j.url} target="_blank" rel="noreferrer">
                    {j.title}
                  </a>
                  <div className="text-xs text-gray-500 break-all">{j.url}</div>
                </td>
                <td className="py-2 px-3">{j.company ?? "-"}</td>
                <td className="py-2 px-3">{j.location ?? "-"}</td>
                <td className="py-2 px-3">{j.source}</td>
                <td className="py-2 px-3">
                  {(j.postedAt ?? j.createdAt)?.toString().slice(0, 10)}
                </td>
              </tr>
            ))}
            {jobs.length === 0 && (
              <tr>
                <td className="py-3 px-3 text-gray-500" colSpan={5}>
                  No jobs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Simple paging */}
      <div className="flex gap-2">
        {(() => {
          const take = Number(sp.take ?? "25");
          const skip = Number(sp.skip ?? "0");
          const prevSkip = Math.max(skip - take, 0);
          const nextSkip = skip + take;

          const base = new URLSearchParams();
          if (sp.q) base.set("q", sp.q);
          if (sp.company) base.set("company", sp.company);
          if (sp.location) base.set("location", sp.location);
          base.set("take", String(take));

          const prev = new URLSearchParams(base);
          prev.set("skip", String(prevSkip));

          const next = new URLSearchParams(base);
          next.set("skip", String(nextSkip));

          return (
            <>
              <a className="rounded-md border px-3 py-2 hover:bg-gray-50" href={`/jobs?${prev}`}>
                Prev
              </a>
              <a className="rounded-md border px-3 py-2 hover:bg-gray-50" href={`/jobs?${next}`}>
                Next
              </a>
            </>
          );
        })()}
      </div>
    </main>
  );
}
