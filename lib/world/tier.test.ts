import { expect, test } from "vitest";
import { lowerTier, pickTier, type TierEnvironment } from "@/lib/world/tier";

const desktop: TierEnvironment = { reducedMotion: false, saveData: false, deviceMemory: 8, coarsePointer: false };

test("a desktop with plenty of memory gets full detail", () => {
  expect(pickTier(desktop)).toBe("high");
  // Safari and Firefox don't report memory; a desktop pointer is enough.
  expect(pickTier({ ...desktop, deviceMemory: undefined })).toBe("high");
});

test("phones and mid-memory devices get the lighter world", () => {
  expect(pickTier({ ...desktop, coarsePointer: true })).toBe("mid");
  expect(pickTier({ ...desktop, deviceMemory: 4 })).toBe("mid");
});

test("reduced motion, data saver and low memory get posters, whatever the device", () => {
  expect(pickTier({ ...desktop, reducedMotion: true })).toBe("poster");
  expect(pickTier({ ...desktop, saveData: true })).toBe("poster");
  expect(pickTier({ ...desktop, coarsePointer: true, deviceMemory: 2 })).toBe("poster");
});

test("a slow device steps down one tier at a time", () => {
  expect(lowerTier("high")).toBe("mid");
  expect(lowerTier("mid")).toBe("poster");
});
