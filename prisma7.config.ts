import { loadEnvConfig } from "@next/env";
import { defineConfig } from "prisma/config";

// Reads the same .env files as Next.js, so one .env.local serves both.
loadEnvConfig(process.cwd());

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Migrations need Neon's direct connection. The app uses the pooled one in
    // backend/db.ts. `prisma generate` runs fine with this unset.
    url: process.env.DATABASE_URL_UNPOOLED,
  },
});
