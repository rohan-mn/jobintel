import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Controller()
export class AppController
{
  constructor(private readonly prisma: PrismaService) {}

  @Get("/health")
  health()
  {
    return { ok: true };
  }

  @Get("/health/db")
  async healthDb()
  {
    const count = await this.prisma.jobPost.count();
    return { ok: true, jobPosts: count };
  }
}
