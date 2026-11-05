import { ScrollTrigger } from "gsap/ScrollTrigger";
import { gsap } from "@/lib/motion";

// Separate from lib/motion.ts so only routes that scroll-animate pay for this plugin.
gsap.registerPlugin(ScrollTrigger);

export { ScrollTrigger };
