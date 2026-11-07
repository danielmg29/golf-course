import type { Metadata } from "next";
import { Page } from "@/components/layout/Page";
import { PageHero } from "@/components/layout/PageHero";
import { Plus } from "@/components/ui/icons";
import { DemoNote, Section, SectionRule } from "@/components/ui/primitives";
import { ContactPaths } from "@/features/club/ContactPaths";
import { clubHours, site, whatsappLink } from "@/lib/site";
import { button } from "@/lib/variants";

export const metadata: Metadata = {
  title: "Contact",
  description: "Ask the caddie: green fees, dress code, caddies, company days and how to find us.",
};

const questions = [
  { question: "What are the green fees?", answer: "Visitors pay from KES 4,200 off-peak and KES 6,500 at peak times, which are before 10:00 and at weekends. Sample prices." },
  { question: "What's the dress code?", answer: "Collared shirts and tailored shorts or trousers on the course, with soft spikes only. Smart casual in the clubhouse." },
  { question: "Can I book a caddie?", answer: "Yes. Ask when you book, or see the caddie master on the day." },
  { question: "Can I hire clubs?", answer: "Yes, from the pro shop. Book ahead at weekends, because the good sets go quickly." },
  { question: "Do I have to be a member to use the pool?", answer: "No. Buy a guest day pass for the pool, gym or tennis courts, and show the code at the gate." },
  { question: "Who do I talk to about a company day?", answer: "Our events desk. Price your day in the golf day builder, then send it to them on WhatsApp." },
];

export default function ContactPage() {
  return (
    <Page>
      <PageHero
        compact
        pageName="Contact"
        title={<>Ask <em>the caddie</em></>}
        intro="Most questions have a quick answer below. For anything else, message us on WhatsApp and a person will reply."
        photo="duskTrees"
        facts="Clubhouse open 06:00 to 22:00"
      >
        <a
          href={whatsappLink("Hello, I have a question about the club.")}
          target="_blank"
          rel="noreferrer"
          className={button({ tone: "gold" })}
        >
          Message us on WhatsApp
        </a>
      </PageHero>

      {/* The fairway line ends here: every way in converges on the club. */}
      <Section tone="ivory">
        <SectionRule name="Who to talk to" />
        <div className="grid-swiss mt-10">
          <h2 data-lines className="col-span-full font-display text-display-lg font-light lg:col-span-8 lg:col-start-3">
            Five ways in, <em>one club</em>
          </h2>
        </div>
        <div className="mt-14 md:mt-20">
          <ContactPaths />
        </div>
        <DemoNote className="mt-8">The club&apos;s WhatsApp number isn&apos;t set yet, so WhatsApp will ask who to send it to.</DemoNote>
      </Section>

      <Section tone="forest">
        <div className="grid-swiss gap-y-14">
          <div className="col-span-full lg:col-span-7">
            <SectionRule name="Quick answers" />
            <h2 className="mt-10 font-display text-h2 font-light">Quick answers</h2>
            <div className="mt-10">
              {questions.map((item) => (
                <details key={item.question} className="group border-t border-current/20 last:border-b">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
                    <span className="font-display text-h3">{item.question}</span>
                    <Plus className="shrink-0 text-gold transition-transform duration-300 ease-out group-open:rotate-45" />
                  </summary>
                  <p className="type-body max-w-[56ch] pb-6">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>

          <aside className="col-span-full self-start bg-charcoal p-7 ring-1 ring-alabaster/15 md:p-9 lg:col-span-4 lg:col-start-9">
            <h2 className="font-display text-h3">Visit</h2>
            <address className="type-body mt-3 not-italic">
              {site.fullName}
              <br />
              Address to be added
              <br />
              {site.place}
            </address>

            <h2 className="mt-9 font-display text-h3">Hours</h2>
            <dl className="mt-3">
              {clubHours.map((row) => (
                <div key={row.place} className="flex justify-between gap-4 border-t border-alabaster/15 py-3 font-ui text-sm">
                  <dt className="text-alabaster/85">{row.place}</dt>
                  <dd className="tabular-nums">{row.time}</dd>
                </div>
              ))}
            </dl>
            <DemoNote className="mt-4">Sample hours. The club&apos;s address still needs adding.</DemoNote>
          </aside>
        </div>
      </Section>
    </Page>
  );
}
