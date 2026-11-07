/** Scroll, in screens, from the first act to the last. One second of the timeline is one screen. */
export const STORY_SCREENS = 8;

export type StoryActId = "lie" | "ground" | "club" | "hole";
export const STORY_ACTS: StoryActId[] = ["lie", "ground", "club", "hole"];

/**
 * Where each act comes to rest, in timeline seconds. Scrolling snaps to these, so a gesture
 * always lands on a finished composition. Phones add one rest per plate in Act III.
 */
export const ACT_LABELS: Record<StoryActId, number> = { lie: 0, ground: 1.8, club: 6.7, hole: STORY_SCREENS };

/** When each act is on screen and can be clicked. Focusing an act outside it scrolls there. */
export const ACT_WINDOWS: Record<StoryActId, readonly [number, number]> = {
  lie: [0, 0.45],
  ground: [1.35, 4.05],
  club: [4.75, 7.15],
  hole: [7.7, STORY_SCREENS],
};

/** The act that owns the screen at `time`, if any; between acts there is only the world. */
export const actAt = (time: number) =>
  STORY_ACTS.find((id) => time >= ACT_WINDOWS[id][0] && time <= ACT_WINDOWS[id][1]) ?? null;

/** Phone layout for Act III: one plate at a time, each with its own rest. */
export const PLATE_START = 4.9;
export const PLATE_STEP = 0.4;
