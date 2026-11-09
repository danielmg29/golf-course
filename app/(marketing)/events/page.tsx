import type { Metadata } from "next";
import Link from "next/link";
import { ClosingBand } from "@/components/layout/Editorial";
import { Page } from "@/components/layout/Page";
import { type TimelineStop, Timeline } from "@/components/layout/Timeline";
import { PageHero } from "@/components/layout/PageHero";
import { DemoNote, Photo, Section, SectionRule, TextLink } from "@/components/ui/primitives";
import { upcomingEvents } from "@/features/event/data";
import { GolfDayBuilder } from "@/features/event/GolfDayBuilder";
import { Leaderboard } from "@/features/event/Leaderboard";
import { button } from "@/lib/variants";

export const metadata: Metadata = {
  title: "Events",
  description: "The club's calendar, live leaderboards and a company golf day you can price in five steps.",
};

export default function EventsPage() {
  // The fairway line becomes the calendar: each event a stop on it.
  const calendar: TimelineStop[] = upcomingEvents.map((event) => ({
    mark: event.date,
    detail: event.month,
    title: event.title,
    body: event.note,
    meta: event.kind,
  }));
  const next = upcomingEvents[0];

  return (
    <Page>
      <PageHero
        pageName="Events"
        title={<>Club days <em>and company days</em></>}
        intro="Follow an open live from anywhere, enter a medal, or price up a golf day for your whole team."
        photo="gala"
        facts={`Next: ${next.title}, ${next.date} ${next.month}`}
      >
        <Link href="#golf-days" className={button({ tone: "gold" })}>
          Plan a golf day
        </Link>
        <TextLink href="#leaderboard">Live scores</TextLink>
      </PageHero>

      <Section tone="ivory">
        <SectionRule name="Calendar" />
        <div className="grid-swiss mt-10">
          <h2 data-lines className="col-span-full font-display text-display-lg font-light lg:col-span-8 lg:col-start-3">
            What&apos;s <em>on the card</em>
          </h2>
        </div>
        <Timeline stops={calendar} label="Upcoming events" className="mt-16 md:mt-20" />
        <DemoNote className="mt-10">Sample events and dates.</DemoNote>
      </Section>

      <Section id="leaderboard" tone="forest">
        <SectionRule name="Live leaderboard" />
        <div className="grid-swiss mt-10 items-start gap-y-12">
          <div className="col-span-full lg:col-span-5 lg:col-start-3">
            <h2 data-lines className="font-display text-display-lg font-light">
              Watch it <em>from anywhere</em>
            </h2>
            <p data-fade className="type-body mt-6 max-w-[44ch] text-lead">
              On tournament days the scores update here hole by hole, so families, sponsors and rivals can follow
              along without being at the club.
            </p>
            <div data-clip className="relative mt-10 hidden aspect-[16/10] overflow-hidden lg:block">
              <Photo name="galleryCrowd" sizes="40vw" decorative />
            </div>
          </div>
          <div data-fade className="col-span-full ring-1 ring-alabaster/15 lg:col-span-5 lg:col-start-8">
            <Leaderboard className="bg-charcoal" />
          </div>
        </div>
      </Section>

      <Section id="golf-days" tone="deep" className="[&_aside]:bg-reserve">
        <SectionRule name="Company golf days" />
        <div className="grid-swiss mt-10">
          <h2 data-lines className="col-span-full font-display text-display-lg font-light lg:col-span-8 lg:col-start-3">
            Price your day <em>in five steps</em>
          </h2>
          <p data-fade className="type-body col-span-full mt-6 max-w-[50ch] text-lead lg:col-span-6 lg:col-start-3">
            Choose your numbers and extras and the estimate updates as you go, ready to take to your finance team.
          </p>
        </div>
        <div className="mt-12 md:mt-16">
          <GolfDayBuilder />
        </div>
      </Section>

      <ClosingBand photo="banquet" title={<>Your next offsite, <em>with better views</em></>}>
        <Link href="/contact" className={button({ tone: "gold" })}>
          Talk to the events desk
        </Link>
        <TextLink href="/amenities">See the meeting rooms</TextLink>
      </ClosingBand>
    </Page>
  );
}
