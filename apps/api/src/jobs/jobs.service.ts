import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { IngestJobDto } from "./dto/ingest-job.dto";


@Injectable()
export class JobsService
{
  constructor(private readonly prisma: PrismaService) {}

  async ingestMany(jobs: IngestJobDto[])
  {
    if (!jobs || jobs.length === 0)
    {
      return { inserted: 0, skipped: 0 };
    }

    // Insert one-by-one to leverage @@unique([source, url]) and skip duplicates gracefully.
    // For speed later, we can switch to createMany({ skipDuplicates: true }) if supported in this client mode.
    let inserted = 0;
    let skipped = 0;

    for (const j of jobs)
    {
      try
      {
        await this.prisma.jobPost.create({
          data: {
            source: j.source,
            sourceJobId: j.sourceJobId,
            title: j.title,
            company: j.company,
            location: j.location,
            url: j.url,
            postedAt: j.postedAt ? new Date(j.postedAt) : undefined,
          },
        });

        inserted++;
      }
      catch(e)
      {
         if (e?.code === "P2002") {
    skipped++;
  } else {
    throw e;
  }
        
      }
    }
    console.log(`[ingest] inserted=${inserted} skipped=${skipped}`);
    return { inserted, skipped };
  }

  async list(params: {
    q?: string;
    location?: string;
    company?: string;
    take?: number;
    skip?: number;
  })
  {
    const take = Math.min(Math.max(params.take ?? 25, 1), 100);
    const skip = Math.max(params.skip ?? 0, 0);

    const q = params.q?.trim();
    const location = params.location?.trim();
    const company = params.company?.trim();

    return this.prisma.jobPost.findMany({
      where: {
        AND: [
          q
            ? {
                OR: [
                  { title: { contains: q, mode: "insensitive" } },
                  { company: { contains: q, mode: "insensitive" } },
                  { location: { contains: q, mode: "insensitive" } },
                ],
              }
            : {},
          location ? { location: { contains: location, mode: "insensitive" } } : {},
          company ? { company: { contains: company, mode: "insensitive" } } : {},
        ],
      },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    });
  }

  async summary()
{
  const totalJobs = await this.prisma.jobPost.count();

  // group counts by source
  const rows = await this.prisma.$queryRaw<Array<{ source: string; count: bigint }>>`
    SELECT "source", COUNT(*)::bigint AS "count"
    FROM "JobPost"
    GROUP BY "source"
    ORDER BY COUNT(*) DESC;
  `;

  return {
    totalJobs,
    bySource: rows.map(r => ({ source: r.source, count: Number(r.count) })),
  };
}

async ingestBulk(jobs: IngestJobDto[]) {
  const result = await this.prisma.jobPost.createMany({
    data: jobs.map(j => ({
      source: j.source,
      sourceJobId: j.sourceJobId,
      title: j.title,
      company: j.company,
      location: j.location,
      url: j.url,
      postedAt: j.postedAt ? new Date(j.postedAt) : undefined,
    })),
    skipDuplicates: true,
  });

  return {
    inserted: result.count,
    skipped: jobs.length - result.count,
  };
}


}
