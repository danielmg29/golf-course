import type { Metadata } from "next";
import Link from "next/link";
import { ClosingBand, PhotoStrip } from "@/components/layout/Editorial";
import { Page } from "@/components/layout/Page";
import { PageHero } from "@/components/layout/PageHero";
import { type TimelineStop, Timeline } from "@/components/layout/Timeline";
import { DemoNote, Section, SectionRule, TextLink } from "@/components/ui/primitives";
import { Panorama } from "@/features/club/Panorama";
import { site } from "@/lib/site";
import { button } from "@/lib/variants";

export const metadata: Metadata = {
  title: "About",
  description: `The club, the ground and the people who look after both at ${site.fullName}.`,
};

const commitments = [
  {
    title: "The ground",
    body: "We water from our own dams, keep indigenous trees between the fairways and mow only what the game needs.",
  },
  {
    title: "The game",
    body: "A low handicap isn't the price of entry. Our four-ball board puts new golfers and visitors in good company from the first round.",
  },
  {
    title: "The evening",
    body: "A round is only part of a day here. The terrace, the pool and the floodlit bays keep the club busy long after the last putt.",
  },
];

const people = [
  { role: "Club professional", body: "Runs lessons, clinics and the pro shop, and writes the tips on our course map." },
  { role: "Head greenkeeper", body: "Out before first light, so the first group of the day finds the greens at their best." },
  { role: "Caddie master", body: "Matches every round with a caddie who knows each borrow on the course." },
  { role: "General manager", body: "Looks after members, guests and every event from a Tuesday medal to a company day." },
];

// Sample milestones until the club's own history is in: the shape of the story, not its facts.
const heritage: TimelineStop[] = [
  { mark: "1968", title: "Nine holes on the old estate", body: "The first members lay out nine holes between the coffee and the river." },
  { mark: "1984", title: "The back nine", body: "The course reaches eighteen, routed round the dams that still water it." },
  { mark: "1999", title: "A clubhouse above the ninth", body: "The terrace becomes the place every round ends." },
  { mark: "2016", title: "The pool and the floodlit bays", body: "The club stays busy long after the last putt." },
  { mark: "Today", title: "Booked from a phone", body: "Tee times, day passes and golf days, paid with M-Pesa." },
  {
    mark: "Next",
    title: "Your first round as a member",
    body: "The line runs on from here.",
    link: { href: "/membership", label: "Membership" },
  },
];

export default function AboutPage() {
  return (
    <Page>
      <PageHero
        pageName="About"
        title={<>The club beyond <em>the scorecard</em></>}
        intro={`${site.name} is a private golf club in ${site.place}, with its doors open to anyone who books ahead.`}
        photo="longShadows"
        position="50% 0%"
        facts="Private club, open to visitors"
      >
        <Link href="/membership" className={button({ tone: "gold" })}>
          Membership
        </Link>
        <TextLink href="/contact">Visit the club</TextLink>
      </PageHero>

      <Section tone="ivory">
        <SectionRule name="Our story" />
        <div className="grid-swiss mt-10">
          <h2 data-lines className="col-span-full font-display text-h1 font-light lg:col-span-9 lg:col-start-3">
            We think golf is at its best early in the morning, on a quiet course, <em>and at its most fun over a drink afterwards.</em> So that&apos;s the club we run.
          </h2>
          <p data-fade className="type-body col-span-full mt-8 max-w-[60ch] text-lead md:col-span-5 lg:col-span-5 lg:col-start-3">
            The working day in {site.place} starts early and ends late, and a good club should fit around it. You
            can book a dawn round from your phone and pay with M-Pesa, bring the team for a golf day, or skip golf
            altogether and spend the afternoon at the pool.
          </p>
        </div>
      </Section>

      {/* The fairway line becomes the club's timeline, past to present, and points on to Membership. */}
      <Section tone="forest">
        <SectionRule name="Heritage" />
        <div className="grid-swiss mt-10">
          <h2 data-lines className="col-span-full font-display text-display-lg font-light lg:col-span-8 lg:col-start-3">
            Half a century, <em>one long walk</em>
          </h2>
        </div>
        <Timeline stops={heritage} label="The club over the years" className="mt-16 md:mt-20" />
        <DemoNote className="mt-10">Sample dates and milestones, until the club&apos;s own history is in.</DemoNote>
      </Section>

      <PhotoStrip className="bg-reserve pb-24 md:pb-32" items={[{ photo: "mistFlag" }, { photo: "aerialBunkers" }, { photo: "duskWalk" }]} />

      <Section tone="paper">
        <SectionRule name="What we look after" />
        <h2 className="mt-10 font-display text-h2 font-light">What we look after</h2>
        <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-6">
          {commitments.map((item, index) => (
            <li key={item.title} data-fade data-delay={index * 0.1} className="border-t border-current/20 pt-6">
              <h2 className="font-display text-h2 font-light">{item.title}</h2>
              <p className="type-body mt-4">{item.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="deep">
        <SectionRule name="Who you'll meet" />
        <div className="grid-swiss mt-10">
          <h2 data-lines className="col-span-full font-display text-display-lg font-light lg:col-span-8 lg:col-start-3">
            The people <em>behind the round</em>
          </h2>
          <ul className="col-span-full mt-12 grid gap-x-6 md:grid-cols-2 lg:col-span-10 lg:col-start-3">
            {people.map((person) => (
              <li key={person.role} data-fade className="border-t border-current/20 py-7">
                <h3 className="font-display text-h3">{person.role}</h3>
                <p className="type-body mt-2 max-w-[44ch]">{person.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <section data-tone="dark" className="bg-reserve pt-24 text-alabaster md:pt-32">
        <div className="frame">
          <SectionRule name="The grounds" />
          <h2 data-lines className="mb-14 mt-10 max-w-[16ch] font-display text-display-lg font-light md:mb-20">
            Come and <em>walk the ground</em>
          </h2>
          <Panorama photo="pondFairway" position="50% 60%" />
        </div>
      </section>

      <ClosingBand photo="duskTrees" title={<>Start with <em>one round</em>, stay for the people</>}>
        <Link href="/membership" className={button({ tone: "gold" })}>
          Apply for membership
        </Link>
        <TextLink href="/book">Book a tee time</TextLink>
      </ClosingBand>
    </Page>
  );
}
