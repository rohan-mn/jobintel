import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { JobsService } from "./jobs.service";
import { IngestJobsBodyDto } from "./dto/ingest-job.dto";

@Controller("ingest")
export class JobsController {
  constructor(private readonly jobs: JobsService) {}

  @Post("jobs")
  async ingest(@Body() body: IngestJobsBodyDto) {
    return this.jobs.ingestMany(body.jobs);
  }


  @Get("health")
health() {
  return { status: "ok" };
}


  @Get("/jobs")
  async list(
    @Query("q") q?: string,
    @Query("location") location?: string,
    @Query("company") company?: string,
    @Query("take") take?: string,
    @Query("skip") skip?: string,
  ) {
    return this.jobs.list({
      q,
      location,
      company,
      take: take ? Number(take) : undefined,
      skip: skip ? Number(skip) : undefined,
    });
  }

  @Get("/analytics/summary")
  async summary() {
    return this.jobs.summary();
  }
}
