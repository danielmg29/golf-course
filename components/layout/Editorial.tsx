import type { ReactNode } from "react";
import { Photo, SectionRule } from "@/components/ui/primitives";
import type { PhotoName } from "@/lib/photos";
import { cn } from "@/lib/utils";

/** A row of tall photographs that wipe open one after another, on the grid's gutters. */
export function PhotoStrip({
  items,
  className,
}: {
  items: { photo: PhotoName; position?: string }[];
  className?: string;
}) {
  const columns = items.length === 3 ? "md:grid-cols-3" : "md:grid-cols-4";
  return (
    <div className={cn("frame", className)}>
      <div className={cn("grid grid-cols-2 gap-4 md:gap-5 lg:gap-6", columns)}>
        {items.map((item, index) => (
          <div
            key={item.photo}
            data-clip
            data-delay={index * 0.1}
            className={cn(
              "relative aspect-[4/5] overflow-hidden",
              items.length === 3 && index === 2 && "col-span-2 aspect-[8/5] md:col-span-1 md:aspect-[4/5]",
            )}
          >
            <Photo
              name={item.photo}
              sizes={items.length === 3 ? "(min-width: 768px) 33vw, 50vw" : "(min-width: 768px) 25vw, 50vw"}
              position={item.position}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Photograph across seven columns, words in the last four. Set `flip` to swap them, so rows alternate. */
export function EditorialRow({
  eyebrow,
  title,
  photo,
  flip,
  position,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  photo: PhotoName;
  flip?: boolean;
  position?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid-swiss items-end gap-y-8">
      <div
        data-clip
        className={cn(
          "relative col-span-full aspect-[5/4] overflow-hidden lg:col-span-7 lg:aspect-[7/5]",
          flip && "lg:order-2 lg:col-start-6",
        )}
      >
        <div data-parallax className="absolute -inset-y-[8%] inset-x-0">
          <Photo name={photo} sizes="(min-width: 1024px) 58vw, 100vw" position={position} decorative />
        </div>
      </div>
      <div className={cn("col-span-full md:col-span-4 lg:col-span-4", flip ? "lg:order-1 lg:col-start-1 lg:row-start-1" : "lg:col-start-9")}>
        <SectionRule name={eyebrow} />
        <h3 data-lines className="mt-6 font-display text-h1 font-light">
          {title}
        </h3>
        <div data-fade className="type-body mt-5">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * The last thing on most pages: a photograph, one line and the next step. The fairway line
 * runs its full length here, the page's story told, and hands on to the footer.
 */
export function ClosingBand({
  photo,
  position,
  title,
  children,
}: {
  photo: PhotoName;
  position?: string;
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <section data-tone="dark" className="relative isolate overflow-hidden bg-reserve py-28 text-alabaster md:py-44">
      <div data-parallax className="absolute -inset-y-[10%] inset-x-0 -z-20">
        <Photo name={photo} sizes="100vw" position={position} decorative />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(16_47_37/0.92)_0%,rgb(16_47_37/0.6)_40%,rgb(16_47_37/0.78)_100%)]"
      />
      <div className="frame">
        <span aria-hidden className="relative block h-px">
          <span className="absolute inset-0 bg-current opacity-25" />
          <span data-rule className="absolute -top-px left-0 h-[3px] w-full origin-left bg-gold" />
        </span>
        <div className="grid-swiss mt-10 md:mt-14">
          <h2 data-lines className="col-span-full font-display text-display-lg font-light lg:col-span-8 lg:col-start-3">
            {title}
          </h2>
          <div data-fade className="col-span-full mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 lg:col-span-8 lg:col-start-3">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
