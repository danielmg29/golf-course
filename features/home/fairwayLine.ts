// The homepage's fairway line, as numbers. The SVGs draw from these, and the ball's flight
// (BallFlight.tsx) follows the same curves, so the two can never drift apart. No Three.js here.

/** One cubic Bézier: start, two control points, end. */
export type Cubic = readonly [x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number];

/** The hero's 1440 × 900 frame, sliced to cover the screen (preserveAspectRatio "xMidYMid slice"). */
export const HERO_FRAME = { width: 1440, height: 900 } as const;

/** The drive: from the ball on its tee near the copy, out across the land to the right edge. */
export const heroDrive: Cubic = [300, 286, 600, 182, 1000, 156, 1440, 228];

/** The land photograph's 1440 × 620 frame, stretched to fit it (preserveAspectRatio "none"). */
export const LAND_FRAME = { width: 1440, height: 620 } as const;

/** Where the field meets the trees, about 49% down the photograph at both of its crops. */
export const landHorizon: readonly Cubic[] = [
  [0, 302, 360, 300, 760, 300, 1000, 305],
  [1000, 305, 1240, 310, 1320, 312, 1440, 313],
];

/** An SVG path for joined cubics. */
export function pathData(segments: readonly Cubic[]) {
  const [x0, y0] = segments[0];
  return `M${x0} ${y0} ${segments.map(([, , x1, y1, x2, y2, x3, y3]) => `C ${x1} ${y1}, ${x2} ${y2}, ${x3} ${y3}`).join(" ")}`;
}

export function cubicPoint([x0, y0, x1, y1, x2, y2, x3, y3]: Cubic, t: number): [number, number] {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return [a * x0 + b * x1 + c * x2 + d * x3, a * y0 + b * y1 + c * y2 + d * y3];
}

/** The curve's direction at t: how far it moves per unit of t. */
export function cubicTangent([x0, y0, x1, y1, x2, y2, x3, y3]: Cubic, t: number): [number, number] {
  const u = 1 - t;
  return [
    3 * u * u * (x1 - x0) + 6 * u * t * (x2 - x1) + 3 * t * t * (x3 - x2),
    3 * u * u * (y1 - y0) + 6 * u * t * (y2 - y1) + 3 * t * t * (y3 - y2),
  ];
}

/** A point on the drive. Past its end (t > 1) it carries straight on along its last direction. */
export function drivePoint(t: number): [number, number] {
  if (t <= 1) return cubicPoint(heroDrive, t);
  const [x, y] = cubicPoint(heroDrive, 1);
  const [dx, dy] = cubicTangent(heroDrive, 1);
  return [x + dx * (t - 1), y + dy * (t - 1)];
}

/** The horizon's height at frame x (0 to 1440), found by bisection on the segment holding x. */
export function horizonAt(x: number) {
  const segment = landHorizon.find((candidate) => x <= candidate[6]) ?? landHorizon[landHorizon.length - 1];
  const clamped = Math.min(Math.max(x, segment[0]), segment[6]);
  let low = 0;
  let high = 1;
  for (let step = 0; step < 18; step += 1) {
    const middle = (low + high) / 2;
    if (cubicPoint(segment, middle)[0] < clamped) low = middle;
    else high = middle;
  }
  return cubicPoint(segment, (low + high) / 2)[1];
}
