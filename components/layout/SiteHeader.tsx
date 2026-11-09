"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "@/components/ui/icons";
import { Crest, Photo } from "@/components/ui/primitives";
import { gsap, MOTION_OK, useGSAP } from "@/lib/motion";
import { ScrollTrigger } from "@/lib/motion-scroll";
import { clubHours, pages, quickBookings, site, whatsappLink } from "@/lib/site";
import { cn } from "@/lib/utils";

// The pages worth a place in the top bar; the menu holds them all.
const topLinks = ["/course", "/amenities", "/events", "/membership", "/stay-and-play"];

// Two lines that sit apart as a menu icon and cross into an X. `data-line` lets the menu
// animate them, starting from where the icon left off.
function MenuLines() {
  return (
    <span aria-hidden className="relative block h-3 w-5">
      <span data-line="top" className="absolute inset-x-0 top-0 h-px bg-current" />
      <span data-line="bottom" className="absolute inset-x-0 bottom-0 h-px bg-current" />
    </span>
  );
}

/**
 * The flagstick rail, down the left edge on wide screens: the menu at the top, then the fairway
 * line filling as you read down the page with a ball riding its tip towards the cup at the foot,
 * and the name of the part of the page you're in set along it.
 */
function Rail({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();
  const fill = useRef<HTMLSpanElement>(null);
  const ball = useRef<HTMLSpanElement>(null);
  const [head, setHead] = useState("");

  useGSAP(() => {
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        gsap.set(fill.current, { scaleY: self.progress });
        gsap.set(ball.current, { top: `${self.progress * 100}%` });
      },
    });
  });

  // The running head: the last section name (data-running-head) to pass above the middle.
  useEffect(() => {
    const heads = [...document.querySelectorAll<HTMLElement>("[data-running-head]")];
    if (heads.length === 0) return;
    // A bare data-running-head means "use my text"; React writes it as "true".
    const nameOf = (element: HTMLElement) => {
      const value = element.dataset.runningHead;
      return value && value !== "true" ? value : (element.textContent ?? "");
    };
    const decide = () => {
      let current = nameOf(heads[0]);
      for (const element of heads) {
        const box = element.getBoundingClientRect();
        // Each name is set twice, for phones and for wide screens; only the shown one counts.
        if (box.width > 0 && box.top < window.innerHeight * 0.45) current = nameOf(element);
      }
      setHead(current.replace(/\s+/g, " ").trim());
    };
    decide();
    const trigger = ScrollTrigger.create({ start: 0, end: "max", onUpdate: decide });
    return () => trigger.kill();
  }, [pathname]);

  return (
    <aside
      data-site-rail
      aria-label="Page progress and menu"
      className="fixed inset-y-0 left-0 z-40 hidden w-[72px] flex-col items-center border-r border-current/15 py-6 lg:flex"
    >
      <button
        type="button"
        aria-label="Open menu"
        aria-haspopup="dialog"
        onClick={onMenu}
        className="flex flex-col items-center gap-2 transition-colors duration-200 hover:text-antique"
      >
        <span className="flex size-11 items-center justify-center">
          <MenuLines />
        </span>
        <span className="font-ui text-[11px] font-semibold">Menu</span>
      </button>
      <div className="relative my-6 flex w-full flex-1 justify-center">
        <span aria-hidden className="absolute inset-y-0 w-px bg-current opacity-20" />
        <span ref={fill} aria-hidden className="absolute inset-y-0 w-[3px] origin-top scale-y-0 bg-antique" />
        <span ref={ball} aria-hidden className="absolute -mt-1.5 size-3 rounded-full bg-paper shadow-[0_2px_4px_rgb(0_0_0/0.35)]" style={{ top: 0 }} />
        <p
          aria-live="polite"
          className="type-meta absolute left-1/2 top-1/2 ml-4 max-h-[60%] -translate-y-1/2 overflow-hidden whitespace-nowrap opacity-90 [writing-mode:vertical-rl]"
        >
          {head}
        </p>
      </div>
      {/* The cup the ball is rolling towards: reached at the foot of the page. */}
      <span aria-hidden className="mb-2 block h-1.5 w-4 rounded-[50%] bg-current opacity-60" />
    </aside>
  );
}

/**
 * The site's header: the flagstick rail on wide screens, a top bar with the club's mark, its
 * main pages and the two actions that matter, and a full-screen menu laid out like a sheet:
 * every page, today at the club, and quick bookings. The bar slides away as you scroll down and
 * back as you scroll up; over light grounds it turns dark (globals.css, html[data-header-tone]).
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const bar = useRef<HTMLElement>(null);
  const shade = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const timeline = useRef<gsap.core.Timeline>(null);
  const [preview, setPreview] = useState(0);

  useGSAP(() => {
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const hide = self.direction === 1 && self.scroll() > 160;
        gsap.to(bar.current, { yPercent: hide ? -130 : 0, duration: 0.6, ease: "power3.out", overwrite: "auto" });
        gsap.to(shade.current, { autoAlpha: !hide && self.scroll() > 80 ? 1 : 0, duration: 0.4, overwrite: "auto" });
      },
    });
  });

  useGSAP(
    () => {
      const element = dialog.current;
      if (!element) return;
      const tl = gsap.timeline({ paused: true, onReverseComplete: () => element.close() });
      tl.fromTo(element, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "expo.inOut" });
      tl.fromTo('[data-line="top"]', { y: 0, rotate: 0 }, { y: 5.5, rotate: 45, duration: 0.5, ease: "power3.inOut" }, 0);
      tl.fromTo('[data-line="bottom"]', { y: 0, rotate: 0 }, { y: -5.5, rotate: -45, duration: 0.5, ease: "power3.inOut" }, 0);
      tl.fromTo("[data-menu-link]", { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: "expo.out", stagger: 0.04 }, 0.3);
      tl.fromTo("[data-menu-extra]", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: "expo.out", stagger: 0.08 }, 0.45);
      timeline.current = tl;
    },
    { scope: dialog },
  );

  useEffect(() => {
    const element = dialog.current;
    const tl = timeline.current;
    if (!element || !tl) return;
    const instant = !window.matchMedia(MOTION_OK).matches;
    if (open) {
      if (!element.open) element.showModal();
      document.documentElement.style.overflow = "hidden";
      if (instant) tl.progress(1);
      else tl.timeScale(1).play();
    } else if (element.open) {
      document.documentElement.style.overflow = "";
      if (instant) {
        tl.progress(0);
        element.close();
      } else {
        tl.timeScale(1.6).reverse();
      }
    }
  }, [open]);

  const close = () => setOpen(false);
  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <Rail onMenu={() => setOpen(true)} />

      <div
        ref={shade}
        aria-hidden
        data-site-shade
        className="invisible pointer-events-none fixed inset-x-0 top-0 z-30 h-28 bg-[linear-gradient(180deg,rgb(16_47_37/0.85),transparent)] opacity-0"
      />
      <header ref={bar} data-site-header className="pointer-events-none fixed inset-x-0 top-0 z-40 lg:left-[72px]">
        <div className="flex items-center justify-between gap-6 px-4 pt-4 md:px-8 md:pt-5 lg:pl-8 lg:pr-10">
          <button
            type="button"
            aria-label="Open menu"
            aria-haspopup="dialog"
            onClick={() => setOpen(true)}
            className="pointer-events-auto flex size-11 items-center justify-center lg:hidden"
          >
            <MenuLines />
          </button>
          <Crest className="pointer-events-auto absolute left-1/2 -translate-x-1/2 text-inherit lg:hidden" />
          <Crest inline className="pointer-events-auto hidden text-inherit lg:flex" />

          <nav aria-label="Main" className="pointer-events-auto ml-auto hidden xl:block">
            <ul className="flex items-center gap-7">
              {pages
                .filter((page) => topLinks.includes(page.href))
                .map((page) => (
                  <li key={page.href}>
                    <Link
                      href={page.href}
                      aria-current={isCurrent(page.href) ? "page" : undefined}
                      className="group relative font-ui text-sm font-semibold"
                    >
                      {page.label}
                      <span
                        aria-hidden
                        className={cn(
                          "absolute -bottom-1.5 left-0 h-px w-full origin-left bg-antique transition-transform duration-300 ease-out",
                          isCurrent(page.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                        )}
                      />
                    </Link>
                  </li>
                ))}
            </ul>
          </nav>

          <div className="pointer-events-auto flex items-center gap-6 xl:ml-4">
            <Link href="/membership#apply" className="hidden font-ui text-sm font-semibold md:inline" aria-label="Apply for membership">
              <span className="border-b border-antique pb-0.5">Apply</span>
            </Link>
            <Link
              href="/book"
              className="inline-flex h-10 items-center gap-2 bg-antique px-4 font-ui text-sm font-semibold text-forest transition-colors duration-200 hover:bg-[#c9a86c] md:h-11 md:px-5"
            >
              <span className="md:hidden">Book</span>
              <span className="hidden md:inline">Book a tee time</span>
            </Link>
          </div>
        </div>
      </header>

      <dialog
        ref={dialog}
        aria-label="Site menu"
        className="fixed inset-0 z-50 m-0 h-dvh max-h-none w-screen max-w-none overflow-y-auto bg-forest text-paper open:flex open:flex-col"
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
      >
        <div className="flex shrink-0 items-center justify-between gap-6 px-4 pt-4 md:px-8 md:pt-5">
          <button
            type="button"
            aria-label="Close menu"
            onClick={close}
            className="flex size-11 items-center justify-center transition-colors duration-200 hover:text-antique lg:ml-[14px]"
          >
            <MenuLines />
          </button>
          <div onClick={close} className="max-lg:absolute max-lg:left-1/2 max-lg:-translate-x-1/2">
            <Crest className="text-paper" />
          </div>
          <Link
            href="/book"
            onClick={close}
            className="inline-flex h-10 items-center bg-antique px-4 font-ui text-sm font-semibold text-forest transition-colors duration-200 hover:bg-[#c9a86c] md:h-11 md:px-5"
          >
            Book a tee time
          </Link>
        </div>

        <div className="frame grid-swiss flex-1 content-center gap-y-12 py-12">
          {/* Every page, large, with what's there. */}
          <nav aria-label="Pages" className="col-span-full lg:col-span-6">
            <ol className="border-t border-paper/15">
              {pages.map((page, index) => (
                <li key={page.href} className="overflow-hidden border-b border-paper/15">
                  <div data-menu-link>
                    <Link
                      href={page.href}
                      onClick={close}
                      onPointerEnter={() => setPreview(index)}
                      onFocus={() => setPreview(index)}
                      aria-current={isCurrent(page.href) ? "page" : undefined}
                      className="group flex items-baseline justify-between gap-6 py-2.5 md:py-3"
                    >
                      <span className="font-display text-[clamp(1.875rem,3.4vw,3rem)] font-light leading-[1.1] transition-transform duration-500 ease-out group-hover:translate-x-2 group-hover:italic group-aria-[current=page]:italic group-aria-[current=page]:text-antique">
                        {page.label}
                      </span>
                      <span className="hidden text-right font-ui text-sm text-paper/80 md:block">{page.note}</span>
                    </Link>
                  </div>
                </li>
              ))}
            </ol>
          </nav>

          {/* Today at the club: the hours as a scorecard, and the quickest ways to book. */}
          <div data-menu-extra className="col-span-full md:col-span-3 lg:col-span-3 lg:col-start-8">
            <h2 className="font-display text-h3">Today at the club</h2>
            <dl className="mt-4 border-t border-paper/15 font-ui text-sm">
              {clubHours.map((row) => (
                <div key={row.place} className="flex justify-between gap-4 border-b border-paper/15 py-2.5">
                  <dt className="text-paper/85">{row.place}</dt>
                  <dd className="tabular-nums">{row.time}</dd>
                </div>
              ))}
            </dl>
            <h2 className="mt-9 font-display text-h3">Quick book</h2>
            <ul className="mt-3 font-ui text-sm font-semibold">
              {quickBookings.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} onClick={close} className="group flex items-center justify-between gap-4 py-2">
                    <span className="border-b border-transparent pb-0.5 transition-colors duration-200 group-hover:border-antique">{item.label}</span>
                    <ArrowUpRight width={14} height={14} className="text-antique" />
                  </Link>
                </li>
              ))}
            </ul>
            <a
              href={whatsappLink("Hello, I have a question about the club.")}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-block border-b border-antique pb-1 font-ui text-sm font-semibold"
            >
              WhatsApp the club
            </a>
          </div>

          {/* The page you're pointing at, in a photograph. */}
          <figure data-menu-extra className="relative col-span-3 hidden aspect-[4/5] self-start overflow-hidden md:block lg:col-span-2 lg:col-start-11">
            {pages.map((page, index) => (
              <div
                key={page.href}
                className={cn("absolute inset-0 transition-opacity duration-500 ease-out", index === preview ? "opacity-100" : "opacity-0")}
              >
                <Photo name={page.photo} sizes="20vw" decorative />
              </div>
            ))}
            <figcaption className="absolute inset-x-0 bottom-0 bg-[linear-gradient(0deg,rgb(16_47_37/0.9),transparent)] p-4 pt-10 font-ui text-xs font-semibold">
              {pages[preview].note}
            </figcaption>
          </figure>
        </div>

        <div data-menu-extra className="frame shrink-0 pb-6">
          <span aria-hidden className="relative block h-px">
            <span className="absolute inset-0 bg-paper/20" />
            <span className="absolute -top-px left-0 h-[3px] w-1/4 bg-antique" />
          </span>
          <p className="type-meta mt-3 flex flex-wrap justify-between gap-2 text-paper/85">
            <span>
              {site.fullName}, {site.place}
            </span>
            <span>Sample hours</span>
          </p>
        </div>
      </dialog>
    </>
  );
}
