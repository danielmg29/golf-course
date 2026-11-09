"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Calendar, Chat, Chevron } from "@/components/ui/icons";
import { DemoNote } from "@/components/ui/primitives";
import { whatsappLink } from "@/lib/site";
import { button } from "@/lib/variants";
import { cn } from "@/lib/utils";

const bookings = [
  { href: "/book", label: "Tee time", note: "Open slots, paid with M-Pesa" },
  { href: "/amenities#bays", label: "Toptracer bay", note: "By the hour, with food to the bay" },
  { href: "/amenities#day-pass", label: "Guest day pass", note: "Pool, gym and tennis" },
  { href: "/stay-and-play", label: "Stay & Play", note: "Rounds, rooms and a safari" },
];

const answers = [
  { question: "What are the green fees?", answer: "Visitors pay from KES 4,200 off-peak and KES 6,500 at peak. Sample prices." },
  { question: "What's the dress code?", answer: "Collared shirts and tailored shorts or trousers on the course. Soft spikes only." },
  { question: "Can I book a caddie?", answer: "Yes. Ask when you book, or at the caddie master's desk on the day." },
];

// Solid, not glass: the buttons sit over photographs and text alike, and must read on both.
const solid = "bg-reserve text-alabaster ring-1 ring-alabaster/20 hover:bg-club";

// Native popovers give click-outside and Esc for free, and sit above everything.
const panel =
  "fixed inset-auto bottom-24 m-0 w-[min(22rem,calc(100vw-2rem))] border border-gold/25 bg-charcoal text-alabaster opacity-0 translate-y-3 transition-[opacity,transform,display,overlay] transition-discrete duration-500 ease-fluid open:translate-y-0 open:opacity-100 starting:open:translate-y-3 starting:open:opacity-0";

/** The two controls that follow you down the page: book, and ask the caddie. */
export function FloatingActions() {
  const pathname = usePathname();
  // Starts hidden on the home page, so the button doesn't flash over the scroll arrow on load.
  const [overHero, setOverHero] = useState(pathname === "/");
  const bookPanel = useRef<HTMLDivElement>(null);

  // Over the homepage's story both buttons step aside: the story has its own skip link and
  // its own booking button. Threshold 0, because the story is many screens tall and never
  // fills 20% of its own height on screen, which the old threshold waited for.
  useEffect(() => {
    const hero = document.querySelector("[data-hero]");
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => setOverHero(entry.isIntersecting), { threshold: 0 });
    observer.observe(hero);
    return () => {
      observer.disconnect();
      setOverHero(false);
    };
  }, [pathname]);

  return (
    <>
      <div
        data-floating-action
        className={cn(
          "group fixed bottom-4 left-4 z-30 transition-[opacity,transform] duration-500 ease-fluid md:bottom-7 md:left-7 lg:left-[96px]",
          overHero && "pointer-events-none translate-y-4 opacity-0",
        )}
      >
        <button
          type="button"
          popoverTarget="caddie-panel"
          aria-label="Ask the caddie"
          className={cn(button({ size: "icon" }), solid)}
        >
          <Chat />
        </button>
        <div id="caddie-panel" popover="auto" className={cn(panel, "left-4 md:left-7 lg:left-[96px]")}>
          <div className="p-6">
            <p className="type-label text-gold">Ask the caddie</p>
            <dl className="mt-4 divide-y divide-gold/15">
              {answers.map((item) => (
                <div key={item.question} className="py-3">
                  <dt className="font-display text-xl leading-snug">{item.question}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-alabaster/70">{item.answer}</dd>
                </div>
              ))}
            </dl>
            <a
              href={whatsappLink("Hello, I have a question about the club.")}
              target="_blank"
              rel="noreferrer"
              className={cn(button({ tone: "gold", size: "sm" }), "mt-4 w-full")}
            >
              Continue on WhatsApp
            </a>
            <DemoNote className="mt-3">The club&apos;s number isn&apos;t set yet, so WhatsApp will ask who to send it to.</DemoNote>
          </div>
        </div>
      </div>

      <div
        data-floating-action
        className={cn(
          "group fixed bottom-4 right-4 z-30 transition-[opacity,transform] duration-500 ease-fluid md:bottom-7 md:right-7",
          overHero && "pointer-events-none translate-y-4 opacity-0",
        )}
      >
        <button
          type="button"
          popoverTarget="book-panel"
          className={cn(button({ size: "md" }), solid, "gap-2.5 px-5 md:px-6")}
        >
          <Calendar />
          Book a tee time
          <Chevron
            width={14}
            height={14}
            className="transition-transform duration-500 ease-fluid group-has-[:popover-open]:rotate-180"
          />
        </button>
        <div ref={bookPanel} id="book-panel" popover="auto" className={cn(panel, "right-4 md:right-7")}>
          <ul className="divide-y divide-gold/15 p-2">
            {bookings.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => bookPanel.current?.hidePopover()}
                  className="group/row flex items-center justify-between gap-4 px-4 py-4 transition-colors duration-300 hover:bg-alabaster/5"
                >
                  <span>
                    <span className="block font-display text-[1.375rem] leading-tight">{item.label}</span>
                    <span className="mt-0.5 block text-sm text-alabaster/60">{item.note}</span>
                  </span>
                  <ArrowUpRight className="shrink-0 text-gold transition-transform duration-500 ease-fluid group-hover/row:translate-x-0.5 group-hover/row:-translate-y-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
