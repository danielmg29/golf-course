import Link from "next/link";
import { ArrowUpRight } from "@/components/ui/icons";
import { Crest } from "@/components/ui/primitives";
import { site, whatsappLink } from "@/lib/site";

type Channel = { name: string; note: string; action: string; href: string; external?: boolean };

const channels: Channel[] = [
  {
    name: "Ask anything",
    note: "Green fees, dress code, getting here. A person replies.",
    action: "WhatsApp the club",
    href: whatsappLink("Hello, I have a question about the club."),
    external: true,
  },
  {
    name: "Tee times and lessons",
    note: "The pro shop: rounds, caddies, club hire and coaching.",
    action: "Book a tee time",
    href: "/book",
  },
  {
    name: "Events desk",
    note: "Company golf days, functions and the floodlit bays.",
    action: "WhatsApp the events desk",
    href: whatsappLink("Hello events desk, I'd like to plan a day at the club."),
    external: true,
  },
  {
    name: "Membership secretary",
    note: "Applications, introductions and a visit before you join.",
    action: "Apply for membership",
    href: "/membership#apply",
  },
  {
    name: "Find the club",
    note: "Directions to the gate, and parking by the clubhouse.",
    action: "Open in maps",
    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${site.fullName} ${site.place}`)}`,
    external: true,
  },
];

const ROW = 112;

/**
 * Every way to reach the club, each on its own line, and the lines converge into the club's
 * mark: the fairway line's ending, before the footer. On phones the lines run down one rule.
 */
export function ContactPaths() {
  const height = channels.length * ROW;
  const meet = height / 2;
  return (
    <div className="grid-swiss" data-draw-scope>
      <ul className="col-span-full border-l border-gold/60 pl-6 lg:col-span-7 lg:border-l-0 lg:pl-0">
        {channels.map((channel) => (
          <li key={channel.name} data-fade className="border-t border-current/20 lg:h-28">
            <Link
              href={channel.href}
              target={channel.external ? "_blank" : undefined}
              rel={channel.external ? "noreferrer" : undefined}
              className="group grid h-full gap-1 py-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-6"
            >
              <span>
                <span className="block font-display text-h2 font-light leading-tight">{channel.name}</span>
                <span className="mt-1 block font-ui text-sm opacity-85">{channel.note}</span>
              </span>
              <span className="mt-2 inline-flex items-center gap-2 font-ui text-[15px] font-semibold md:mt-0">
                <span className="border-b border-gold pb-1">{channel.action}</span>
                <ArrowUpRight width={16} height={16} className="text-gold transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="relative col-span-5 hidden lg:block" style={{ height }}>
        <svg aria-hidden viewBox={`0 0 400 ${height}`} preserveAspectRatio="none" className="absolute inset-0 size-full">
          {channels.map((channel, index) => {
            const y = index * ROW + ROW / 2;
            return (
              <path
                key={channel.name}
                data-draw
                data-delay={index * 0.1}
                d={`M0 ${y} C 150 ${y}, 200 ${meet}, 300 ${meet}`}
                fill="none"
                pathLength={1}
                strokeDasharray={1}
                vectorEffect="non-scaling-stroke"
                className="stroke-gold [stroke-width:1.5]"
              />
            );
          })}
        </svg>
        <div className="absolute right-0 top-1/2 flex -translate-y-1/2 items-center">
          <Crest className="text-current" />
        </div>
      </div>

      <div className="col-span-full mt-10 flex justify-center lg:hidden">
        <Crest className="text-current" />
      </div>
    </div>
  );
}
