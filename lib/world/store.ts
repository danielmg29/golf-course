import type { Tier } from "@/lib/world/tier";

/** The acts the world can show. Each one is a scene module that World loads on demand. */
export type ActId = "story" | "journey" | "flight";

/** A screen rectangle in CSS pixels, from getBoundingClientRect. */
export type ScreenRect = { top: number; right: number; bottom: number; left: number };

/**
 * The state of the site's one WebGL world. Pages and GSAP tweens write plain values here and
 * the world's render loop reads them, so nothing outside lib/world/runtime.ts and the act
 * modules imports Three.js. Same idea as `mapController` for the course map.
 */
export const world = {
  /** The act on screen, or null on pages without one. Change it with `setAct`. */
  act: null as ActId | null,
  /** Decided in the browser the first time a page claims the world. */
  tier: null as Tier | null,
  /** 0 hides the world and stops its rendering, 1 shows it fully. */
  presence: 1,

  // The homepage story's values, written by its scroll timeline (features/story/Story.tsx).
  /** The shape: 0 ball · 1 terrain · 2 axis line · 3 spiral · 4 ring. Fractions are mid-change. */
  morph: 0,
  /** 0 floating, 1 landed on the green. */
  drop: 0,
  /** Extra camera pitch in degrees, from scroll speed. Settles back to 0 when scrolling stops. */
  tilt: 0,
  camera: {
    /** Degrees: 0 looks straight ahead, -90 looks straight down. */
    pitch: 0,
    /** Degrees round the vertical axis. */
    orbit: 0,
    /** 0 is normal perspective; 1 is the narrow, flattened dolly-zoom view of the axis and ring. */
    flatten: 0,
  },
  /** DOM measurements the world lines up with, in CSS pixels. */
  anchors: { ringRadius: 0 },

  /**
   * The putt journey's ball, in screen pixels, written by features/journey/JourneyClient.tsx.
   * `travel` is how far it has rolled along the line, `dirX`/`dirY` the way it's rolling,
   * `drop` how far it has fallen into the cup (0 to 1), and `daylight` the time of day
   * from first light (0) to dusk (1).
   */
  ball: { visible: false, x: 0, y: 0, radius: 24, travel: 0, dirX: 0, dirY: 1, drop: 0, daylight: 0 },

  /**
   * The homepage ball's drive, in screen pixels, written every frame by features/home/BallFlight.tsx.
   * `travel` is how far it has gone and `dirX`/`dirY` which way, so it can spin by distance;
   * `rolling` is true once it runs along the ground of the land photograph, seen from the side.
   * `light` blends the two photographs' suns: 0 the aerial hero, 1 the land at golden hour.
   * `veil` is how much of the photograph's grading (the hero's green overlay, the land's haze)
   * lies over the ball, so it sits in the picture rather than on it. `contact` darkens the ground
   * right under the ball while it touches it, and `clip` keeps the ball inside a photograph.
   */
  flight: {
    visible: false,
    x: 0,
    y: 0,
    radius: 7,
    travel: 0,
    dirX: 1,
    dirY: 0,
    rolling: false,
    light: 0,
    veil: 0,
    contact: 0,
    shadow: { x: 0, y: 0, width: 0, height: 0, angle: 0, opacity: 0 },
    clip: null as ScreenRect | null,
  },
};

const listeners = new Set<() => void>();

/** Shows `act`, or clears the world when it's null. Listeners only hear real changes. */
export function setAct(act: ActId | null) {
  if (world.act === act) return;
  world.act = act;
  for (const listener of listeners) listener();
}

/** Calls `listener` whenever the act changes, and returns a function that stops it. */
export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
