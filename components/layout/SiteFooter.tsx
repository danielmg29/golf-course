import Link from "next/link";
import { BackToTee, ClubNotes } from "@/components/layout/FooterClient";
import { clubHours, pages, quickBookings, site, whatsappLink } from "@/lib/site";

const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${site.fullName} ${site.place}`)}`;

function Column({ title, wide, children }: { title: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className={wide ? "col-span-full md:col-span-3" : "col-span-2 md:col-span-3"}>
      <h2 className="font-display text-h3">{title}</h2>
      <div className="mt-4 border-t border-paper/15 pt-4">{children}</div>
    </div>
  );
}

const linkClass = "font-ui text-sm font-semibold text-paper/90 transition-colors duration-200 hover:text-antique";

/**
 * The nineteenth hole. The day's last line and the two ways to act on it, the club notes,
 * every page, every booking, how to find the club and when it's open; then the fairway line
 * runs its full length and resolves into the club's name, set across the whole width.
 */
export function SiteFooter() {
  const [first, ...rest] = site.name.split(" ");
  return (
    <footer data-tone="dark" className="relative overflow-hidden bg-[#0b241b] text-paper">
      <div className="frame pt-24 md:pt-32">
        <div className="grid-swiss gap-y-14">
          <div className="col-span-full lg:col-span-7">
            <p className="font-display text-display-lg font-light [text-wrap:balance]">
              Six-thirty on the first tee. <em className="italic">Sundowners by the eighteenth.</em>
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link
                href="/book"
                className="inline-flex h-12 items-center bg-antique px-6 font-ui text-[15px] font-semibold text-forest transition-colors duration-200 hover:bg-[#c9a86c]"
              >
                Book a tee time
              </Link>
              <a href={whatsappLink("Hello, I have a question about the club.")} target="_blank" rel="noreferrer" className="font-ui text-[15px] font-semibold">
                <span className="border-b border-antique pb-1">WhatsApp the club</span>
              </a>
            </div>
          </div>
          <div className="col-span-full md:col-span-4 lg:col-span-4 lg:col-start-9 lg:self-end">
            <h2 className="font-display text-h3">Club notes</h2>
            <p className="mt-2 font-ui text-sm text-paper/85">Tee sheet openings, competitions and the month ahead, once a month.</p>
            <ClubNotes />
          </div>
        </div>

        <div className="grid-swiss mt-20 gap-y-12 md:mt-24">
          <Column title="Explore">
            <ul className="grid gap-2.5">
              {pages.map((page) => (
                <li key={page.href}>
                  <Link href={page.href} className={linkClass}>
                    {page.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Column>
          <Column title="Book">
            <ul className="grid gap-2.5">
              {quickBookings.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/membership#apply" className={linkClass}>
                  Apply for membership
                </Link>
              </li>
            </ul>
          </Column>
          <Column title="Visit">
            <address className="font-ui text-sm not-italic leading-relaxed text-paper/90">
              {site.fullName}
              <br />
              Address to be added
              <br />
              {site.place}
            </address>
            <a href={directions} target="_blank" rel="noreferrer" className={`${linkClass} mt-4 inline-block border-b border-antique pb-0.5`}>
              Directions
            </a>
          </Column>
          <Column title="Hours" wide>
            <dl className="font-ui text-sm">
              {clubHours.map((row) => (
                <div key={row.place} className="flex justify-between gap-4 py-1.5">
                  <dt className="text-paper/85">{row.place}</dt>
                  <dd className="tabular-nums">{row.time}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-2 font-ui text-xs text-paper/75">Sample hours.</p>
          </Column>
        </div>

        {/* The fairway line, told in full, hands over to the club's name. */}
        <span aria-hidden className="relative mt-20 block h-px md:mt-24">
          <span className="absolute inset-0 bg-paper/20" />
          <span className="absolute -top-px left-0 h-[3px] w-full bg-antique" />
        </span>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-x-8 gap-y-3 font-ui text-xs text-paper/80">
          <p>
            © {site.fullName}. {site.name} is a working name: prices, people, scores and photographs here are samples.
          </p>
          <p>Photography from Unsplash</p>
          <BackToTee />
        </div>
      </div>

      {/* The club's name, the width of the page, settling into the foot of it. */}
      <p aria-hidden className="mt-10 select-none whitespace-nowrap text-center font-display font-light leading-[0.78] tracking-[-0.02em] text-paper/90 [font-size:clamp(4.5rem,18.5vw,21rem)] md:mt-14">
        <span className="italic">{first}</span> {rest.join(" ")}
        <span className="relative -top-[0.5em] ml-[0.05em] inline-block size-[0.14em] rounded-full border-[0.025em] border-antique align-baseline" />
      </p>
    </footer>
  );
}
