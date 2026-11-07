/**
 * The geometry of the putt journey: the line the ball rolls along, the time of day as it
 * rolls, and the green's contour map. Positions on the green are fractions: `x` across it
 * (0 left edge, 1 right edge) and `t` down it (0 top, 1 bottom).
 */

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const smoothstep = (from: number, to: number, value: number) => {
  const t = clamp01((value - from) / (to - from));
  return t * t * (3 - 2 * t);
};

export type Cup = { t: number; x: number };

/** Where the read crosses the green at depth t, before it's bent into the cup. */
export const meander = (t: number) =>
  0.5 + 0.27 * Math.sin(t * 14.8 + 0.6) * (0.65 + 0.35 * Math.sin(t * 5.1 + 1.2));

/** The putting line: the meander, eased over its last stretch so it finishes in the cup. */
export const lineX = (t: number, cup: Cup) =>
  meander(t) + (cup.x - meander(cup.t)) * smoothstep(cup.t - 0.14, cup.t, t);

export type TracePoint = { x: number; y: number; t: number; length: number };

/** The line from `from` to the cup in pixels, with the running length along it. */
export function traceLine(from: number, cup: Cup, width: number, height: number, steps = 240): TracePoint[] {
  const points: TracePoint[] = [];
  let length = 0;
  for (let step = 0; step <= steps; step += 1) {
    const t = from + (cup.t - from) * (step / steps);
    const x = lineX(t, cup) * width;
    const y = t * height;
    const previous = points.at(-1);
    if (previous) length += Math.hypot(x - previous.x, y - previous.y);
    points.push({ x, y, t, length });
  }
  return points;
}

/** How far along the line the ball has rolled at depth t. */
export function lengthAt(points: TracePoint[], t: number) {
  if (points.length === 0) return 0;
  if (t <= points[0].t) return 0;
  const last = points[points.length - 1];
  if (t >= last.t) return last.length;
  let low = 0;
  let high = points.length - 1;
  while (high - low > 1) {
    const middle = (low + high) >> 1;
    if (points[middle].t <= t) low = middle;
    else high = middle;
  }
  const a = points[low];
  const b = points[high];
  return a.length + (b.length - a.length) * ((t - a.t) / (b.t - a.t));
}

export const toPath = (points: TracePoint[]) =>
  points.map((point, i) => `${i === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join("");

/** A chapter's stamp: where it sits down the green, and its time of day in minutes. */
export type Stamp = { t: number; minutes: number };

/** The time on the clock at depth t, read between the chapters' stamps. */
export function clockAt(stamps: Stamp[], t: number) {
  if (stamps.length === 0) return "06:00";
  let minutes = stamps[0].minutes;
  for (let i = 0; i < stamps.length; i += 1) {
    const current = stamps[i];
    const next = stamps[i + 1];
    if (t < current.t) break;
    minutes = next
      ? current.minutes + (next.minutes - current.minutes) * clamp01((t - current.t) / (next.t - current.t))
      : current.minutes;
  }
  const whole = Math.round(minutes);
  return `${String(Math.floor(whole / 60)).padStart(2, "0")}:${String(whole % 60).padStart(2, "0")}`;
}

/** "07:40" as minutes after midnight. */
export const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

/**
 * The green's height on a tile that repeats seamlessly down its length: every term
 * completes whole cycles in v, so the bottom edge meets the top of the next tile.
 */
export function greenHeight(u: number, v: number) {
  const around = 2 * Math.PI * v;
  return (
    0.55 * Math.sin(around + 2.4 * u) +
    0.35 * Math.sin(2 * around - 3.7 * u + 1.3) +
    0.22 * Math.cos(3 * around + 6.1 * u + 0.4) +
    0.12 * Math.sin(5 * around + 9 * u)
  );
}

type Point = [number, number];

/** Contour lines of `height` at `level` across a grid, joined into polylines (marching squares). */
export function contourLines(
  height: (u: number, v: number) => number,
  level: number,
  columns: number,
  rows: number,
): Point[][] {
  const value = (i: number, j: number) => height(i / columns, j / rows);
  // Each crossing is keyed by the grid edge it sits on, so segments can be chained.
  const segments: [string, Point, string, Point][] = [];
  const crossing = (i1: number, j1: number, i2: number, j2: number): [string, Point] => {
    const a = value(i1, j1);
    const b = value(i2, j2);
    const f = (level - a) / (b - a);
    return [`${i1},${j1}-${i2},${j2}`, [(i1 + (i2 - i1) * f) / columns, (j1 + (j2 - j1) * f) / rows]];
  };

  for (let j = 0; j < rows; j += 1) {
    for (let i = 0; i < columns; i += 1) {
      const corners = [value(i, j), value(i + 1, j), value(i + 1, j + 1), value(i, j + 1)];
      const edges = [
        () => crossing(i, j, i + 1, j),
        () => crossing(i + 1, j, i + 1, j + 1),
        () => crossing(i, j + 1, i + 1, j + 1),
        () => crossing(i, j, i, j + 1),
      ];
      const above = corners.map((corner) => corner > level);
      const crossed = [0, 1, 2, 3].filter((edge) => above[edge] !== above[(edge + 1) % 4]);
      if (crossed.length === 2) {
        const [a, b] = crossed.map((edge) => edges[edge]());
        segments.push([a[0], a[1], b[0], b[1]]);
      } else if (crossed.length === 4) {
        // A saddle: pair the crossings by which side the cell's centre is on.
        const centreAbove = corners.reduce((sum, corner) => sum + corner, 0) / 4 > level;
        const [e0, e1, e2, e3] = [0, 1, 2, 3].map((edge) => edges[edge]());
        const pairs = centreAbove === above[0] ? [[e0, e1], [e2, e3]] : [[e3, e0], [e1, e2]];
        for (const [a, b] of pairs) segments.push([a[0], a[1], b[0], b[1]]);
      }
    }
  }

  // Chain segments that share a crossing into polylines.
  const byKey = new Map<string, number[]>();
  segments.forEach(([keyA, , keyB], index) => {
    for (const key of [keyA, keyB]) byKey.set(key, [...(byKey.get(key) ?? []), index]);
  });
  const used = new Set<number>();
  const lines: Point[][] = [];
  for (let start = 0; start < segments.length; start += 1) {
    if (used.has(start)) continue;
    used.add(start);
    const [keyA, pointA, keyB, pointB] = segments[start];
    const line: Point[] = [pointA, pointB];
    for (const [fromKey, prepend] of [[keyB, false], [keyA, true]] as const) {
      let key = fromKey;
      for (;;) {
        const next = byKey.get(key)?.find((index) => !used.has(index));
        if (next === undefined) break;
        used.add(next);
        const [k1, p1, k2, p2] = segments[next];
        const [nextKey, point] = k1 === key ? [k2, p2] : [k1, p1];
        if (prepend) line.unshift(point);
        else line.push(point);
        key = nextKey;
      }
    }
    lines.push(line);
  }
  return lines;
}

/** A polyline as a smooth path: quadratic curves through the midpoints between its points. */
function smoothPath(points: Point[], width: number, height: number) {
  const at = ([u, v]: Point) => `${(u * width).toFixed(1)} ${(v * height).toFixed(1)}`;
  if (points.length < 3) return `M${points.map(at).join("L")}`;
  let path = `M${at(points[0])}`;
  for (let i = 1; i < points.length - 1; i += 1) {
    const mid: Point = [(points[i][0] + points[i + 1][0]) / 2, (points[i][1] + points[i + 1][1]) / 2];
    path += `Q${at(points[i])} ${at(mid)}`;
  }
  return `${path}L${at(points[points.length - 1])}`;
}

/**
 * The green book's map as one SVG tile: gold contour lines, every third one heavier, and
 * small chevrons pointing downhill, the way a green-reading book marks the slope.
 */
export function greenTileSvg(width = 400, height = 800) {
  const levels = [-0.9, -0.6, -0.3, 0, 0.3, 0.6, 0.9];
  const contours = levels.map((level, index) => {
    const d = contourLines(greenHeight, level, 24, 48)
      .map((line) => smoothPath(line, width, height))
      .join("");
    const major = index % 3 === 0;
    return `<path d="${d}" stroke-width="${major ? 1.4 : 0.9}" stroke-opacity="${major ? 0.42 : 0.26}"/>`;
  });

  let arrows = "";
  const step = 50;
  for (let row = 0; row * step < height; row += 1) {
    const y = row * step + step / 2;
    // Alternate rows sit half a step over, so the arrows read as a field, not a grid.
    for (let x = step / 2 + (row % 2) * (step / 2); x < width; x += step) {
      const u = x / width;
      const v = y / height;
      const e = 0.004;
      const gx = (greenHeight(u + e, v) - greenHeight(u - e, v)) / (2 * e * width);
      const gy = (greenHeight(u, v + e) - greenHeight(u, v - e)) / (2 * e * height);
      const slope = Math.hypot(gx, gy);
      if (slope < 0.0035) continue;
      const [dx, dy] = [-gx / slope, -gy / slope];
      const tip: Point = [x + dx * 4, y + dy * 4];
      const left: Point = [x - dx * 2 - dy * 3, y - dy * 2 + dx * 3];
      const right: Point = [x - dx * 2 + dy * 3, y - dy * 2 - dx * 3];
      arrows += `M${left[0].toFixed(1)} ${left[1].toFixed(1)}L${tip[0].toFixed(1)} ${tip[1].toFixed(1)}L${right[0].toFixed(1)} ${right[1].toFixed(1)}`;
    }
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<g fill="none" stroke="#d4af37" stroke-linecap="round" stroke-linejoin="round">`,
    ...contours,
    `<path d="${arrows}" stroke-width="1" stroke-opacity="0.34"/>`,
    `</g></svg>`,
  ].join("");
}
