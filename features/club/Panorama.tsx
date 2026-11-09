import { Photo } from "@/components/ui/primitives";
import type { PhotoName } from "@/lib/photos";

// Percentages of the whole strip. The panels step up to the middle like a skyline.
const panels = [
  { left: 0, width: 9.6, height: 42, delay: 0.3 },
  { left: 10.4, width: 18.8, height: 74, delay: 0.15 },
  { left: 30, width: 40, height: 100, delay: 0 },
  { left: 70.8, width: 18.8, height: 74, delay: 0.15 },
  { left: 90.4, width: 9.6, height: 42, delay: 0.3 },
];

/**
 * One wide photograph seen through five windows. Each window holds a copy of the photo at
 * the full strip's size, shifted so the scene lines up across the gaps.
 */
export function Panorama({ photo, position }: { photo: PhotoName; position?: string }) {
  return (
    <div className="relative mx-auto aspect-[5/4] w-full max-w-[1200px] border-b border-gold/40 md:aspect-[1200/500]">
      {panels.map((panel) => (
        <div
          key={panel.left}
          data-clip
          data-delay={panel.delay}
          className="absolute bottom-0 overflow-hidden"
          style={{ left: `${panel.left}%`, width: `${panel.width}%`, height: `${panel.height}%` }}
        >
          <div
            className="absolute bottom-0"
            style={{
              left: `${(-panel.left / panel.width) * 100}%`,
              width: `${(100 / panel.width) * 100}%`,
              height: `${(100 / panel.height) * 100}%`,
            }}
          >
            <Photo name={photo} sizes="(min-width: 1200px) 1200px, 100vw" position={position} decorative />
          </div>
        </div>
      ))}
    </div>
  );
}
