"use client";

import { useRef } from "react";
import { SceneCanvas } from "@/components/three/SceneCanvas";
import type { Hole } from "@/lib/generated/schema";
import { gsap, MOTION_OK, useGSAP } from "@/lib/motion";

const loadScene = () => import("./coursePreviewScene");

// Placeholder proving the stack end to end: data from the simulated backend, a Three.js
// scene and a GSAP reveal. Delete it, and coursePreviewScene.ts, when the real home page starts.
export function CoursePreview({ title, holes }: { title: string; holes: Hole[] }) {
  const root = useRef<HTMLDivElement>(null);
  const par = holes.reduce((total, hole) => total + hole.par, 0);

  useGSAP(
    () => {
      gsap.matchMedia().add(MOTION_OK, () => {
        gsap.from("[data-reveal]", { autoAlpha: 0, y: 12, stagger: 0.1 });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="w-full max-w-xs text-center">
      <SceneCanvas
        load={loadScene}
        label="A slowly rotating wireframe ball"
        className="aspect-square w-full"
      />
      <h1 data-reveal className="text-xl font-semibold">
        {title}
      </h1>
      <p data-reveal className="text-muted-foreground">
        {holes.length} holes, par {par}. Sample data.
      </p>
    </div>
  );
}
