import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg"; // <--- Import Pool

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const connectionString = process.env.DATABASE_URL;

    // Safety check: Ensure the variable exists before connecting
    if (!connectionString) {
        throw new Error("DATABASE_URL is not defined in environment variables");
    }

    // 1. Create the native Postgres Pool
    const pool = new Pool({ 
        connectionString,
        // Optional: explicitly parse connection string if needed, 
        // but passing the string usually works if formatted correctly.
    });

    // 2. Pass the Pool to the Prisma Adapter
    const adapter = new PrismaPg(pool);

    // 3. Pass the Adapter to the Prisma Client
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}