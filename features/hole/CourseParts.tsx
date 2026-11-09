"use client";

import Link from "next/link";
import { type ReactNode, Suspense, use, useState } from "react";
import { SceneCanvas } from "@/components/three/SceneCanvas";
import { ArrowLeft, ArrowRight } from "@/components/ui/icons";
import { Photo } from "@/components/ui/primitives";
import { holePlans, landmarks, mapController, type HolePlan } from "@/features/hole/courseLayout";
import type { Hole } from "@/lib/generated/schema";
import { cn } from "@/lib/utils";

// The pieces of the course explorer, shared by the homepage's full-screen stage
// (features/home/CourseStage.tsx) and the course page (CourseExplorer.tsx).

const loadScene = () => import("./courseMapScene");

/** Which hole is picked, kept in step with the 3D camera through mapController. */
export function useHoleSelection() {
  // Starts from the controller so the panel and the camera agree after coming back to a page.
  const [selected, setSelected] = useState(mapController.selected);
  const select = (hole: number | null) => {
    setSelected(hole);
    mapController.select(hole);
  };
  const step = (by: number) => select((((selected ?? 1) - 1 + by + 18) % 18) + 1);
  const plan = holePlans.find((candidate) => candidate.number === selected);
  return { selected, select, step, plan };
}

/**
 * The 3D course, loaded only as it comes near. The aerial photograph lies underneath: it shows
 * until the scene's first frame covers it, and stays if WebGL never arrives.
 */
export function CourseCanvas({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div aria-hidden className="absolute inset-0">
        <Photo name="aerialHills" sizes="100vw" decorative />
      </div>
      <SceneCanvas
      load={loadScene}
      label="A 3D view of the course: eighteen holes with their fairways, greens, bunkers and ponds, the clubhouse, the pool and the floodlit bays"
        className="absolute inset-0"
      />
    </div>
  );
}

const LABEL_BASE = "pointer-events-auto absolute left-0 top-0 will-change-transform";

const registerLabel = (id: string) => (element: HTMLElement | null) => {
  if (!element) return;
  mapController.labels.set(id, element);
  return () => {
    mapController.labels.delete(id);
  };
};

const registerLayer = (element: HTMLElement | null) => {
  mapController.labelLayer = element;
  return () => {
    if (mapController.labelLayer === element) mapController.labelLayer = null;
  };
};

/** Hole numbers over their flags and the club's landmarks, moved by the scene to follow the camera. */
export function MapLabels({ selected, onSelect }: { selected: number | null; onSelect: (hole: number) => void }) {
  return (
    <div ref={registerLayer} className="pointer-events-none absolute inset-0 overflow-hidden">
      {holePlans.map(({ number }) => (
        <button
          key={number}
          ref={registerLabel(`hole-${number}`)}
          type="button"
          aria-label={`Fly to hole ${number}`}
          aria-pressed={selected === number}
          onClick={() => onSelect(number)}
          style={{ visibility: "hidden" }}
          className={cn(
            LABEL_BASE,
            "flex size-7 items-center justify-center rounded-full font-ui text-[11px] font-semibold tabular-nums ring-1 transition-[background-color,color,opacity] duration-200 ease-out md:size-8 md:text-xs",
            selected === number
              ? "bg-antique text-forest ring-antique"
              : "bg-forest/85 text-paper ring-antique/70 hover:bg-antique hover:text-forest",
            selected !== null && selected !== number && "opacity-40",
          )}
        >
          {number}
        </button>
      ))}
      {landmarks.map((landmark) => (
        <Link
          key={landmark.id}
          ref={registerLabel(landmark.id)}
          href={landmark.href}
          style={{ visibility: "hidden" }}
          className={cn(
            LABEL_BASE,
            "group whitespace-nowrap bg-forest/90 px-3 py-1.5 font-ui text-xs font-semibold text-paper ring-1 ring-paper/25 transition-[background-color,opacity] duration-200 ease-out hover:bg-club",
            selected !== null && "opacity-0 focus-visible:opacity-100",
          )}
        >
          {landmark.label}
          <span className="hidden text-antique md:group-hover:inline">: {landmark.action}</span>
        </Link>
      ))}
    </div>
  );
}

/** All eighteen numbers in a row: the way to pick a hole that works without WebGL too. */
export function HoleStrip({
  selected,
  onSelect,
  className,
}: {
  selected: number | null;
  onSelect: (hole: number) => void;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label="Choose a hole"
      className={cn(
        "flex gap-px overflow-x-auto [scrollbar-width:none] lg:grid lg:grid-cols-[repeat(18,minmax(0,1fr))]",
        className,
      )}
    >
      {holePlans.map(({ number }) => (
        <button
          key={number}
          type="button"
          aria-pressed={selected === number}
          aria-label={`Hole ${number}`}
          onClick={() => onSelect(number)}
          className={cn(
            "relative flex h-11 min-w-11 shrink-0 items-center justify-center border-t font-ui text-sm font-semibold tabular-nums transition-colors duration-200 ease-out",
            selected === number
              ? "border-antique text-antique after:absolute after:inset-x-0 after:-top-px after:h-[3px] after:bg-antique"
              : "border-paper/25 text-paper/80 hover:border-paper/60 hover:text-paper",
          )}
        >
          {String(number).padStart(2, "0")}
        </button>
      ))}
    </div>
  );
}

function HoleFigures({ par, yards, index }: { par: string; yards: string; index: string }) {
  const items = [
    { label: "Par", value: par },
    { label: "Yards", value: yards },
    { label: "Index", value: index },
  ];
  return (
    <dl className="mt-5 grid grid-cols-3 gap-4 border-t border-paper/20">
      {items.map((item) => (
        <div key={item.label} className="pt-3">
          <dt className="type-meta text-paper/75">{item.label}</dt>
          <dd className="mt-1 font-ui text-h3 font-light tabular-nums">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** The part of the panel that reads the database. If the read failed, it just shows the number. */
function HoleDetails({ holes, number }: { holes: Promise<Hole[]>; number: number }) {
  const hole = use(holes).find((candidate) => candidate.number === number);
  if (!hole) return <p className="mt-2 font-display text-h2 font-light">Hole {number}</p>;
  return (
    <>
      <p className="mt-2 font-display text-h2 font-light">{hole.name}</p>
      <HoleFigures par={String(hole.par)} yards={String(hole.yards)} index={String(hole.strokeIndex)} />
    </>
  );
}

/** The picked hole: its name and numbers from the database, the pro's tip, and a way to book. */
export function HolePanel({
  plan,
  holes,
  onStep,
  idle,
}: {
  plan: HolePlan | undefined;
  holes: Promise<Hole[]>;
  onStep: (by: number) => void;
  /** Shown while no hole is picked. */
  idle: ReactNode;
}) {
  if (!plan) return <>{idle}</>;
  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <p className="type-meta text-antique">Hole {plan.number}</p>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Previous hole"
            onClick={() => onStep(-1)}
            className="flex size-9 items-center justify-center text-antique ring-1 ring-antique/50 transition-colors duration-200 ease-out hover:bg-antique hover:text-forest"
          >
            <ArrowLeft width={14} height={14} />
          </button>
          <button
            type="button"
            aria-label="Next hole"
            onClick={() => onStep(1)}
            className="flex size-9 items-center justify-center text-antique ring-1 ring-antique/50 transition-colors duration-200 ease-out hover:bg-antique hover:text-forest"
          >
            <ArrowRight width={14} height={14} />
          </button>
        </div>
      </div>
      <Suspense
        fallback={
          <>
            <p className="mt-2 font-display text-h2 font-light">Hole {plan.number}</p>
            <HoleFigures par="–" yards="–" index="–" />
          </>
        }
      >
        <HoleDetails holes={holes} number={plan.number} />
      </Suspense>
      <p className="mt-5 font-ui text-sm leading-relaxed text-paper/85">
        <span className="type-meta mr-2 text-antique">Pro tip</span>
        {plan.tip}
      </p>
      <Link
        href="/book"
        className="mt-6 inline-flex h-11 w-full items-center justify-center bg-antique px-5 font-ui text-sm font-semibold text-forest transition-colors duration-200 ease-out hover:bg-[#c9a86c]"
      >
        Book a tee time
      </Link>
    </>
  );
}

/** Returns from a hole to the whole course. */
export function BackToCourse({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-10 items-center gap-2 bg-forest/90 px-4 font-ui text-sm font-semibold text-paper ring-1 ring-paper/25 transition-colors duration-200 ease-out hover:bg-club",
        className,
      )}
    >
      <ArrowLeft width={14} height={14} />
      The whole course
    </button>
  );
}
