"use client";

import { useEffect, useState } from "react";
import { holePlans, MAP_DEPTH, MAP_WIDTH, mapController, waterBodies } from "@/features/hole/courseLayout";
import { cn } from "@/lib/utils";

const x = (value: number) => value + MAP_WIDTH / 2;
const z = (value: number) => value + MAP_DEPTH / 2;

/**
 * The course as a yardage-book plan: every hole's line of play, drawn from the same routing as
 * the 3D map (courseLayout.ts), in the same quadratic curve. Point at a hole here or at its row
 * on the scorecard (rows marked data-hole inside `scorecard`) and its line turns gold; pick it
 * and the 3D map above flies to its tee. The fairway line, back from 3D to paper.
 */
export function CoursePlan({ scorecard, mapAnchor }: { scorecard: string; mapAnchor: string }) {
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const card = document.getElementById(scorecard);
    if (!card) return;
    const over = (event: Event) => {
      const row = (event.target as HTMLElement).closest<HTMLElement>("[data-hole]");
      setActive(row ? Number(row.dataset.hole) : null);
    };
    const leave = () => setActive(null);
    card.addEventListener("pointerover", over);
    card.addEventListener("focusin", over);
    card.addEventListener("pointerleave", leave);
    return () => {
      card.removeEventListener("pointerover", over);
      card.removeEventListener("focusin", over);
      card.removeEventListener("pointerleave", leave);
    };
  }, [scorecard]);

  const fly = (hole: number) => {
    mapController.select(hole);
    document.getElementById(mapAnchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <figure data-draw-scope className="relative">
      <svg viewBox={`-1 -1 ${MAP_WIDTH + 2} ${MAP_DEPTH + 2}`} className="block h-auto w-full" role="group" aria-label="Plan of the course: pick a hole to fly to it on the 3D map">
        {waterBodies.map((water) => (
          <circle key={`${water.x}:${water.z}`} cx={x(water.x)} cy={z(water.z)} r={water.r * 0.9} className="fill-current opacity-[0.08]" />
        ))}
        {holePlans.map((plan, index) => {
          const isActive = active === plan.number;
          const d = `M${x(plan.tee[0])} ${z(plan.tee[1])} Q ${x(plan.bend[0])} ${z(plan.bend[1])}, ${x(plan.green[0])} ${z(plan.green[1])}`;
          return (
            <a
              key={plan.number}
              href={`#${mapAnchor}`}
              aria-label={`Hole ${plan.number}: show it on the 3D map`}
              onClick={(event) => {
                event.preventDefault();
                fly(plan.number);
              }}
              onPointerEnter={() => setActive(plan.number)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(plan.number)}
              onBlur={() => setActive(null)}
              className="group outline-none"
            >
              {/* The fairway, as a broad soft corridor: wide enough to point at, too. */}
              <path
                d={d}
                fill="none"
                strokeLinecap="round"
                className={cn(
                  "transition-[stroke,stroke-opacity] duration-200",
                  isActive ? "stroke-gold [stroke-opacity:0.28]" : "stroke-current [stroke-opacity:0.1]",
                )}
                strokeWidth={plan.isParThree ? 0.9 : 1.5}
              />
              <path
                data-draw
                data-delay={index * 0.05}
                d={d}
                fill="none"
                pathLength={1}
                strokeDasharray={1}
                strokeLinecap="round"
                className={cn(
                  "transition-[stroke,stroke-width] duration-200 ease-out",
                  isActive ? "stroke-gold [stroke-width:0.32]" : "stroke-current opacity-60 [stroke-width:0.16] group-focus-visible:stroke-gold",
                )}
              />
              <circle cx={x(plan.green[0])} cy={z(plan.green[1])} r={0.78} className={cn("transition-colors duration-200", isActive ? "fill-gold" : "fill-current opacity-30")} />
              <circle cx={x(plan.tee[0])} cy={z(plan.tee[1])} r={0.18} className={isActive ? "fill-gold" : "fill-current"} />
              <text
                x={x(plan.tee[0])}
                y={z(plan.tee[1]) - 0.55}
                textAnchor="middle"
                className={cn("font-ui text-[0.95px] font-semibold tabular-nums", isActive ? "fill-gold" : "fill-current")}
              >
                {plan.number}
              </text>
            </a>
          );
        })}
      </svg>
      <figcaption className="type-meta mt-4 opacity-85">
        Pick a hole on the plan to fly to its tee on the 3D map. Sample routing.
      </figcaption>
    </figure>
  );
}
