"use client";

import {
  BackToCourse,
  CourseCanvas,
  HolePanel,
  HoleStrip,
  MapLabels,
  useHoleSelection,
} from "@/features/hole/CourseParts";
import type { Hole } from "@/lib/generated/schema";

const idle = (
  <>
    <h2 className="font-display text-h2 font-light">Fly the course</h2>
    <p className="mt-3 font-ui text-lead text-paper/90">Pick a number to drop down to that tee.</p>
    <p className="mt-3 font-ui text-sm leading-relaxed text-paper/80">
      Each one shows the line of play, the numbers and a tip from the pro.
    </p>
  </>
);

/**
 * The roadmap's virtual drone map, as a block on the course page (the homepage has its own,
 * full-screen stage in features/home/CourseStage.tsx). The scene is drawn from the
 * routing in courseLayout.ts; pick a hole to swoop down to its tee. It can be swapped for real
 * drone captures later.
 *
 * `holes` is a promise because the map doesn't need the database. It draws straight away,
 * even when Neon is waking up, and only the name and numbers in the panel wait for the data.
 */
export function CourseExplorer({ holes }: { holes: Promise<Hole[]> }) {
  const { selected, select, step, plan } = useHoleSelection();

  return (
    <div className="bg-forest text-paper">
      <div className="relative h-[68svh] min-h-[440px] overflow-hidden md:h-[86svh]">
        <CourseCanvas className="absolute inset-0" />
        <MapLabels selected={selected} onSelect={select} />
        {selected !== null ? (
          <BackToCourse onClick={() => select(null)} className="absolute right-4 top-4 md:right-7 md:top-7" />
        ) : null}
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 hidden w-[56%] bg-[linear-gradient(90deg,rgb(16_47_37/0.9)_0%,rgb(16_47_37/0.6)_45%,transparent)] lg:block" />
        <aside className="absolute bottom-10 left-[112px] hidden w-[25rem] lg:block">
          <HolePanel plan={plan} holes={holes} onStep={step} idle={idle} />
        </aside>
      </div>
      <div className="frame py-4">
        <HoleStrip selected={selected} onSelect={select} />
      </div>
      <div className="frame pb-8 pt-2 lg:hidden">
        <HolePanel plan={plan} holes={holes} onStep={step} idle={idle} />
      </div>
    </div>
  );
}
