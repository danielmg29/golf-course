import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ClosingBand, PhotoStrip } from "@/components/layout/Editorial";
import { Page } from "@/components/layout/Page";
import { PageHero } from "@/components/layout/PageHero";
import { Section, SectionRule, TextLink } from "@/components/ui/primitives";
import { CourseExplorer } from "@/features/hole/CourseExplorer";
import { CoursePlan } from "@/features/hole/CoursePlan";
import { Scorecard } from "@/features/hole/Scorecard";
import type { Hole } from "@/lib/generated/schema";
import { findModelPage } from "@/lib/server-queries";
import { button } from "@/lib/variants";

export const metadata: Metadata = {
  title: "The Course",
  description: "Fly all eighteen holes on our 3D map, read the scorecard and plan your round.",
};

const notes = [
  { title: "Caddies", body: "Available for every round. Ask when you book, or at the caddie master's desk." },
  { title: "Carts", body: "A limited number, so reserve one ahead. Walking is welcome at all times." },
  { title: "Dress", body: "Collared shirts and tailored shorts or trousers. Soft spikes only." },
  { title: "Pace", body: "Four hours and ten minutes for eighteen holes. Please keep up with the group ahead." },
  { title: "Practice", body: "Range, chipping area and putting green open from 06:00. The bays stay lit until late." },
  { title: "Visitors", body: "Always welcome. Book online, pay with M-Pesa and check in fifteen minutes before your time." },
];

const getHoles = async () => {
  const page = await findModelPage("hole", { pageSize: 18 });
  return page?.rows ?? [];
};

async function ScorecardWithHoles({ holes }: { holes: Promise<Hole[]> }) {
  return <Scorecard holes={await holes} stacked />;
}

export default function CoursePage() {
  // Started here and not awaited, so nothing above waits for the database. Neon can take
  // several seconds to wake, and the map and the rest of the page don't need it to draw.
  const holes = getHoles();

  return (
    <Page>
      <PageHero
        pageName="The course"
        title={<>Eighteen holes, <em>one long walk</em></>}
        intro="Wide fairways, patient greens and enough water to keep you honest. Fly it below before you play it."
        photo="aerialHills"
        facts="Par 72 · 18 holes"
      >
        <Link href="/book" className={button({ tone: "gold" })}>
          Book a tee time
        </Link>
        <TextLink href="#course-map">Fly the course</TextLink>
      </PageHero>

      {/* The flyover: pick a hole and the camera swoops down to its tee, its route drawn in gold. */}
      <section id="course-map" data-tone="dark" data-floating="hide" className="scroll-mt-0 bg-reserve">
        <CourseExplorer holes={holes} />
      </section>

      {/* The line comes back to paper: the plan and the card, linked, then on to booking. */}
      <Section tone="ivory">
        <SectionRule name="The card" />
        <div className="grid-swiss mt-10">
          <h2 data-lines className="col-span-full font-display text-display-lg font-light lg:col-span-8 lg:col-start-3">
            Hole <em>by hole</em>
          </h2>
          <div className="col-span-full mt-12 lg:sticky lg:top-24 lg:col-span-6 lg:self-start">
            <CoursePlan scorecard="scorecard" mapAnchor="course-map" />
          </div>
          <div id="scorecard" className="col-span-full mt-12 lg:col-span-5 lg:col-start-8">
            <Suspense fallback={<div className="min-h-[34rem]" />}>
              <ScorecardWithHoles holes={holes} />
            </Suspense>
          </div>
        </div>
      </Section>

      <PhotoStrip
        className="bg-reserve py-6"
        items={[
          { photo: "sandBunker" },
          { photo: "aerialLake" },
          { photo: "sunFlag" },
          { photo: "ballOnTee" },
        ]}
      />

      <Section tone="paper">
        <SectionRule name="Before you play" />
        <h2 className="mt-10 font-display text-h2 font-light">Before you play</h2>
        <dl className="mt-12 grid gap-x-6 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <div key={note.title} data-fade className="border-t border-current/20 py-6">
              <dt className="font-display text-h3">{note.title}</dt>
              <dd className="type-body mt-2">{note.body}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <ClosingBand photo="swingLowSun" title={<>The first tee <em>opens at 06:30</em></>}>
        <Link href="/book" className={button({ tone: "gold" })}>
          Book a tee time
        </Link>
        <TextLink href="/membership">Play as a member</TextLink>
      </ClosingBand>
    </Page>
  );
}
