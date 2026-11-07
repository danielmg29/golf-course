import type { Metadata } from "next";
import Link from "next/link";
import { Page } from "@/components/layout/Page";
import { PageHero } from "@/components/layout/PageHero";
import { ArrowUpRight } from "@/components/ui/icons";
import { Section, SectionRule } from "@/components/ui/primitives";
import { TeeSheet } from "@/features/booking/TeeSheet";

export const metadata: Metadata = {
  title: "Book a tee time",
  description: "See open tee times and off-peak prices, and pay with M-Pesa.",
};

const otherBookings = [
  { href: "/amenities#bays", title: "Toptracer bay", note: "By the hour, with food to the bay" },
  { href: "/amenities#day-pass", title: "Guest day pass", note: "Pool, gym and tennis" },
  { href: "/events#golf-days", title: "Company golf day", note: "Price it in five steps" },
  { href: "/stay-and-play", title: "Stay & Play", note: "Rounds, rooms and a safari" },
];

export default function BookPage() {
  return (
    <Page>
      <PageHero
        compact
        pageName="Book"
        title={<>Your tee time, <em>your hour</em></>}
        intro="See what's open, pay with M-Pesa and get your receipt straight away. No phone calls to the desk."
        photo="mistFlag"
        facts="First tee 06:30 · paid with M-Pesa"
      />

      <Section tone="forest" className="pt-14 md:pt-20">
        <TeeSheet />
      </Section>

      <Section tone="paper">
        <SectionRule name="Something else" />
        <h2 className="mt-10 font-display text-h2 font-light">Something else to book</h2>
        <ul className="mt-10 grid gap-x-6 md:grid-cols-2">
          {otherBookings.map((item) => (
            <li key={item.href} data-fade className="border-t border-current/20">
              <Link href={item.href} className="group flex items-center justify-between gap-6 py-6">
                <span>
                  <span className="block font-display text-h2 font-light leading-tight transition-transform duration-300 ease-out group-hover:translate-x-2">
                    {item.title}
                  </span>
                  <span className="mt-1 block font-ui text-sm opacity-85">{item.note}</span>
                </span>
                <ArrowUpRight className="shrink-0 text-gold transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </Page>
  );
}
