import type { PhotoName } from "@/lib/photos";

// The club's name is a working title. Set NEXT_PUBLIC_APP_NAME to change it everywhere.
export const DEFAULT_CLUB_NAME = "The Reserve";

// Reads the variable directly rather than through lib/env.ts, because the header imports
// this file and lib/env.ts would add Zod (41 KB) to every page. app/layout.tsx imports
// lib/env.ts, so a bad value still fails the build.
const name = process.env.NEXT_PUBLIC_APP_NAME || DEFAULT_CLUB_NAME;

export const site = {
  name,
  fullName: `${name} Golf Club`,
  place: "Kenya",
  /** Digits with country code, such as 2547XXXXXXXX. Null until the club has a number. */
  whatsappNumber: null as string | null,
};

/** With no number set, WhatsApp opens with the message ready and asks who to send it to. */
export function whatsappLink(message: string) {
  return `https://wa.me/${site.whatsappNumber ?? ""}?text=${encodeURIComponent(message)}`;
}

type SitePage = { href: string; label: string; note: string; photo: PhotoName };

export const pages: SitePage[] = [
  { href: "/about", label: "About", note: "The club and its people", photo: "golferPolo" },
  { href: "/course", label: "The Course", note: "Fly all eighteen holes in 3D", photo: "aerialHills" },
  { href: "/amenities", label: "Amenities", note: "Pool, gym, tennis and floodlit bays", photo: "poolDusk" },
  { href: "/events", label: "Events", note: "Club days, golf days, live scores", photo: "banquet" },
  { href: "/membership", label: "Membership", note: "Directory, four-balls, joining", photo: "toast" },
  { href: "/stay-and-play", label: "Stay & Play", note: "Golf with a safari on the side", photo: "giraffe" },
  { href: "/book", label: "Book", note: "Tee times, paid with M-Pesa", photo: "mistFlag" },
  { href: "/contact", label: "Contact", note: "Ask the caddie", photo: "duskTrees" },
];

/** Opening hours, shown in the menu, the footer and on Contact. Sample hours until the club confirms them. */
export const clubHours = [
  { place: "Course", time: "06:30 to dusk" },
  { place: "Clubhouse", time: "06:00 to 22:00" },
  { place: "Gym", time: "05:30 to 21:00" },
  { place: "Floodlit bays", time: "16:00 to 23:00" },
];

/** The quickest ways to book, wherever there's room for a short list. */
export const quickBookings = [
  { href: "/book", label: "Tee time" },
  { href: "/amenities#bays", label: "Toptracer bay" },
  { href: "/amenities#day-pass", label: "Guest day pass" },
  { href: "/events#golf-days", label: "Company golf day" },
  { href: "/stay-and-play#build", label: "Stay & Play" },
];
