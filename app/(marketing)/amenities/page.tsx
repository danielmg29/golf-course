import type { Metadata } from "next";
import Link from "next/link";
import { ClosingBand } from "@/components/layout/Editorial";
import { Page } from "@/components/layout/Page";
import { PageHero } from "@/components/layout/PageHero";
import { Photo, Section, SectionRule, TextLink } from "@/components/ui/primitives";
import { BayGrid } from "@/features/facility/BayGrid";
import { DayPass } from "@/features/facility/DayPass";
import { GroundsMap } from "@/features/facility/GroundsMap";
import { button } from "@/lib/variants";

export const metadata: Metadata = {
  title: "Amenities",
  description: "The clubhouse, pool, gym, tennis courts and floodlit Toptracer bays. Day passes for non-members.",
};

export default function AmenitiesPage() {
  return (
    <Page>
      <PageHero
        pageName="Amenities"
        title={<>Beyond <em>the eighteenth</em></>}
        intro="You don't have to play golf to spend the day here. Buy a day pass, or book a floodlit bay with friends."
        photo="poolDusk"
        facts="Pool · gym · tennis · floodlit bays"
      >
        <Link href="#day-pass" className={button({ tone: "gold" })}>
          Get a day pass
        </Link>
        <TextLink href="#bays">Book a bay</TextLink>
      </PageHero>

      {/* The course route comes in to the clubhouse and branches out to everything else. */}
      <Section tone="ivory">
        <SectionRule name="The grounds" />
        <div className="grid-swiss mt-10">
          <h2 data-lines className="col-span-full font-display text-display-lg font-light lg:col-span-8 lg:col-start-3">
            One path in, <em>six ways to spend the day</em>
          </h2>
        </div>
        <div className="mt-14 md:mt-20">
          <GroundsMap />
        </div>
      </Section>

      <Section id="day-pass" tone="forest" className="[&_aside]:bg-charcoal">
        <SectionRule name="Guest day pass" />
        <div className="grid-swiss mt-10">
          <h2 data-lines className="col-span-full font-display text-display-lg font-light lg:col-span-8 lg:col-start-3">
            No membership, <em>no problem</em>
          </h2>
          <p data-fade className="type-body col-span-full mt-6 max-w-[50ch] text-lead lg:col-span-6 lg:col-start-3">
            Pay with M-Pesa and get a code on your phone. Show it at the gate and walk in.
          </p>
        </div>
        <div className="mt-12 md:mt-16">
          <DayPass />
        </div>
      </Section>

      <section id="bays" data-tone="dark" className="relative isolate overflow-hidden bg-reserve pb-24 pt-32 text-alabaster md:pb-32 md:pt-48">
        <div className="absolute inset-x-0 top-0 -z-10 h-[42rem]">
          <Photo name="bays" sizes="100vw" decorative position="50% 40%" />
          <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgb(16_47_37/0.6)_0%,rgb(16_47_37/0.75)_50%,#102f25_100%)]" />
        </div>
        <div className="frame">
          <SectionRule name="Simulator and Toptracer" />
          <div className="grid-swiss mt-10">
            <h2 data-lines className="col-span-full font-display text-display-lg font-light lg:col-span-8 lg:col-start-3">
              Floodlit bays, <em>by the hour</em>
            </h2>
            <p data-fade className="type-body col-span-full mt-6 max-w-[50ch] text-lead lg:col-span-6 lg:col-start-3">
              Every shot traced on screen, with games for people who&apos;ve never held a club. Pick your bays, then add
              food to the order.
            </p>
          </div>
          <div className="mt-12 md:mt-16">
            <BayGrid />
          </div>
        </div>
      </section>

      <ClosingBand photo="aerialBunkers" title={<>And the course <em>is right there</em></>}>
        <Link href="/course" className={button({ tone: "gold" })}>
          See the course
        </Link>
        <TextLink href="/book">Book a tee time</TextLink>
      </ClosingBand>
    </Page>
  );
}
