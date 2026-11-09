"use client";

import { useEffect, useRef, useState } from "react";
import {
  clockAt,
  type Cup,
  lengthAt,
  lineX,
  type Stamp,
  toMinutes,
  toPath,
  type TracePoint,
  traceLine,
} from "@/features/journey/green";
import { world } from "@/lib/world/store";

// The ball rides at this fraction of the viewport's height while the page scrolls under it.
const BALL_LINE = 0.55;
// How many pixels of scroll past the cup it takes the ball to drop in.
const DROP_DISTANCE = 90;

type Layout = {
  width: number;
  height: number;
  /** Space kept clear at each side so the whole ball stays on the grass, off the leather edge. */
  margin: number;
  /** The width the line can wander across: the green less both margins. */
  inner: number;
  from: number;
  cup: Cup;
  points: TracePoint[];
  path: string;
  total: number;
  /** `t` is where a chapter's time is exact (its middle); `start` is where it begins (its top). */
  stamps: (Stamp & { name: string; start: number })[];
  radius: number;
};

/**
 * The putt itself, laid over the green: the dotted read ahead of the ball, the gold trace it
 * leaves behind, the cup, and the clock in the corner. It measures the page and writes the
 * ball's screen position, roll and drop into the world, where features/journey/ballAct.ts
 * draws the ball. Without WebGL, a plain marker stands in for the ball on the same line.
 */
export function JourneyClient() {
  const root = useRef<HTMLDivElement>(null);
  const trace = useRef<SVGPathElement>(null);
  const marker = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLDivElement>(null);
  const clock = useRef<HTMLSpanElement>(null);
  const chapter = useRef<HTMLSpanElement>(null);
  const current = useRef<Layout | null>(null);
  const [layout, setLayout] = useState<Layout | null>(null);

  useEffect(() => {
    const ribbon = root.current?.parentElement;
    const journey = root.current?.closest<HTMLElement>("[data-journey]");
    if (!ribbon || !journey) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const shape = current.current;
      if (!shape) return;
      const rect = ribbon.getBoundingClientRect();
      const along = (window.innerHeight * BALL_LINE - rect.top) / shape.height;
      const t = Math.min(shape.cup.t, Math.max(shape.from, along));
      const past = Math.max(0, (along - shape.cup.t) * shape.height);

      const x = shape.margin + lineX(t, shape.cup) * shape.inner;
      const y = t * shape.height;
      const step = 0.002;
      const dx = (lineX(t + step, shape.cup) - lineX(t - step, shape.cup)) * shape.inner;
      const dy = 2 * step * shape.height;
      const heading = Math.hypot(dx, dy) || 1;
      const travel = lengthAt(shape.points, t);
      const drop = Math.min(1, past / DROP_DISTANCE);

      Object.assign(world.ball, {
        visible: rect.bottom > 0 && rect.top < window.innerHeight,
        x: rect.left + x,
        y: rect.top + y,
        radius: shape.radius,
        travel,
        dirX: dx / heading,
        dirY: dy / heading,
        drop,
        daylight: (t - shape.from) / Math.max(1e-6, shape.cup.t - shape.from),
      });

      trace.current?.style.setProperty("stroke-dasharray", `${travel.toFixed(1)} ${shape.total + 10}`);
      if (marker.current) {
        marker.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${1 - drop * 0.45})`;
      }
      if (clock.current) clock.current.textContent = clockAt(shape.stamps, t);
      if (chapter.current) {
        // Named for the chapter the ball is in, from the moment its top passes the ball.
        const reached = [...shape.stamps].reverse().find((stamp) => t >= stamp.start);
        chapter.current.textContent = reached?.name ?? shape.stamps[0]?.name ?? "";
      }
      if (readout.current) {
        const showing = rect.top < window.innerHeight * 0.4 && rect.bottom > window.innerHeight * 0.7;
        readout.current.dataset.showing = String(showing);
      }
    };

    const measure = () => {
      const rect = ribbon.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const { clientWidth: width, clientHeight: height } = ribbon;
      if (width === 0 || height === 0) return;

      const chapters = [...journey.querySelectorAll<HTMLElement>("[data-chapter]")];
      const middleOf = (element: HTMLElement) => {
        const box = element.getBoundingClientRect();
        return (box.top + window.scrollY + box.height / 2 - top) / height;
      };
      const topOf = (element: HTMLElement) =>
        (element.getBoundingClientRect().top + window.scrollY - top) / height;
      const last = chapters.at(-1);
      const cup: Cup = { t: last ? middleOf(last) : 0.95, x: 0.5 };
      // The address: where the ball sits when the page is at the top.
      const from = Math.min(cup.t - 0.05, Math.max(0, (window.innerHeight * BALL_LINE - top) / height));
      // A golf ball's size against the green: small on a phone's narrow strip, larger on desktop.
      const radius = Math.min(30, Math.max(10, width * 0.05));
      const edge = width < 120 ? 8 : 14; // the leather binding's width (Ribbon.tsx)
      const margin = radius + edge + 2;
      const inner = Math.max(0, width - margin * 2);
      // Moving the line sideways doesn't change its length, so the rolled distances still hold.
      const points = traceLine(from, cup, inner, height).map((point) => ({ ...point, x: point.x + margin }));
      const stamps = chapters.map((element, index) => ({
        t: index === 0 ? from : middleOf(element),
        minutes: toMinutes(element.dataset.time ?? "06:00"),
        name: element.dataset.name ?? "",
        start: index === 0 ? 0 : topOf(element),
      }));

      const next: Layout = {
        width,
        height,
        margin,
        inner,
        from,
        cup,
        points,
        path: toPath(points),
        total: points.at(-1)?.length ?? 0,
        stamps,
        radius,
      };
      current.current = next;
      setLayout(next);
      update();
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    measure();
    const observer = new ResizeObserver(() => measure());
    observer.observe(ribbon);
    observer.observe(journey);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
      world.ball.visible = false;
    };
  }, []);

  const cupSize = layout ? layout.radius * 2 * 2.3 : 0;

  return (
    <div ref={root} aria-hidden className="pointer-events-none absolute inset-0">
      {layout ? (
        <>
          <svg className="absolute inset-0 overflow-visible" width={layout.width} height={layout.height}>
            {/* The read: where the ball is going, dotted. */}
            <path
              d={layout.path}
              fill="none"
              stroke="var(--color-gold)"
              strokeOpacity="0.85"
              strokeWidth="2.6"
              strokeDasharray="0.5 9"
              strokeLinecap="round"
            />
            {/* The trace: where it has been, solid, so every earlier stage stays visible. */}
            <path
              ref={trace}
              d={layout.path}
              fill="none"
              stroke="var(--color-gold)"
              strokeWidth="3"
              strokeLinecap="round"
              style={{ strokeDasharray: `0 ${layout.total + 10}`, filter: "drop-shadow(0 0 6px rgb(212 175 55 / 0.55))" }}
            />
          </svg>

          {/* The cup, with its gold liner. */}
          <div
            className="absolute rounded-full shadow-[inset_0_6px_14px_rgb(0_0_0/0.9)] ring-2 ring-gold/80"
            style={{
              width: cupSize,
              height: cupSize,
              left: layout.margin + layout.cup.x * layout.inner - cupSize / 2,
              top: layout.cup.t * layout.height - cupSize / 2,
              background: "radial-gradient(circle at 50% 38%, #050302 55%, #1c140c 100%)",
            }}
          />

          {/* Stands in for the 3D ball wherever the world isn't drawing it. */}
          <div
            ref={marker}
            data-ball-marker
            className="absolute left-0 top-0 rounded-full shadow-[0_6px_12px_rgb(0_0_0/0.45)] transition-opacity duration-700"
            style={{
              width: layout.radius * 2,
              height: layout.radius * 2,
              background: "radial-gradient(circle at 35% 30%, #ffffff 0%, #ecebe5 45%, #b9b6ac 100%)",
            }}
          />
        </>
      ) : null}

      <div
        ref={readout}
        data-showing="false"
        className="fixed bottom-5 left-5 z-30 flex items-baseline gap-3 transition-opacity duration-500 ease-fluid data-[showing=false]:opacity-0 md:bottom-7 md:left-7"
      >
        <span ref={clock} className="type-figure text-xl text-alabaster md:text-2xl">
          06:12
        </span>
        <span ref={chapter} className="type-label text-alabaster/70">
          First light
        </span>
      </div>
    </div>
  );
}
