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

  expect(env.NEXT_PUBLIC_APP_NAME).toBe("Golf Course");
});

test("rejects an empty app name instead of rendering a blank title", async () => {
  vi.stubEnv("NEXT_PUBLIC_APP_NAME", "");

  await expect(import("@/lib/env")).rejects.toThrow();
});
