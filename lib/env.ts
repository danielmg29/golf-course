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
