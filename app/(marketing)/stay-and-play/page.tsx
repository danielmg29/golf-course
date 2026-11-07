import type { Metadata } from "next";
import Link from "next/link";
import { ClosingBand, PhotoStrip } from "@/components/layout/Editorial";
import { Page } from "@/components/layout/Page";
import { type TimelineStop, Timeline } from "@/components/layout/Timeline";
import { PageHero } from "@/components/layout/PageHero";
import { DemoNote, Photo, Section, SectionRule, TextLink } from "@/components/ui/primitives";
import { Packager } from "@/features/stay/Packager";
import type { PhotoName } from "@/lib/photos";
import { site } from "@/lib/site";
import { button } from "@/lib/variants";

export const metadata: Metadata = {
  title: "Stay & Play",
  description: `Golf at ${site.name} with rooms, airport transfers and a safari, priced together.`,
};

const trips: { title: string; length: string; note: string; photo: PhotoName }[] = [
  { title: "The long weekend", length: "3 nights, 3 rounds", note: "Land on Thursday and fly home on Monday with your bag already packed.", photo: "lodgeRoom" },
  { title: "Golf and the Mara", length: "6 nights, 4 rounds", note: "Four rounds here, then two nights in the Mara during the best of the season.", photo: "balloon" },
  { title: "The full week", length: "7 nights, 5 rounds", note: "Five rounds at your own pace, a half day in Nairobi National Park and time at the pool.", photo: "lodge" },
];

// A sample week, day by day: the fairway line as a journey route.
const week: TimelineStop[] = [
  { mark: "1", detail: "Day", title: "Land and settle in", body: "Met at the airport, at the club by lunch, nine holes before sundowners." },
  { mark: "2", detail: "Day", title: "The first full round", body: "A dawn tee time while the course is quiet, the pool after." },
  { mark: "3", detail: "Day", title: "Round two, then the bays", body: "An afternoon round and a floodlit evening at the Toptracer bays." },
  { mark: "4", detail: "Day", title: "Nairobi National Park", body: "A half day with the giraffes, back for dinner on the terrace." },
  { mark: "5", detail: "Day", title: "Round three", body: "The back nine from the medal tees, with a caddie who knows every borrow." },
  {
    mark: "6–7",
    detail: "Days",
    title: "Out to the Mara",
    body: "Two nights in camp during the best of the season, flown both ways.",
    link: { href: "#build", label: "Build your trip" },
  },
];

export default function StayAndPlayPage() {
  return (
    <Page>
      <PageHero
        pageName="Stay & Play"
        title={<>Eighteen holes, <em>then the Mara</em></>}
        intro={`Come to ${site.place} for the golf and stay for everything else. Build a trip below and see the whole price at once.`}
        photo="safariSunset"
        position="50% 75%"
        facts="Rounds, rooms and a safari"
      >
        <Link href="#build" className={button({ tone: "gold" })}>
          Build your trip
        </Link>
        <TextLink href="#week">See a week</TextLink>
      </PageHero>

      <Section tone="ivory">
        <SectionRule name="Three ways to come" />
        <h2 className="mt-10 font-display text-h2 font-light">Three ways to come</h2>
        <ul className="mt-12 grid gap-10 md:grid-cols-3 md:gap-6">
          {trips.map((trip, index) => (
            <li key={trip.title}>
              <div data-clip data-delay={index * 0.1} className="relative aspect-[4/5] overflow-hidden">
                <Photo name={trip.photo} sizes="(min-width: 768px) 33vw, 100vw" decorative />
              </div>
              <div data-fade className="mt-6 border-t border-current/20 pt-5">
                <h2 className="font-display text-h2 font-light">{trip.title}</h2>
                <p className="type-meta mt-2 text-gold">{trip.length}</p>
                <p className="type-body mt-3">{trip.note}</p>
              </div>
            </li>
          ))}
        </ul>
        <DemoNote className="mt-8">Sample itineraries.</DemoNote>
      </Section>

      {/* The fairway line becomes the journey: across on wide screens, stacked on phones. */}
      <Section id="week" tone="forest">
        <SectionRule name="A week, day by day" />
        <div className="grid-swiss mt-10">
          <h2 data-lines className="col-span-full font-display text-display-lg font-light lg:col-span-8 lg:col-start-3">
            The full week, <em>tee to camp</em>
          </h2>
        </div>
        <Timeline stops={week} label="A week at the club and in the Mara" className="mt-16 md:mt-20" />
        <DemoNote className="mt-10">A sample itinerary.</DemoNote>
      </Section>

      <Section id="build" tone="deep" className="[&_aside]:bg-reserve">
        <SectionRule name="Build your trip" />
        <div className="grid-swiss mt-10">
          <h2 data-lines className="col-span-full font-display text-display-lg font-light lg:col-span-8 lg:col-start-3">
            One trip, <em>one price</em>
          </h2>
        </div>
        <div className="mt-12 md:mt-16">
          <Packager />
        </div>
      </Section>

      <PhotoStrip className="bg-reserve py-6" items={[{ photo: "giraffe" }, { photo: "aerialLake" }, { photo: "poolDusk" }]} />

      <ClosingBand photo="duskTrees" title={<>Pack your clubs <em>and a camera</em></>}>
        <Link href="/contact" className={button({ tone: "gold" })}>
          Talk to the travel desk
        </Link>
        <TextLink href="/course">See the course</TextLink>
      </ClosingBand>
    </Page>
  );
}
