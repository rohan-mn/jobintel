"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Briefcase,
  MapPin,
  Filter,
  Calendar,
  Search,
  Building2,
  Users,
  Globe,
  Zap,
} from "lucide-react";

type Breakdown = {
  totalJobs: number;
  byRoleCategory: Array<{ name: string; count: number }>;
  byWorkMode: Array<{ name: string; count: number }>;
  byExperienceLevel: Array<{ name: string; count: number }>;
};

const COLORS = {
  primary: ["#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE", "#DBEAFE", "#EFF6FF"],
  workMode: ["#8B5CF6", "#A78BFA", "#C4B5FD"],
  experience: ["#10B981", "#34D399", "#6EE7B7", "#A7F3D0", "#D1FAE5"],
};

function ChartCard({
  title,
  data,
  type = "bar",
}: {
  title: string;
  data: Array<{ name: string; count: number }>;
  type?: "bar" | "pie";
}) {
  const colors = title.toLowerCase().includes("role")
    ? COLORS.primary
    : title.toLowerCase().includes("work")
    ? COLORS.workMode
    : COLORS.experience;

  // 1. Force sanitize data to ensure counts are real Numbers
  const cleanData = useMemo(() => {
    return data.map(item => ({
      ...item,
      count: Number(item.count) // Explicit cast fixes the "0.0%" issue
    }));
  }, [data]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
      <h3 className="text-lg font-semibold mb-6 text-gray-900 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-blue-500" />
        {title}
      </h3>

      <div className="h-80 text-xs"> {/* Added text-xs for cleaner labels */}
        {(!cleanData || cleanData.length === 0) ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {type === "pie" ? (
              <PieChart>
                <Pie
                  data={cleanData}
                  cx="50%"
                  cy="50%"
                  // 2. Add nameKey for stability
                  nameKey="name"
                  dataKey="count"
                  outerRadius={100}
                  // 3. Improve Label positioning
                  labelLine={true} 
                  label={({ name, percent }) => 
                    `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                  }
                >
                  {cleanData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  // FIX: Allow 'value' to be any type to satisfy Recharts' strict typing
                  formatter={(value: any) => [Number(value || 0).toLocaleString(), 'Count']}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                />
              </PieChart>
            ) : (
              <BarChart data={cleanData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#6B7280', fontSize: 10 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fill: '#6B7280', fontSize: 10 }}
                  tickFormatter={(val) => val.toLocaleString()}
                />
                <Tooltip
                  cursor={{ fill: "rgba(59, 130, 246, 0.05)" }}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {cleanData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function safeNum(n: unknown) {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [breakdown, setBreakdown] = useState<Breakdown | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);

  const qs = useMemo(() => {
    const sp = new URLSearchParams();
    for (const [k, v] of searchParams.entries()) {
      if (v && v.trim().length > 0) sp.set(k, v);
    }
    return sp.toString();
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setErr(null);

      try {
        const res = await fetch(`/api/breakdown${qs ? `?${qs}` : ""}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`Breakdown API failed: ${res.status} ${text}`);
        }

        const data = (await res.json()) as Breakdown;
        if (!cancelled) setBreakdown(data);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? "Failed to load breakdown");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [qs]);

  const handleFilterSubmit = () => {
    const params = new URLSearchParams();

    const q = (document.querySelector('input[name="q"]') as HTMLInputElement)?.value;
    const company = (document.querySelector('input[name="company"]') as HTMLInputElement)?.value;
    const location = (document.querySelector('input[name="location"]') as HTMLInputElement)?.value;
    const roleCategory = (document.querySelector('select[name="roleCategory"]') as HTMLSelectElement)?.value;
    const workMode = (document.querySelector('select[name="workMode"]') as HTMLSelectElement)?.value;
    const experienceLevel = (document.querySelector('select[name="experienceLevel"]') as HTMLSelectElement)?.value;
    const from = (document.querySelector('input[name="from"]') as HTMLInputElement)?.value;
    const to = (document.querySelector('input[name="to"]') as HTMLInputElement)?.value;

    if (q) params.set("q", q);
    if (company) params.set("company", company);
    if (location) params.set("location", location);
    if (roleCategory) params.set("roleCategory", roleCategory);
    if (workMode) params.set("workMode", workMode);
    if (experienceLevel) params.set("experienceLevel", experienceLevel);
    if (from) params.set("from", from);
    if (to) params.set("to", to);

    router.push(`/dashboard${params.toString() ? "?" + params.toString() : ""}`);
  };

  const total = breakdown ? safeNum(breakdown.totalJobs) : 0;
  const byRoleCategory = breakdown?.byRoleCategory ?? [];
  const byWorkMode = breakdown?.byWorkMode ?? [];
  const byExperienceLevel = breakdown?.byExperienceLevel ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap pt-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Market Intelligence</h1>
            <p className="text-gray-600">Real-time job market analytics and insights</p>
          </div>
          <a
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
            href="/jobs"
          >
            <Briefcase className="w-4 h-4" />
            View All Jobs
          </a>
        </div>

        {/* Status Messages */}
        {loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-700 flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
            Loading analytics…
          </div>
        )}
        {err && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
            {err}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                name="q"
                defaultValue={searchParams.get("q") ?? ""}
                placeholder="Search title, company, or location..."
                className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
              />
            </div>

            {/* Company */}
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                name="company"
                defaultValue={searchParams.get("company") ?? ""}
                placeholder="Company"
                className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
              />
            </div>

            {/* Location */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                name="location"
                defaultValue={searchParams.get("location") ?? ""}
                placeholder="Location"
                className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
              />
            </div>

            {/* Role */}
            <select
              name="roleCategory"
              defaultValue={searchParams.get("roleCategory") ?? ""}
              className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
            >
              <option value="">Role Category (All)</option>
              {[
                "BACKEND","FRONTEND","FULLSTACK","DATA","ML","DEVOPS",
                "SECURITY","MOBILE","QA","PM","OTHER",
              ].map((x) => (
                <option key={x} value={x}>{x}</option>
              ))}
            </select>

            {/* Work mode */}
            <select
              name="workMode"
              defaultValue={searchParams.get("workMode") ?? ""}
              className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
            >
              <option value="">Work Mode (All)</option>
              {["REMOTE", "HYBRID", "ONSITE", "UNKNOWN"].map((x) => (
                <option key={x} value={x}>{x}</option>
              ))}
            </select>

            {/* Experience */}
            <select
              name="experienceLevel"
              defaultValue={searchParams.get("experienceLevel") ?? ""}
              className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
            >
              <option value="">Experience Level (All)</option>
              {["INTERN", "JUNIOR", "MID", "SENIOR", "LEAD", "UNKNOWN"].map((x) => (
                <option key={x} value={x}>{x}</option>
              ))}
            </select>

            {/* Date range */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                name="from"
                type="date"
                defaultValue={searchParams.get("from") ?? ""}
                className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
              />
            </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                name="to"
                type="date"
                defaultValue={searchParams.get("to") ?? ""}
                className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
              />
            </div>

            <button
              onClick={handleFilterSubmit}
              className="lg:col-span-2 bg-blue-600 text-white rounded-lg px-6 py-3 font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Jobs */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-5 h-5" />
                <div className="text-sm font-medium opacity-90">Total Positions</div>
              </div>
              <div className="text-4xl font-bold mb-1">{total.toLocaleString()}</div>
              <div className="text-sm opacity-75">Active job postings</div>
            </div>
          </div>

          {/* Top Role */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-2 mb-2 text-gray-600">
              <Users className="w-5 h-5" />
              <div className="text-sm font-medium">Top Role Category</div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{byRoleCategory[0]?.name ?? "—"}</div>
            <div className="text-sm text-gray-500">{safeNum(byRoleCategory[0]?.count).toLocaleString()} positions</div>
          </div>

          {/* Work Mode */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-2 mb-2 text-gray-600">
              <Globe className="w-5 h-5" />
              <div className="text-sm font-medium">Most Common Mode</div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{byWorkMode[0]?.name ?? "—"}</div>
            <div className="text-sm text-gray-500">
              {total > 0 ? ((safeNum(byWorkMode[0]?.count) / total) * 100).toFixed(1) : "0.0"}% of jobs
            </div>
          </div>

          {/* Experience */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-2 mb-2 text-gray-600">
              <Zap className="w-5 h-5" />
              <div className="text-sm font-medium">Target Experience</div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{byExperienceLevel[0]?.name ?? "—"}</div>
            <div className="text-sm text-gray-500">{safeNum(byExperienceLevel[0]?.count).toLocaleString()} openings</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          <ChartCard title="Distribution by Role" data={byRoleCategory} />
          <ChartCard title="Distribution by Work Mode" data={byWorkMode} type="pie" />
          <ChartCard title="Distribution by Experience" data={byExperienceLevel} />
        </div>
      </main>
    </div>
  );
}