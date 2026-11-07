"use client";

import { type ReactNode, useRef, useState } from "react";
import { mapController } from "@/features/hole/courseLayout";
import {
  BackToCourse,
  CourseCanvas,
  HolePanel,
  HoleStrip,
  MapLabels,
  useHoleSelection,
} from "@/features/hole/CourseParts";
import type { Hole } from "@/lib/generated/schema";
import { gsap, MOTION_OK, useGSAP } from "@/lib/motion";
import { ScrollTrigger } from "@/lib/motion-scroll";
import { cn } from "@/lib/utils";

/**
 * Chapter 03 as the page's one immersive moment: the 3D course fills the screen, edge to edge,
 * and holds while you scroll. As it arrives, the ball from the hero and the land photograph
 * drops onto hole 1's green and rolls up by the pin; then the camera rises from that green until
 * the whole course and the country round it lie below. After that it's a map: pick a hole.
 *
 * `intro` is the chapter's index, heading and copy; `facts` the course in figures. Both stay
 * readable over the course on scrims, and give way to a hole's details once one is picked.
 */
export function CourseStage({
  holes,
  intro,
  facts,
  labelledBy,
}: {
  holes: Promise<Hole[]>;
  intro: ReactNode;
  facts: ReactNode;
  labelledBy: string;
}) {
  const root = useRef<HTMLElement>(null);
  const { selected, select, step, plan } = useHoleSelection();
  // Once the course has opened out below, phones give its labels the room the figures took.
  const [open, setOpen] = useState(false);

  useGSAP(
    () => {
      mapController.copyOver = true;
      // With reduced motion the story is told already: the ball by the pin, the course below.
      gsap.matchMedia().add(MOTION_OK, () => {
        mapController.arrival = 0;
        mapController.reveal = 0;
        ScrollTrigger.create({
          trigger: root.current,
          // The drop starts once the ball has rolled out of the land photograph above.
          start: "top 55%",
          end: "top top",
          onUpdate: (self) => (mapController.arrival = self.progress),
          onRefresh: (self) => (mapController.arrival = self.progress),
        });
        ScrollTrigger.create({
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => {
            mapController.reveal = self.progress;
            setOpen(self.progress > 0.55);
          },
          onRefresh: (self) => {
            mapController.reveal = self.progress;
            setOpen(self.progress > 0.55);
          },
        });
        return () => {
          mapController.arrival = 1;
          mapController.reveal = 1;
        };
      });
      return () => {
        mapController.copyOver = false;
      };
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="the-eighteen"
      aria-labelledby={labelledBy}
      data-tone="dark"
      // The floating buttons step aside so they never sit over the map's labels.
      data-floating="hide"
      className="relative h-[210svh] bg-forest text-paper motion-reduce:h-auto"
    >
      <div className="sticky top-0 h-svh min-h-[600px] overflow-hidden">
        <CourseCanvas className="absolute inset-0" />
        {/* Scrims keep the copy readable over the course: down the left on wide screens, over
            the top on phones, and under the strip of hole numbers at the foot. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(16_47_37/0.88)_0%,rgb(16_47_37/0.5)_34%,transparent_52%)] lg:bg-[linear-gradient(90deg,rgb(16_47_37/0.9)_0%,rgb(16_47_37/0.62)_28%,transparent_52%)]"
        />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-[linear-gradient(0deg,rgb(16_47_37/0.92),transparent)]" />
        <MapLabels selected={selected} onSelect={select} />

        <div className="frame pointer-events-none relative flex h-full flex-col pb-5 pt-24 md:pt-28">
          <div className={cn("pointer-events-auto transition-opacity duration-300 ease-out", plan && "max-lg:hidden")}>{intro}</div>

          <div className="mt-auto">
            <div className="pointer-events-auto mb-5 lg:w-[25rem]">
              {plan ? (
                <div className="max-h-[52svh] overflow-y-auto bg-forest/95 p-6 ring-1 ring-paper/15 md:p-7">
                  <HolePanel plan={plan} holes={holes} onStep={step} idle={null} />
                </div>
              ) : (
                <div className={cn("transition-opacity duration-300 ease-out", open && "max-lg:pointer-events-none max-lg:opacity-0")}>{facts}</div>
              )}
            </div>
            <HoleStrip selected={selected} onSelect={select} className="pointer-events-auto" />
          </div>
        </div>

        {selected !== null ? (
          <BackToCourse onClick={() => select(null)} className="absolute right-4 top-24 md:right-8 md:top-28" />
        ) : null}
      </div>
    </section>
  );
}
