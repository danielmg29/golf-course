"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "@/components/ui/icons";
import { Photo } from "@/components/ui/primitives";
import type { PhotoName } from "@/lib/photos";
import { cn } from "@/lib/utils";

type Facility = {
  id: string;
  name: string;
  title: string;
  body: string;
  photo: PhotoName;
  link?: { href: string; label: string };
  /** Where it sits on the plan (a 100 × 60 frame), and the path to it from the clubhouse. */
  at: [number, number];
  path: string;
};

const HUB: [number, number] = [36, 34];

const facilities: Facility[] = [
  {
    id: "terrace",
    name: "The terrace",
    title: "Lunch above the ninth",
    body: "Breakfast from 06:00 for the early groups, long lunches on the terrace and a proper dinner menu once the sun goes down. Golfers don't need to change.",
    photo: "terrace",
    at: [18, 14],
    path: "M36 34 C 30 28, 24 22, 18 14",
  },
  {
    id: "pool",
    name: "The pool",
    title: "Twenty-five metres, and a long lunch",
    body: "Loungers, shade and food brought to you. Open to members, and to anyone with a day pass.",
    photo: "pool",
    link: { href: "#day-pass", label: "Get a day pass" },
    at: [12, 48],
    path: "M36 34 C 28 38, 20 44, 12 48",
  },
  {
    id: "gym",
    name: "The gym",
    title: "Warm up, or stay all morning",
    body: "Cardio, free weights and a golf-fitness programme written with our club professional. Open from 05:30.",
    photo: "gym",
    link: { href: "#day-pass", label: "Get a day pass" },
    at: [38, 54],
    path: "M36 34 C 37 40, 37 47, 38 54",
  },
  {
    id: "tennis",
    name: "Tennis",
    title: "Two courts under the trees",
    body: "Book by the hour, with rackets and balls from the pro shop. Coaching on weekday afternoons.",
    photo: "tennis",
    link: { href: "#day-pass", label: "Get a day pass" },
    at: [58, 50],
    path: "M36 34 C 44 40, 51 46, 58 50",
  },
  {
    id: "rooms",
    name: "Meeting rooms",
    title: "A room with a better view",
    body: "A conference room for forty, with a screen and good coffee. Add it to a company golf day, or hire it by itself.",
    photo: "lounge",
    link: { href: "/events#golf-days", label: "Plan a golf day" },
    at: [46, 12],
    path: "M36 34 C 40 27, 43 19, 46 12",
  },
  {
    id: "bays",
    name: "Floodlit bays",
    title: "Toptracer, by the hour",
    body: "Every shot traced on screen, with games for people who've never held a club. Open until 23:00.",
    photo: "bays",
    link: { href: "#bays", label: "Book a bay" },
    at: [74, 36],
    path: "M36 34 C 50 32, 62 35, 74 36",
  },
];

// The line arrives from the course, off the plan's top right, and runs into the clubhouse.
const COURSE_ROUTE = "M100 6 C 84 10, 66 14, 56 20 S 42 30, 36 34";

/**
 * The club's grounds as a plan: the course's line comes in to the clubhouse and branches out
 * to everything else. Pick a place and its path turns gold and its details open beside the plan.
 */
export function GroundsMap() {
  const [selected, setSelected] = useState(facilities[0].id);

  return (
    <div className="grid-swiss gap-y-10">
      <figure data-draw-scope className="relative col-span-full lg:col-span-7">
        <svg viewBox="0 0 100 60" className="block h-auto w-full" role="group" aria-label="The club's grounds: pick a place to see it">
          <path data-draw d={COURSE_ROUTE} fill="none" pathLength={1} strokeDasharray={1} className="stroke-gold [stroke-width:0.45]" />
          <text x={97} y={4} textAnchor="end" className="halo fill-current font-ui text-[3px] font-semibold md:text-[2.1px]">
            From the eighteenth
          </text>
          {facilities.map((facility, index) => {
            const active = facility.id === selected;
            return (
              <g key={facility.id}>
                <path
                  data-draw
                  data-delay={0.6 + index * 0.08}
                  d={facility.path}
                  fill="none"
                  pathLength={1}
                  strokeDasharray={1}
                  className={cn("transition-[stroke,stroke-width,opacity] duration-200", active ? "stroke-gold [stroke-width:0.45]" : "stroke-current opacity-45 [stroke-width:0.22]")}
                />
                <a
                  href={`#facility-${facility.id}`}
                  aria-label={facility.name}
                  aria-current={active ? "true" : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    setSelected(facility.id);
                  }}
                  className="group outline-none"
                >
                  <circle cx={facility.at[0]} cy={facility.at[1]} r={4} fill="transparent" />
                  <circle
                    cx={facility.at[0]}
                    cy={facility.at[1]}
                    r={active ? 1.6 : 1.2}
                    className={cn("transition-[fill,r] duration-200", active ? "fill-gold" : "fill-current group-hover:fill-gold group-focus-visible:fill-gold")}
                  />
                  <text
                    x={facility.at[0]}
                    y={facility.at[1] + (facility.at[1] > 40 ? 4.2 : -2.6)}
                    textAnchor="middle"
                    className={cn("halo font-ui text-[3.4px] font-semibold md:text-[2.3px]", active ? "fill-gold" : "fill-current")}
                  >
                    {facility.name}
                  </text>
                </a>
              </g>
            );
          })}
          <rect x={HUB[0] - 2} y={HUB[1] - 2} width={4} height={4} className="fill-gold" />
          <text x={HUB[0] + 3.2} y={HUB[1] + 4.6} className="halo fill-current font-ui text-[3.4px] font-semibold md:text-[2.3px]">
            Clubhouse
          </text>
        </svg>
      </figure>

      <div className="col-span-full lg:col-span-5">
        {facilities.map((facility) => (
          <article key={facility.id} id={`facility-${facility.id}`} hidden={facility.id !== selected} aria-live="polite">
            <div className="relative aspect-[4/3] overflow-hidden">
              <Photo name={facility.photo} sizes="(min-width: 1024px) 40vw, 100vw" decorative />
            </div>
            <h3 className="mt-6 font-display text-h1 font-light">{facility.name}</h3>
            <p className="mt-2 font-display text-h3 italic text-gold">{facility.title}</p>
            <p className="type-body mt-4 max-w-[46ch]">{facility.body}</p>
            {facility.link ? (
              <Link href={facility.link.href} className="group mt-6 inline-flex items-center gap-3 font-ui text-[15px] font-semibold">
                <span className="border-b border-gold pb-1">{facility.link.label}</span>
                <ArrowRight width={16} height={16} className="text-gold transition-transform duration-200 ease-out group-hover:translate-x-1" />
              </Link>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
