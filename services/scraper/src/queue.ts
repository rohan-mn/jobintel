import { Queue } from "bullmq";

export const redisConnection = {
  host: process.env.REDIS_HOST ?? "127.0.0.1",
  port: Number(process.env.REDIS_PORT ?? 6379),
};

export const QUEUE_NAME = process.env.JOBS_QUEUE ?? "jobs-raw";

export const jobsQueue = new Queue(QUEUE_NAME, { connection: redisConnection });
