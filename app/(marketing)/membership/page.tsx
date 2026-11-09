import type { Metadata } from "next";
import Link from "next/link";
import { Page } from "@/components/layout/Page";
import { PageHero } from "@/components/layout/PageHero";
import { Check } from "@/components/ui/icons";
import { DemoNote, Photo, Section, SectionRule, TextLink } from "@/components/ui/primitives";
import { ApplyForm } from "@/features/member/ApplyForm";
import { ConnectionNetwork } from "@/features/member/ConnectionNetwork";
import { Directory } from "@/features/member/Directory";
import { FourBall } from "@/features/member/FourBall";
import { button } from "@/lib/variants";

export const metadata: Metadata = {
  title: "Membership",
  description: "Join the club, meet other members in the business directory and find a four-ball.",
};

const tiers = [
  {
    name: "Full",
    fee: "KES 180,000",
    note: "Seven days a week",
    perks: ["Unlimited golf", "Every club facility", "Business directory listing", "Priority tee times"],
  },
  {
    name: "Corporate",
    fee: "KES 450,000",
    note: "Four named players",
    perks: ["Golf for four nominees", "Two free golf days' room hire", "Directory listing for the firm", "Guest rate for clients"],
  },
  {
    name: "Young professional",
    fee: "KES 85,000",
    note: "Under 35",
    perks: ["Weekday golf", "Pool, gym and tennis", "Business directory listing", "Moves up to Full at 35"],
  },
  {
    name: "Country",
    fee: "KES 60,000",
    note: "Living over 100 km away",
    perks: ["Twenty-four rounds a year", "Every club facility", "Reciprocal rates elsewhere", "Stay & Play discounts"],
  },
];

// The people and benefits a membership connects you with, for the network beside the tiers.
const connections = ["Legal", "Finance", "Tech", "Agri", "Property", "Health", "Four-balls", "Tee times", "Other clubs", "Family"];

export default function MembershipPage() {
  return (
    <Page>
      <PageHero
        pageName="Membership"
        title={<>Better golf, <em>better company</em></>}
        intro="Priority on the tee sheet, a directory of people worth knowing and a board that always finds you a game."
        photo="duskWalk"
        position="50% 45%"
        facts="Four ways to join · by application"
      >
        <Link href="#apply" className={button({ tone: "gold" })}>
          Apply for membership
        </Link>
        <TextLink href="#four-ball">Find a four-ball</TextLink>
      </PageHero>

      {/* The fairway line becomes a network: you, the ways to join, and who each connects you with. */}
      <Section tone="ivory">
        <SectionRule name="Ways to join" />
        <div className="grid-swiss mt-10 gap-y-12">
          <h2 data-lines className="col-span-full font-display text-display-lg font-light lg:col-span-8 lg:col-start-3">
            One club, <em>a wider circle</em>
          </h2>
          <div className="col-span-full px-12 md:col-span-4 md:col-start-2 lg:col-span-5 lg:col-start-1 lg:px-10">
            <ConnectionNetwork tiers={tiers.map((tier) => tier.name.split(" ")[0])} links={connections} />
          </div>
          <ul className="col-span-full grid gap-x-6 sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
            {tiers.map((tier, index) => (
              <li key={tier.name} data-fade data-delay={index * 0.08} className="flex flex-col border-t border-current/20 py-6">
                <h3 className="font-display text-h2 font-light">{tier.name}</h3>
                <p className="mt-1 font-ui text-sm">
                  <span className="tabular-nums">{tier.fee}</span> a year <span aria-hidden>·</span> {tier.note}
                </p>
                <ul className="mt-4 space-y-2 font-ui text-sm">
                  {tier.perks.map((perk) => (
                    <li key={perk} className="flex gap-3">
                      <Check width={16} height={16} className="mt-0.5 shrink-0 text-gold" />
                      {perk}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
        <DemoNote className="mt-6">Sample tiers and fees.</DemoNote>
      </Section>

      <Section id="directory" tone="forest" className="[&_li.bg-charcoal]:bg-charcoal">
        <SectionRule name="Member directory" />
        <div className="grid-swiss mt-10">
          <h2 data-lines className="col-span-full font-display text-display-lg font-light lg:col-span-8 lg:col-start-3">
            Business <em>after the eighteenth</em>
          </h2>
          <p data-fade className="type-body col-span-full mt-6 max-w-[50ch] text-lead lg:col-span-6 lg:col-start-3">
            Find a lawyer, a lender or a future client among the members. Search by sector, and every listing is opt-in.
          </p>
        </div>
        <div className="mt-12 md:mt-16">
          <Directory />
        </div>
      </Section>

      <Section id="four-ball" tone="deep">
        <SectionRule name="Find a four-ball" />
        <div className="grid-swiss mt-10">
          <h2 data-lines className="col-span-full font-display text-display-lg font-light lg:col-span-8 lg:col-start-3">
            Nobody <em>plays alone</em>
          </h2>
          <p data-fade className="type-body col-span-full mt-6 max-w-[50ch] text-lead lg:col-span-6 lg:col-start-3">
            New to the club or just visiting? Pick an open game at your level and ask to join. The group gets a message straight away.
          </p>
        </div>
        <div className="mt-12 md:mt-16">
          <FourBall />
        </div>
      </Section>

      {/* The network becomes the application’s progress line. */}
      <section id="apply" data-tone="light" className="band-paper grid lg:grid-cols-2">
        <div data-clip className="relative min-h-80 overflow-hidden lg:min-h-full">
          <Photo name="toast" sizes="(min-width: 1024px) 50vw, 100vw" position="45% 30%" decorative />
        </div>
        <div className="px-5 py-20 md:px-12 md:py-28 lg:px-16">
          <SectionRule name="Apply" />
          <h2 data-lines className="mb-10 mt-10 max-w-[12ch] font-display text-display-lg font-light">
            Join <em>the club</em>
          </h2>
          <ApplyForm tiers={tiers.map((tier) => tier.name)} />
        </div>
      </section>
    </Page>
  );
}
