import { z } from "zod";
import { DEFAULT_CLUB_NAME } from "@/lib/site";

const client = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default(DEFAULT_CLUB_NAME),
});

// Parsed at module load, and imported by app/layout.tsx, so a bad value fails
// `next build`. NEXT_PUBLIC_ values are inlined at build time, so each one has
// to be read by its full name. Server code only: importing this from a client
// component adds Zod to every page.
export const env = client.parse({
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
});

const server = z.object({
  DATABASE_URL: z.url({
    error: "DATABASE_URL must be set to your Neon pooled connection string. See .env.example.",
  }),
});

/**
 * A function, so importing this file for the values above never needs server-only ones.
 * backend/db.ts calls it as it loads, and the home page imports that during `next build`,
 * so a missing value still fails the build.
 */
export function getServerEnv() {
  return server.parse({ DATABASE_URL: process.env.DATABASE_URL });
}
