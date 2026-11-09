import { afterEach, beforeEach, expect, test, vi } from "vitest";

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

test("uses the default app name when the variable is unset", async () => {
  vi.stubEnv("NEXT_PUBLIC_APP_NAME", undefined);

  const { env } = await import("@/lib/env");

  expect(env.NEXT_PUBLIC_APP_NAME).toBe("The Reserve");
});

test("rejects an empty app name instead of rendering a blank title", async () => {
  vi.stubEnv("NEXT_PUBLIC_APP_NAME", "");

  await expect(import("@/lib/env")).rejects.toThrow();
});

test("importing the file doesn't require server-only values", async () => {
  vi.stubEnv("DATABASE_URL", undefined);

  await expect(import("@/lib/env")).resolves.toBeDefined();
});

test("explains a missing database URL without printing any value", async () => {
  vi.stubEnv("DATABASE_URL", "not-a-url-secret");
  const { getServerEnv } = await import("@/lib/env");

  expect(getServerEnv).toThrow(/\.env\.example/);
  expect(getServerEnv).not.toThrow(/not-a-url-secret/);
});

test("accepts a Postgres connection string", async () => {
  vi.stubEnv("DATABASE_URL", "postgresql://user:p%40ss@host-pooler.neon.tech/db?sslmode=require");
  const { getServerEnv } = await import("@/lib/env");

  expect(getServerEnv().DATABASE_URL).toContain("host-pooler.neon.tech");
});
