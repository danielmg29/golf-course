import { PrismaNeon } from "@prisma/adapter-neon";
import { getServerEnv } from "@/lib/env";
import { PrismaClient } from "./generated/prisma/client";

function createClient() {
  const adapter = new PrismaNeon({
    connectionString: getServerEnv().DATABASE_URL,
    // Neon scales to zero when idle and can take a few seconds to wake up.
    connectionTimeoutMillis: 15_000,
  });

  return new PrismaClient({ adapter });
}

// Next.js reloads modules on every edit in development. Keeping the client on
// globalThis stops each reload from opening another connection pool.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
