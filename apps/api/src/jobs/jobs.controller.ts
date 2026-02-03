// jobs.controller.ts
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

  @Get("jobs")
  async list(
    @Query("q") q?: string,
    @Query("location") location?: string,
    @Query("company") company?: string,
    @Query("take") take?: string,
    @Query("skip") skip?: string,

    // ✅ new filter params (6.5-A)
    @Query("workMode") workMode?: string,
    @Query("experienceLevel") experienceLevel?: string,
    @Query("roleCategory") roleCategory?: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
  ) {
    return this.jobs.list({
      q,
      location,
      company,
      take: take ? Number(take) : undefined,
      skip: skip ? Number(skip) : undefined,
      workMode,
      experienceLevel,
      roleCategory,
      from,
      to,
    });
  }

  @Get("analytics/summary")
  async summary() {
    return this.jobs.summary();
  }

  @Get("analytics/timeseries")
  async timeseries(@Query("days") days?: string) {
    return this.jobs.timeseries(days ? Number(days) : 30);
  }

  // ✅ new endpoint (6.5-B)
  @Get("analytics/breakdown")
  async breakdown(
    @Query("from") from?: string,
    @Query("to") to?: string,
    @Query("q") q?: string,
    @Query("company") company?: string,
    @Query("location") location?: string,
    @Query("workMode") workMode?: string,
    @Query("experienceLevel") experienceLevel?: string,
    @Query("roleCategory") roleCategory?: string,
  ) {
    return this.jobs.analyticsBreakdown({
      from,
      to,
      q,
      company,
      location,
      workMode,
      experienceLevel,
      roleCategory,
    });
  }
}
