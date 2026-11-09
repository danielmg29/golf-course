import type { CSSProperties, ReactNode } from "react";
import { Stitch } from "@/features/journey/Leather";

// Short turf: fine green speckle from fractal noise, tiled.
const turf = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='t'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .07 0 0 0 0 .3 0 0 0 0 .15 0 0 0 1.1 -.35'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23t)'/%3E%3C/svg%3E")`;

const green: CSSProperties = {
  backgroundColor: "var(--color-turf)",
  backgroundImage: [
    // The green book's map, printed in gold over the grass (features/journey/green.ts).
    'url("/textures/green-contours.svg")',
    // Mowing stripes, the way a green is cut in alternate directions.
    "repeating-linear-gradient(180deg, rgb(255 255 255 / 0.035) 0 96px, rgb(0 0 0 / 0.07) 96px 192px)",
    turf,
    "radial-gradient(120% 60% at 50% 0%, rgb(60 110 70 / 0.35), transparent 70%)",
  ].join(", "),
  backgroundSize: "100% auto, auto, 180px, 100% 100%",
  backgroundRepeat: "repeat-y, repeat, repeat, no-repeat",
};

/**
 * The long green the ball rolls down: short turf with mowing stripes, edged with stitched tan
 * leather like the cover of a green-reading book, and printed with the green's contours.
 */
export function Ribbon({ children }: { children: ReactNode }) {
  return (
    <div
      data-ribbon
      className="relative h-full overflow-hidden rounded-[14px] shadow-[inset_0_0_40px_rgb(0_0_0/0.45),0_40px_80px_-40px_rgb(0_0_0/0.7)] md:rounded-[22px]"
      style={green}
    >
      {/* The leather binding down each long edge. */}
      <div aria-hidden className="leather absolute inset-y-0 left-0 w-2 md:w-3.5" />
      <div aria-hidden className="leather absolute inset-y-0 right-0 w-2 md:w-3.5" />
      <Stitch inset={4} radius={12} className="hidden md:block" />
      {children}
    </div>
  );
}
