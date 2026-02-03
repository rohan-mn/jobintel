// jobs.service.ts
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { IngestJobDto } from "./dto/ingest-job.dto";
import { Prisma } from "../generated/prisma/client";


type AnalyticsFilters = {
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  location?: string;
  company?: string;
  q?: string;
  workMode?: string;
  experienceLevel?: string;
  roleCategory?: string;
};

function parseDateRange(filters: AnalyticsFilters) {
  const fromDate = filters.from ? new Date(filters.from) : undefined;
  const toDate = filters.to ? new Date(filters.to) : undefined;
  if (toDate) toDate.setHours(23, 59, 59, 999);
  return { fromDate, toDate };
}

function buildWhere(filters: AnalyticsFilters): Prisma.JobPostWhereInput {
  const q = filters.q?.trim();
  const location = filters.location?.trim();
  const company = filters.company?.trim();

  const workMode = filters.workMode?.trim();
  const experienceLevel = filters.experienceLevel?.trim();
  const roleCategory = filters.roleCategory?.trim();

  const { fromDate, toDate } = parseDateRange(filters);

  return {
    AND: [
      q
        ? {
            OR: [
              { title: { contains: q, mode: Prisma.QueryMode.insensitive } },
              { company: { contains: q, mode: Prisma.QueryMode.insensitive } },
              { location: { contains: q, mode: Prisma.QueryMode.insensitive } },
            ],
          }
        : {},

      location
        ? { location: { contains: location, mode: Prisma.QueryMode.insensitive } }
        : {},
      company
        ? { company: { contains: company, mode: Prisma.QueryMode.insensitive } }
        : {},

      workMode ? { workMode: workMode as any } : {},
      experienceLevel ? { experienceLevel: experienceLevel as any } : {},
      roleCategory ? { roleCategory: roleCategory as any } : {},

      fromDate || toDate ? { createdAt: { gte: fromDate, lte: toDate } } : {},
    ],
  };
}

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * ✅ Upsert-based ingestion:
   * - Insert new posts
   * - Update existing posts (same source+url) with latest metadata/classifiers
   */
  async ingestMany(jobs: IngestJobDto[]) {
    if (!jobs || jobs.length === 0) {
      return { inserted: 0, updated: 0 };
    }

    let inserted = 0;
    let updated = 0;

    for (const j of jobs) {
      const postedAt = j.postedAt ? new Date(j.postedAt) : undefined;

      const workMode = (j as any).workMode ?? "UNKNOWN";
      const experienceLevel = (j as any).experienceLevel ?? "UNKNOWN";
      const roleCategory = (j as any).roleCategory ?? "OTHER";

      // IMPORTANT: Prisma generates a unique input name for @@unique([source, url]).
      // It is typically "source_url". If TypeScript errors here, CTRL+SPACE on "where:" and pick the correct one.
      const result = await this.prisma.jobPost.upsert({
        where: {
          source_url: {
            source: j.source,
            url: j.url,
          },
        },
        create: {
          source: j.source,
          sourceJobId: j.sourceJobId,
          title: j.title,
          company: j.company,
          location: j.location,
          url: j.url,
          postedAt,

          workMode,
          experienceLevel,
          roleCategory,
        },
        update: {
          // update things that can change over time
          sourceJobId: j.sourceJobId,
          title: j.title,
          company: j.company,
          location: j.location,
          postedAt,

          workMode,
          experienceLevel,
          roleCategory,
        },
        select: { createdAt: true }, // light select
      });

      // Heuristic to count inserted vs updated:
      // If the row was just created, createdAt will be ~now. This is good enough for dev analytics.
      const ageMs = Date.now() - new Date(result.createdAt).getTime();
      if (ageMs < 5_000) inserted++;
      else updated++;
    }

    console.log(`[ingest] inserted=${inserted} updated=${updated}`);
    return { inserted, updated };
  }

  /**
   * Optional fast-path bulk insert.
   * NOTE: createMany cannot "update existing", only skipDuplicates.
   * Keep this for later if you want speed; upsert is what fixes classification for duplicates.
   */
  async ingestBulk(jobs: IngestJobDto[]) {
    const result = await this.prisma.jobPost.createMany({
      data: jobs.map((j) => ({
        source: j.source,
        sourceJobId: j.sourceJobId,
        title: j.title,
        company: j.company,
        location: j.location,
        url: j.url,
        postedAt: j.postedAt ? new Date(j.postedAt) : undefined,

        workMode: (j as any).workMode ?? "UNKNOWN",
        experienceLevel: (j as any).experienceLevel ?? "UNKNOWN",
        roleCategory: (j as any).roleCategory ?? "OTHER",
      })),
      skipDuplicates: true,
    });

    return {
      inserted: result.count,
      skipped: jobs.length - result.count,
    };
  }

  async list(params: {
    q?: string;
    location?: string;
    company?: string;
    take?: number;
    skip?: number;

    workMode?: string;
    experienceLevel?: string;
    roleCategory?: string;
    from?: string;
    to?: string;
  }) {
    const take = Math.min(Math.max(params.take ?? 25, 1), 100);
    const skip = Math.max(params.skip ?? 0, 0);

    const where = buildWhere({
      q: params.q,
      location: params.location,
      company: params.company,
      workMode: params.workMode,
      experienceLevel: params.experienceLevel,
      roleCategory: params.roleCategory,
      from: params.from,
      to: params.to,
    });

    return this.prisma.jobPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      skip,
    });
  }

  async summary() {
    const totalJobs = await this.prisma.jobPost.count();

    const rows = await this.prisma.$queryRaw<Array<{ source: string; count: bigint }>>`
      SELECT "source", COUNT(*)::bigint AS "count"
      FROM "JobPost"
      GROUP BY "source"
      ORDER BY COUNT(*) DESC;
    `;

    return {
      totalJobs,
      bySource: rows.map((r) => ({ source: r.source, count: Number(r.count) })),
    };
  }

  async timeseries(days = 30) {
    const safeDays = Math.min(Math.max(days, 1), 365);

    const rows = await this.prisma.$queryRaw<Array<{ day: string; count: bigint }>>`
      SELECT to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') AS "day",
             COUNT(*)::bigint AS "count"
      FROM "JobPost"
      WHERE "createdAt" >= (NOW() - (${safeDays}::int * INTERVAL '1 day'))
      GROUP BY date_trunc('day', "createdAt")
      ORDER BY date_trunc('day', "createdAt") ASC;
    `;

    return rows.map((r) => ({ day: r.day, count: Number(r.count) }));
  }

  async analyticsBreakdown(filters: AnalyticsFilters) {
    const where = buildWhere(filters);

    const [totalJobs, byRole, byWorkMode, byExperience] = await Promise.all([
      this.prisma.jobPost.count({ where }),
      this.prisma.jobPost.groupBy({
        by: ["roleCategory"],
        where,
        _count: { roleCategory: true },
        orderBy: { _count: { roleCategory: "desc" } },
      }),
      this.prisma.jobPost.groupBy({
        by: ["workMode"],
        where,
        _count: { workMode: true },
        orderBy: { _count: { workMode: "desc" } },
      }),
      this.prisma.jobPost.groupBy({
        by: ["experienceLevel"],
        where,
        _count: { experienceLevel: true },
        orderBy: { _count: { experienceLevel: "desc" } },
      }),
    ]);

    return {
      totalJobs,
      byRoleCategory: byRole.map((r) => ({
        name: r.roleCategory,
        count: r._count.roleCategory,
      })),
      byWorkMode: byWorkMode.map((r) => ({
        name: r.workMode,
        count: r._count.workMode,
      })),
      byExperienceLevel: byExperience.map((r) => ({
        name: r.experienceLevel,
        count: r._count.experienceLevel,
      })),
    };
  }
}
