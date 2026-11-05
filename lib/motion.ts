import { useGSAP } from "@gsap/react";
import gsap from "gsap";

// Import GSAP from here, never from "gsap" directly, so every animation shares the
// same defaults. For scroll-driven animation, import from lib/motion-scroll.ts too.
gsap.registerPlugin(useGSAP);
gsap.defaults({ duration: 0.6, ease: "power2.out" });

// Put decorative tweens inside `gsap.matchMedia().add(MOTION_OK, ...)`. People who
// ask for reduced motion then see the finished state with no animation.
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

export { gsap, useGSAP };
