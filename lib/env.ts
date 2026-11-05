import { z } from "zod";

const client = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default("Golf Course"),
});

// Parsed at module load, and imported by app/layout.tsx, so a bad value fails
// `next build`. NEXT_PUBLIC_ values are inlined at build time, so each one has
// to be read by its full name.
export const env = client.parse({
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
});

const server = z.object({
  DATABASE_URL: z.url({
    error: "DATABASE_URL must be set to your Neon pooled connection string. See .env.example.",
  }),
});

/**
 * A function, because client components import this file for the values above and these
 * don't exist in the browser. backend/db.ts calls it as it loads, and the home page
 * imports that during `next build`, so a missing value still fails the build.
 */
export function getServerEnv() {
  return server.parse({ DATABASE_URL: process.env.DATABASE_URL });
}
