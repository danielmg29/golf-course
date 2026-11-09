import type { ReactNode } from "react";
import { Photo } from "@/components/ui/primitives";
import type { PhotoName } from "@/lib/photos";
import { cn } from "@/lib/utils";

/**
 * Saddle stitching: a dashed thread just inside the edge, with a darker line under it for the
 * holes it runs through. Drawn in CSS pixels, so the stitch length is the same on any size.
 */
export function Stitch({ inset = 10, radius = 10, className }: { inset?: number; radius?: number; className?: string }) {
  return (
    <svg
      aria-hidden
      className={cn("pointer-events-none absolute overflow-visible", className)}
      style={{ inset, width: `calc(100% - ${inset * 2}px)`, height: `calc(100% - ${inset * 2}px)` }}
    >
      <rect width="100%" height="100%" rx={radius} fill="none" stroke="rgb(40 20 8 / 0.45)" strokeWidth="1.6" strokeDasharray="7 5" transform="translate(0.6 0.9)" />
      <rect width="100%" height="100%" rx={radius} fill="none" stroke="var(--color-thread)" strokeOpacity="0.85" strokeWidth="1.4" strokeDasharray="7 5" />
    </svg>
  );
}

/** A tan leather plate, hand-stitched round its edge: the journey's card surface. */
export function Plate({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div data-fade className={cn("leather relative rounded-[18px] p-6 sm:p-7 md:p-10", className)}>
      <Stitch />
      <div className="relative">{children}</div>
    </div>
  );
}

/** A green-book page number, set at the plate's foot: the chapter's time of day and its page. */
export function Folio({ time, page }: { time: string; page: number }) {
  return (
    <p className="mt-8 flex items-center justify-between border-t border-ink/25 pt-3 text-[11px] text-ink/85">
      <span className="type-figure">{time}</span>
      <span className="type-figure">P. {String(page).padStart(2, "0")}</span>
    </p>
  );
}

/** A photograph tipped into the book, held at its corners by gold photo corners. */
export function TippedPhoto({
  photo,
  caption,
  sizes,
  position,
  className,
}: {
  photo: PhotoName;
  caption?: string;
  sizes: string;
  position?: string;
  className?: string;
}) {
  const corner = "absolute size-5 brushed [clip-path:polygon(0_0,100%_0,0_100%)]";
  return (
    <figure className={className}>
      <div data-clip className="relative aspect-[3/2] overflow-hidden rounded-[3px] shadow-[0_14px_30px_-16px_rgb(0_0_0/0.7)]">
        <Photo name={photo} sizes={sizes} position={position} />
        <span aria-hidden className={cn(corner, "left-0 top-0")} />
        <span aria-hidden className={cn(corner, "right-0 top-0 rotate-90")} />
        <span aria-hidden className={cn(corner, "bottom-0 right-0 rotate-180")} />
        <span aria-hidden className={cn(corner, "bottom-0 left-0 -rotate-90")} />
      </div>
      {caption ? <figcaption className="mt-3 font-caslon text-sm italic text-ink/80">{caption}</figcaption> : null}
    </figure>
  );
}
