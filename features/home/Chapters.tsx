import Link from "next/link";
import { type CSSProperties, Suspense } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight } from "@/components/ui/icons";
import { Crest, Photo } from "@/components/ui/primitives";
import { clubDay } from "@/features/club/DayAtTheClub";
import { Chapter, ChapterIndex, ChapterTitle, LineLink, onDark, primaryButton, Rule } from "@/features/home/Chapter";
import { CourseStage } from "@/features/home/CourseStage";
import { courseTotals } from "@/features/home/data";
import { HERO_FRAME, heroDrive, landHorizon, pathData } from "@/features/home/fairwayLine";
import { DayStrip } from "@/features/home/DayStrip";
import { openGames, sectors } from "@/features/member/data";
import type { Hole } from "@/lib/generated/schema";
import { site, whatsappLink } from "@/lib/site";
import { cn } from "@/lib/utils";

const lead = "font-ui text-lead";
const rise = (order: number) => ({ "--rise": order }) as CSSProperties;

// A fine antique-gold path that draws itself in (HomeMotion's data-draw). Only for SVGs that
// aren't stretched far out of proportion: there the normalised dash breaks into dashes.
const fairway = {
  fill: "none",
  stroke: "var(--color-antique)",
  strokeWidth: 1.5,
  vectorEffect: "non-scaling-stroke",
  pathLength: 1,
  strokeDasharray: 1,
} as const;

async function HeroFigures({ holes }: { holes: Promise<Hole[]> }) {
  const totals = courseTotals(await holes);
  if (!totals) return <span>Course figures unavailable</span>;
  return (
    <span className="flex flex-wrap gap-x-8 gap-y-1">
      <span>{totals.holes} holes</span>
      <span>Par {totals.par}</span>
      <span>{totals.yards.toLocaleString("en-GB")} yards</span>
    </span>
  );
}

async function CourseFacts({ holes }: { holes: Promise<Hole[]> }) {
  const totals = courseTotals(await holes);
  if (!totals) return <p className="font-ui text-sm text-paper/80">The course figures aren&apos;t available right now.</p>;
  const facts = [
    { label: "Holes", value: String(totals.holes) },
    { label: "Par", value: String(totals.par) },
    { label: "Yards", value: totals.yards.toLocaleString("en-GB") },
  ];
  return (
    <dl className="grid grid-cols-3 gap-4 border-t border-paper/25">
      {facts.map((fact) => (
        <div key={fact.label} className="pt-4">
          <dt className="type-meta text-paper/80">{fact.label}</dt>
          {/* The course in numerals, set as display type. */}
          <dd className="mt-2 font-ui text-h2 font-extralight tabular-nums tracking-tight">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** 01 — The invitation: before the first tee. */
export function Invitation({ holes }: { holes: Promise<Hole[]> }) {
  return (
    <section
      id="the-invitation"
      data-hero
      data-tone="dark"
      aria-labelledby="home-title"
      className="relative isolate flex min-h-svh flex-col overflow-hidden bg-forest text-paper"
    >
      <div aria-hidden className="absolute inset-0 -z-10">
        <div data-hero-image className="absolute inset-x-0 -inset-y-[6%]">
          <Photo name="aerialHills" sizes="100vw" preload position="50% 60%" decorative />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(16_47_37/0.5)_0%,rgb(16_47_37/0.64)_45%,rgb(16_47_37/0.95)_100%)]" />
      </div>
      {/* The ball on its tee. Scroll, and BallFlight drives it along the fairway line (heroDrive)
          as a 3D ball; this still one stands in until then, and for reduced motion. */}
      <svg
        aria-hidden
        viewBox={`0 0 ${HERO_FRAME.width} ${HERO_FRAME.height}`}
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 -z-10 size-full"
      >
        <circle data-ball-marker cx={heroDrive[0]} cy={heroDrive[1]} r="5" fill="var(--color-paper)" />
      </svg>

      <div className="frame flex flex-1 flex-col justify-end pb-8 pt-36 md:pb-10">
        <div className="grid-swiss">
          <p data-running-head="01 / 08" className="type-meta col-span-2 hidden pt-5 text-paper/85 lg:block">
            01<span aria-hidden> — </span>
            <span className="sr-only">: </span>The invitation
          </p>
          <div data-hero-rise className="col-span-full md:col-span-6 lg:col-span-9 lg:col-start-3">
            <h1 id="home-title" style={rise(0)} className="font-display text-display-xl font-light [text-wrap:balance]">
              <span className="block">Read the green.</span> <span className="block">Then make your move.</span>
            </h1>
            <p style={rise(1)} className={cn(lead, "mt-8 max-w-[34ch] text-paper/85")}>
              A round, a gathering, a new connection—or a day that takes you further. Discover what waits beyond the first tee.
            </p>
            <div style={rise(2)} className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
              <a href="#the-land" className={cn(primaryButton, onDark)}>
                Explore the club
              </a>
              <a href="#the-eighteen" className="group inline-flex items-center gap-3 font-ui text-[15px] font-semibold">
                <span className="border-b border-antique pb-1">Discover the course</span>
                <ArrowDown width={16} height={16} className="text-antique transition-transform duration-200 group-hover:translate-y-0.5" />
              </a>
            </div>
          </div>
        </div>

        {/* The first eighth of the fairway line, and the club in figures. */}
        <div className="mt-16 lg:mt-24">
          <div className="flex items-center gap-4">
            <p data-running-head="01 / 08" className="type-meta shrink-0 text-paper/85 lg:hidden">
              01<span aria-hidden> — </span>
              <span className="sr-only">: </span>The invitation
            </p>
            <Rule number={1} className="flex-1 text-paper" />
          </div>
          <div className="grid-swiss type-meta mt-4 gap-y-2 text-paper/85">
            <span className="col-span-2 lg:col-span-2">{site.fullName}</span>
            <span className="col-span-2 lg:col-span-2">{site.place}</span>
            <span className="col-span-full md:col-span-2 lg:col-span-5">
              <Suspense fallback={<span>&nbsp;</span>}>
                <HeroFigures holes={holes} />
              </Suspense>
            </span>
            <span className="col-span-full md:col-span-6 lg:col-span-3 lg:text-right">Aerial: placeholder photograph</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/** 02 — The land: the course and the club, introduced. */
export function TheLand() {
  return (
    <Chapter id="the-land" number={2} name="The land" tone="ivory" labelledBy="home-land">
      <ChapterTitle id="home-land">The land sets the pace.</ChapterTitle>
      <div data-rise className="col-span-full mt-8 md:col-span-4 lg:col-span-5 lg:col-start-3">
        <p className={cn(lead, "text-coal")}>
          Eighteen holes across open ground, a clubhouse above the ninth and a pool for the long afternoon. The course is the
          reason to arrive; the people on it are the reason to stay.
        </p>
        <LineLink href="/about" className="mt-8">
          About the club
        </LineLink>
      </div>
      <figure className="col-span-full mt-14 lg:mt-20">
        {/* data-land-photo: the ball lands here and rolls along the horizon line (BallFlight). */}
        <div data-mask data-land-photo className="relative aspect-[4/3] overflow-hidden md:aspect-[21/9]">
          <Photo name="rollingHills" sizes="100vw" position="50% 55%" decorative />
          {/* The fairway line traces the horizon where the field meets the trees (about 49% down
              this photograph at both crops), then settles into the land's contours below it. */}
          {/* A soft forest halo keeps the gold readable over sunlit grass. */}
          <svg
            aria-hidden
            viewBox="0 0 1440 620"
            preserveAspectRatio="none"
            className="absolute inset-0 size-full [filter:drop-shadow(0_0_1.5px_rgb(16_47_37/0.75))]"
          >
            <path data-draw d={pathData(landHorizon)} {...fairway} strokeWidth={2} />
            <path data-draw d="M0 418 C 300 392, 520 450, 800 424 S 1220 394, 1440 420" {...fairway} strokeOpacity={0.85} />
            <path data-draw d="M0 528 C 260 500, 600 562, 900 530 S 1260 508, 1440 536" {...fairway} strokeOpacity={0.65} />
          </svg>
        </div>
        <figcaption className="grid-swiss type-meta mt-4 text-coal/80">
          <span className="col-span-1 lg:col-span-2">Fig. 01</span>
          <span className="col-span-3 lg:col-span-8 lg:col-start-3">The land in morning light. Placeholder photograph.</span>
        </figcaption>
      </figure>
    </Chapter>
  );
}

/** 03 — The eighteen: the one immersive moment, the course flyover, full screen. */
export function TheEighteen({ holes }: { holes: Promise<Hole[]> }) {
  return (
    <CourseStage
      holes={holes}
      labelledBy="home-eighteen"
      intro={
        <div className="grid-swiss">
          <ChapterIndex number={3} name="The eighteen" />
          <ChapterTitle id="home-eighteen" size="h1">
            Fly the course before you play it.
          </ChapterTitle>
          <div className="col-span-full mt-5 md:col-span-4 lg:col-span-4 lg:col-start-3">
            <p className={cn(lead, "text-paper/90")}>
              Drop from above the course to any tee. Each hole shows its line of play, its par and yardage, and a tip from the pro.
            </p>
            <LineLink href="/course" className="mt-6">
              Open the course guide
            </LineLink>
          </div>
        </div>
      }
      facts={
        <Suspense fallback={<div className="h-[6.5rem]" />}>
          <CourseFacts holes={holes} />
        </Suspense>
      }
    />
  );
}

/** 04 — The club in motion: one day, as the chapter's single horizontal story. */
export function ClubInMotion() {
  return (
    <Chapter
      id="club-in-motion"
      number={4}
      name="The club in motion"
      tone="paper"
      labelledBy="home-motion"
      className="pb-14 lg:pb-0"
      after={<DayStrip hours={clubDay} />}
    >
      <ChapterTitle id="home-motion">Beyond the eighteenth, the day keeps moving.</ChapterTitle>
      <div data-rise className="col-span-full mt-8 md:col-span-4 lg:col-span-5 lg:col-start-3">
        <p className={cn(lead, "text-coal")}>
          Practice under floodlights, lunch on the terrace, a swim before the drive home, and club days that bring everyone back.
        </p>
      </div>
    </Chapter>
  );
}

const nextGame = openGames[0];

/** 05 — The people make the club: membership, the four-ball and the directory. */
export function ThePeople() {
  const ways = [
    {
      title: "Membership, by application",
      body: "Tell the club who you are and how you play. Every application is read by the club.",
      action: (
        <a href="/membership#apply" className={cn(primaryButton, onDark, "mt-7")}>
          Apply for membership
        </a>
      ),
    },
    {
      title: "Find a four",
      body: `${nextGame.when}: ${nextGame.players.length} of 4 places taken, handicaps ${nextGame.band}. ${nextGame.note}`,
      note: "Sample game",
      action: (
        <LineLink href="/membership#four-ball" className="mt-7">
          See open games
        </LineLink>
      ),
    },
    {
      title: "The member directory",
      body: `An opt-in directory of members by sector: ${sectors
        .slice(1)
        .map((sector) => sector.toLowerCase())
        .join(", ")}.`,
      note: "Sample directory",
      action: (
        <LineLink href="/membership#directory" className="mt-7">
          Browse the directory
        </LineLink>
      ),
    },
  ];

  return (
    <Chapter id="the-people" number={5} name="The people make the club" tone="forest" labelledBy="home-people">
      <ChapterTitle id="home-people">The people make the club.</ChapterTitle>
      <div data-rise className="col-span-full mt-8 md:col-span-4 lg:col-span-5 lg:col-start-3">
        <p className={cn(lead, "text-paper/85")}>
          Founders, bankers, growers and surgeons share the same first tee. Membership is by application, and the club reads
          every one.
        </p>
      </div>
      {/* The fairway line branches: three ways into the club. */}
      <svg
        aria-hidden
        viewBox="0 0 1000 48"
        preserveAspectRatio="none"
        className="col-span-full mt-16 hidden h-12 w-full md:block lg:col-span-10 lg:col-start-3"
      >
        <path data-draw d="M0 1 H1000 M0 1 V48 M341 1 V48 M681 1 V48" {...fairway} />
      </svg>
      <div
        data-rise
        className="col-span-full mt-14 grid gap-12 md:mt-0 md:grid-cols-3 md:gap-5 lg:col-span-10 lg:col-start-3 lg:gap-6"
      >
        {ways.map((way) => (
          <div key={way.title} className="border-t border-paper/25 pt-5 md:border-t-0 md:pt-4">
            <h3 className="font-display text-h3 font-light">{way.title}</h3>
            <p className="mt-3 max-w-[34ch] font-ui text-[15px] leading-relaxed text-paper/85">{way.body}</p>
            {way.note ? <p className="type-meta mt-3 text-paper/80">{way.note}</p> : null}
            {way.action}
          </div>
        ))}
      </div>
    </Chapter>
  );
}

const itinerary = [
  { when: "Day one, 07:10", title: "Eighteen holes", note: "Your round, booked with the trip" },
  { when: "Day one, evening", title: "A partner lodge", note: "Dinner and a quiet night" },
  { when: "Day two, 05:45", title: "Transfer at first light", note: "Out of the city, into the wild" },
  { when: "Day two, morning", title: "A game drive", note: "Then home, or another round" },
];

/** 06 — Stay a little longer: the fairway line leaves the club and becomes a journey. */
export function StayLonger() {
  return (
    <Chapter id="stay-and-play" number={6} name="Stay a little longer" tone="ivory" labelledBy="home-stay">
      <ChapterTitle id="home-stay">Stay a little longer.</ChapterTitle>
      <div data-rise className="col-span-full mt-8 md:col-span-4 lg:col-span-5 lg:col-start-3">
        <p className={cn(lead, "text-coal")}>Pair a round with a night nearby and a morning in the wild, built around your tee time.</p>
        <LineLink href="/stay-and-play" className="mt-8">
          Build a trip
        </LineLink>
      </div>
      <figure className="col-span-full mt-12 md:col-span-2 md:col-start-5 md:mt-8 lg:col-span-4 lg:col-start-9 lg:row-span-2">
        <div data-mask className="relative aspect-[4/5] overflow-hidden">
          <Photo name="safariSunset" sizes="(min-width: 1024px) 30vw, (min-width: 768px) 33vw, 100vw" decorative />
        </div>
        <figcaption className="type-meta mt-4 text-coal/80">Fig. 02 · Placeholder photograph</figcaption>
      </figure>
      {/* Beside the photograph on desktop: the journey, one stop after another. */}
      <ol
        data-rise
        aria-label="A sample trip"
        className="col-span-full mt-16 grid gap-10 md:grid-cols-4 md:gap-5 lg:col-span-6 lg:col-start-3 lg:mt-14 lg:self-end"
      >
        {itinerary.map((stop, index) => (
          <li key={stop.title} className="relative pl-9 md:pl-0 md:pt-10">
            {index < itinerary.length - 1 ? (
              <span
                aria-hidden
                className="absolute bottom-[-2.5rem] left-[5px] top-3 w-px bg-antique md:bottom-auto md:left-3 md:right-[-1.25rem] md:top-[5px] md:h-px md:w-auto"
              />
            ) : null}
            <span aria-hidden className="absolute left-0 top-1 size-[11px] rounded-full bg-antique md:top-0" />
            <p className="type-meta text-coal/80">{stop.when}</p>
            <h3 className="mt-3 font-display text-[1.375rem] font-light leading-tight md:text-h3">{stop.title}</h3>
            <p className="mt-1.5 font-ui text-sm text-coal/80">{stop.note}</p>
          </li>
        ))}
      </ol>
      <p className="type-meta col-span-full mt-10 text-coal/80 lg:col-span-6 lg:col-start-3">
        A sample itinerary. Partners, transfers and availability are confirmed when you enquire.
      </p>
    </Chapter>
  );
}

const steps = ["Choose", "Date and time", "Pay with M-Pesa", "Confirmed"];

const actions = [
  { title: "Tee time", note: "Pick a slot, pay with M-Pesa", detail: "Tomorrow 06:40 · 07:10 · 07:50", href: "/book" },
  { title: "Simulator bay", note: "Floodlit, by the hour", detail: "Toptracer", href: "/amenities#bays" },
  { title: "Guest day pass", note: "Pool, gym and tennis", detail: "QR pass on your phone", href: "/amenities#day-pass" },
  { title: "Golf days and events", note: "Register, or price a corporate day", detail: "Quote in shillings", href: "/events#golf-days" },
  { title: "Leaderboard", note: "Follow the scores as they come in", detail: "Sample scores", href: "/events#leaderboard" },
];

/** 07 — Make your move: the fairway line becomes a stepper, then the ways to book. */
export function MakeYourMove() {
  return (
    <Chapter id="make-your-move" number={7} name="Make your move" tone="forest" labelledBy="home-move">
      <ChapterTitle id="home-move">Make your move.</ChapterTitle>
      <div data-rise className="col-span-full mt-8 md:col-span-4 lg:col-span-5 lg:col-start-3">
        <p className={cn(lead, "text-paper/85")}>
          Tee times, simulator bays, guest passes and club days, booked in a few steps and paid with M-Pesa.
        </p>
      </div>
      <ol aria-label="How booking works" className="col-span-full mt-14 grid grid-cols-4 gap-4 lg:col-span-10 lg:col-start-3 lg:gap-6">
        {steps.map((step, index) => (
          <li key={step} className="relative pt-8">
            <span
              aria-hidden
              className={cn("absolute left-0 top-[5px] h-px bg-antique", index < steps.length - 1 ? "-right-4 lg:-right-6" : "w-3")}
            />
            <span aria-hidden className="absolute left-0 top-0 size-[11px] rounded-full bg-antique" />
            <span className="type-meta block text-paper/80">{String(index + 1).padStart(2, "0")}</span>
            <span className="mt-1 block font-ui text-[15px] font-semibold">{step}</span>
          </li>
        ))}
      </ol>
      <ul className="col-span-full mt-14 border-t border-paper/25 lg:col-span-10 lg:col-start-3">
        {actions.map((action) => (
          <li key={action.title} className="border-b border-paper/25">
            <Link
              href={action.href}
              className="group grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 py-6 md:grid-cols-[minmax(0,3fr)_minmax(0,4fr)_minmax(0,3fr)_auto]"
            >
              <span className="font-display text-h3 font-light">{action.title}</span>
              <ArrowUpRight
                width={18}
                height={18}
                className="row-span-2 self-center text-antique transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 md:order-last md:row-span-1"
              />
              <span className="font-ui text-[15px] text-paper/85">{action.note}</span>
              <span className="type-meta hidden text-paper/80 md:block">{action.detail}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="col-span-full mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 lg:col-span-10 lg:col-start-3">
        <Link href="/book" className={cn(primaryButton, onDark)}>
          Book a tee time
        </Link>
        <p className="type-meta max-w-[52ch] text-paper/80">
          Bookings and payments on this site are a demonstration: nothing is charged, and the times shown are samples.
        </p>
      </div>
    </Chapter>
  );
}

/** 08 — The day continues: contact, WhatsApp, and the line resolving into the club mark. */
export function DayContinues() {
  const channels = [
    { title: "Chat on WhatsApp", href: whatsappLink("Hello, I'd like to know more about the club."), external: true },
    { title: "Send an enquiry", href: "/contact", external: false },
    { title: "Find the club", href: "/contact", external: false },
  ];

  return (
    <Chapter id="the-day-continues" number={8} name="The day continues" tone="paper" labelledBy="home-continue" className="pb-14 lg:pb-20">
      <ChapterTitle id="home-continue">The day continues.</ChapterTitle>
      <div data-rise className="col-span-full mt-8 md:col-span-4 lg:col-span-5 lg:col-start-3">
        <p className={cn(lead, "text-coal")}>Membership, a corporate day or your next round: the club is a message away.</p>
      </div>
      <ul className="col-span-full mt-12 grid gap-6 md:grid-cols-3 md:gap-5 lg:col-span-10 lg:col-start-3 lg:gap-6">
        {channels.map((channel) => (
          <li key={channel.title}>
            <a
              href={channel.href}
              {...(channel.external ? { target: "_blank", rel: "noreferrer" } : {})}
              className="group flex items-center justify-between gap-4 border-t border-coal/25 pt-5 font-display text-h3 font-light"
            >
              {channel.title}
              <ArrowRight width={18} height={18} className="text-antique transition-transform duration-200 group-hover:translate-x-1" />
            </a>
          </li>
        ))}
      </ul>
      {/* The fairway line resolves into the club mark: the story ends open, not closed. Plain
          rules, not SVG: a path's draw-in dashes break when an SVG is stretched this far. */}
      <div className="col-span-full mt-20 flex items-center gap-6 md:gap-10 lg:mt-28">
        <span aria-hidden data-rule className="h-[1.5px] flex-1 origin-left bg-antique" />
        <Crest className="text-coal" />
        <span aria-hidden data-rule className="h-[1.5px] flex-1 origin-right bg-antique" />
      </div>
    </Chapter>
  );
}
