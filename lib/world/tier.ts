/**
 * How much 3D a visitor's device gets. Most visitors are on mid-range Android phones on
 * mobile data, so this is decided before any 3D code downloads.
 *   high    full detail
 *   mid     lighter: lower pixel ratio, fewer lines, no expensive passes
 *   poster  no WebGL at all; pages show their still artwork
 */
export type Tier = "high" | "mid" | "poster";
export type LiveTier = Exclude<Tier, "poster">;

export type TierEnvironment = {
  reducedMotion: boolean;
  /** The browser's data-saver setting. */
  saveData: boolean;
  /** Approximate RAM in GB, where the browser reports it (Chromium only). */
  deviceMemory: number | undefined;
  /** Phones and tablets. */
  coarsePointer: boolean;
};

export function pickTier(environment: TierEnvironment): Tier {
  const { reducedMotion, saveData, deviceMemory, coarsePointer } = environment;
  if (reducedMotion || saveData) return "poster";
  if (deviceMemory !== undefined && deviceMemory <= 2) return "poster";
  if (coarsePointer || (deviceMemory !== undefined && deviceMemory <= 4)) return "mid";
  return "high";
}

export function readTierEnvironment(): TierEnvironment {
  const browser = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  return {
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
    saveData: browser.connection?.saveData === true,
    deviceMemory: browser.deviceMemory,
    coarsePointer: matchMedia("(pointer: coarse)").matches,
  };
}

/** One step down, for when the frame probe finds the device can't keep up. */
export const lowerTier = (tier: LiveTier): Tier => (tier === "high" ? "mid" : "poster");

export const tierSettings: Record<LiveTier, { maxPixelRatio: number }> = {
  high: { maxPixelRatio: 2 },
  mid: { maxPixelRatio: 1.5 },
};
