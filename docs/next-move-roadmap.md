# The Architecture of the Next Move: homepage roadmap

Status: **superseded on 2026-11-06.** The owner redesigned the homepage as the Continuous Putt Journey (`features/journey/`; brief in `.impeccable/surfaces/app-marketing-page-tsx.md`). Phases 1 and 2 were built and Phase 1's shared world canvas is still in use. The four-act story in `features/story/` is no longer rendered and Phases 3–8 will not be built. The approved four-act wording is kept below for reference. Written on 2026-11-05 against the homepage as it was then (`app/(marketing)/page.tsx`). The copy below is draft wording and needs the owner's approval. The prices, people and photography on the site are still placeholders.

This document turns the brief into something we can build. It covers the story and its four acts, one WebGL world that lasts across the whole site, a single scroll timeline, the morphing gold mesh (ball, terrain, line, spiral, ring), the glass ball, the bento plates, the M-Pesa finale, the budgets, and the order to build it in.

---

## 1. The spine: one shot, four acts

The homepage is a single golf shot told in four beats. Each beat matches a step in making a business decision. The metaphor lives in the structure and the verbs (read, choose, move), never in business jargon. Writing "ROI" on a golf site is how this concept turns stuffy again.

| Act | Golf beat | Decision beat | World state (`morph`) | On screen (HTML) | Scroll |
|---|---|---|---|---|---|
| I · The lie | The ball at rest before the shot | Where you stand | `0` A glass ball inside a cage of the course's own contour lines | Club name, one line of positioning, Apply | 1.5 screens |
| II · Read the ground | Reading slope, grain and wind | Reading the market | `1` A wireframe of the real course terrain, drawn outwards from where the ball landed | Course figures pinned to points on the terrain, then overlapping full-bleed photo plates | 2.5 screens |
| III · Choose the club | Club selection | Choosing the right tool | `2` One laser-thin gold axis | Bento plates delivered along the axis | 2.3 screens |
| IV · Hole out | The ball drops into the cup | The close | `3` then `4`: a cut-glass spiral, then a ring seen from above, the rim of the cup | M-Pesa booking inside the ring | 1.7 screens |

**Why the ring is the cup.** The ball lands on the green in Act I. The story ends with the camera looking straight down into the cup, and the call to action sits where the ball finishes. The peak (the terrain drawing itself out) comes early, and the ending is the conversion. Both halves of the peak-end rule work for the club.

**Approved copy (2026-11-06)**

- **I:**
  - Heading: *The architecture of the next move*.
  - Lede: *Every good shot starts with reading the ground. So does every decision worth making.*
  - Button: *Apply for membership*. Under it, *The Reserve Golf Club · Kenya*, which is the club's name from `lib/site.ts`, not an eyebrow.
  - Corner link: *Skip the story*.
- **II:**
  - Heading: *Read the ground*.
  - Lede: *Slope, grain, wind and water. Eighteen holes that reward the player who looks before they swing.*
  - The live course figures (holes, par, yards), then the link *Fly the full course*.
- **III:**
  - Heading: *Choose your club*.
  - The plates:
    - *Simulator bays: Floodlit bays, by the hour*
    - *Tee sheet: Tomorrow's tee times*
    - *Corporate golf day: Host a client day*
    - *Stay & play: Nights and rounds together*
    - *Day pass: Pool, gym and tennis*
- **IV:**
  - Heading: *Make your move*.
  - Line: *Pick a tee time and pay with M-Pesa.*
  - Button: *Book a tee time*.
  - Link: *Or apply for membership*.

---

## 2. Where today's homepage breaks the story

The full critique is in the chat report and in `.impeccable/critique/`. In short:

1. **There is no through-line.** The page is eight stacked sections, each with its own fade-up. The backgrounds alternate between reserve and charcoal, which chops the page into blocks, so nothing carries the eye from one section to the next.
2. **The best asset is on another page.** The 3D course map lives on `/course`. The homepage's course section shows a bunker photo and *tells* you that you can "fly it before you play it".
3. **The layout is boxed.** The photo strip, the panorama, the split image, the three amenity tiles and the leaderboard box are all framed photos inside a `max-w-[1320px]` container.
4. **Gold is decoration, not structure.** It colours eyebrows and hairlines, but no line carries you through the page.
5. **The positioning is leisure, not decision.** Lines like "Quiet by design" and "stay for the evening" sell a retreat. Nothing on the page speaks to someone hosting a client or making a call.
6. **There are too many calls to action, and none uses M-Pesa.** The hero says Apply, the closing band says Book and Become a member, and floating Book and Caddie buttons sit on top of six or more text links. M-Pesa, the most Kenyan thing the club can offer, only appears on `/book`.

---

## 3. One world, one canvas

### Where it lives

`app/(marketing)/layout.tsx` renders `<World />` once. It is a fixed, `aria-hidden` canvas behind the content (`position: fixed; inset: 0; z-index: 0`, with the page content at `z-index: 1` and transparent where the world should show). App Router layouts persist across client navigations, so the renderer, the GPU buffers and the camera survive page changes. Going from the homepage to `/course` becomes a camera move rather than a reload.

Pages never import Three.js. They write numbers into a plain store, the same pattern `mapController` already uses for the course map:

```ts
// lib/world/store.ts: imported by pages and GSAP. No Three.js in here.
export type Tier = "high" | "mid" | "poster";

export const world = {
  tier: "poster" as Tier,
  /** 0 ball · 1 terrain · 2 axis line · 3 spiral · 4 ring. Fractions are mid-transition. */
  morph: 0,
  drop: 0, //     0 floating, 1 resting on the green
  dissolve: 0, // 0 solid glass, 1 all particles
  draw: 0, //     how far the contour lines have drawn out from the impact point
  flow: 0, //     how far the dashes along the axis have travelled (the conveyor)
  tilt: 0, //     degrees, from scroll velocity
  camera: { pitch: 0, orbit: 0, flatten: 0, distance: 9 },
  /** DOM positions the world must line up with, in CSS pixels. The page sets these on resize. */
  anchors: { axisY: 0, ringRadius: 0 },
};
```

GSAP tweens these plain numbers, and the render loop reads them every frame. **Render on demand**: the loop draws only while a value has changed since the last frame or an idle animation is running (the ball's float, the conveyor's flow). On pages with no act it removes itself from `gsap.ticker`, so it costs nothing. Until the course map moves into the world (Phase 7), `/course` keeps its own `SceneCanvas`, and the world stays stopped there so two renderers are never live at once.

### Quality tiers

Most visitors will be on mid-range Android phones over mobile data, so the tier is chosen before any 3D code downloads:

```ts
// lib/world/tier.ts
export function pickTier(): Tier {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return "poster";
  if (nav.connection?.saveData) return "poster";
  if ((nav.deviceMemory ?? 4) <= 2) return "poster";
  if (matchMedia("(pointer: coarse)").matches || (nav.deviceMemory ?? 8) <= 4) return "mid";
  return "high";
}
```

After mounting, a 60-frame probe measures the median frame time and drops one tier if it is over 40 ms, which is below 25 fps. It isn't 60 fps, because battery savers cap capable phones at 30 fps. The drop can happen once, never back up, so the scene doesn't flicker between tiers. The built version is in `lib/world/tier.ts` and `lib/world/runtime.ts`.

| | high | mid | poster |
|---|---|---|---|
| Grid | 192 × 128 vertices | 112 × 72 | none |
| Glass | `MeshPhysicalMaterial` with transmission and dispersion | clearcoat, environment reflections and fresnel opacity, no transmission pass | a pre-rendered still of the ball (WebP) |
| Bloom | half-resolution `UnrealBloomPass` | none; points use a soft sprite | none |
| Pixel ratio | ≤ 2 | ≤ 1.5 | n/a |
| Story | pinned and scrubbed | pinned and scrubbed | stacked sections, each showing its finished composition, with a CSS/SVG gold line |

Three.js stays out of the first load, as it is today. The world's code starts downloading only after the hero heading has painted (`requestIdleCallback`, falling back to `load`). The Act I heading is the LCP element, not a photo.

### Lining the world up with the DOM

The axis line has to sit exactly on the DOM rule the plates hang from, and the ring has to frame the DOM button exactly. Both are set from DOM measurements, in both directions through the camera:

```ts
// The world-space y on the plane z = 0 that appears at a given screen y, for this camera.
export function screenYToWorldY(yPx: number, camera: PerspectiveCamera, viewportHeight: number) {
  const ndc = new Vector3(0, 1 - (yPx / viewportHeight) * 2, 0.5).unproject(camera);
  const ray = ndc.sub(camera.position).normalize();
  const distance = -camera.position.z / ray.z;
  return camera.position.y + ray.y * distance;
}

// A ring on the ground seen from straight above at `height`: the world radius
// that shows as `radiusPx` on screen.
export const ringWorldRadius = (radiusPx: number, height: number, fovDeg: number, viewportHeight: number) =>
  (radiusPx / (viewportHeight / 2)) * height * Math.tan(MathUtils.degToRad(fovDeg / 2));
```

These are pure functions. Unit-test them against hand-worked cases, the way `courseLayout.test.ts` tests the map.

---

## 4. Choreography: one pinned stage, one master timeline

Every act lives in one pinned stage, driven by one scrubbed timeline whose **time unit is one screen of scroll**. Moving 1.0 on the timeline equals scrolling one viewport, so every duration in this section is also a scroll distance. One trigger means no overlapping tweens fighting over `world.morph`, and the timeline is deterministic when you reload half-way down.

The editorial "free scroll" inside Act II is not real scrolling. It is photo plates moving up the pinned stage at different speeds, and those speed differences are the overlapping parallax the La Caminera reference asks for.

```ts
// features/story/useStory.ts ("use client"). Durations are in screens.
import { gsap, MOTION_OK, useGSAP } from "@/lib/motion";
import { ScrollTrigger } from "@/lib/motion-scroll";
import { world } from "@/lib/world/store";

export const STORY_SCREENS = 8;

ScrollTrigger.config({ ignoreMobileResize: true }); // the address bar mustn't re-measure the pin

useGSAP(() => {
  const mm = gsap.matchMedia();
  mm.add(
    { wide: `${MOTION_OK} and (min-width: 768px)`, narrow: `${MOTION_OK} and (max-width: 767px)` },
    (context) => {
      const { narrow } = context.conditions as { wide: boolean; narrow: boolean };
      const q = gsap.utils.selector(stage);

      // Viewport tilt (the Hotel des Horlogers move), from scroll *velocity*, not position, so it
      // settles flat when you stop. Media layers tilt; body copy never does.
      const tiltWorld = gsap.quickTo(world, "tilt", { duration: 0.7, ease: "power3.out" });
      const tiltMedia = gsap.quickTo(q("[data-tilt]"), "rotationX", { duration: 0.7, ease: "power3.out" });
      gsap.set(q("[data-tilt]"), { transformPerspective: 1600 });
      const settle = () => (tiltWorld(0), tiltMedia(0));
      ScrollTrigger.addEventListener("scrollEnd", settle);

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: stage,
          start: "clamp(top top)",
          end: () => `+=${STORY_SCREENS * window.innerHeight}`,
          pin: true,
          scrub: 0.8, // the one smoothing in the system; the render loop adds none
          anticipatePin: 1,
          invalidateOnRefresh: true,
          snap: { snapTo: "labelsDirectional", delay: 0.1, duration: { min: 0.3, max: 1 }, ease: "power2.inOut" },
          onUpdate: (self) => {
            const angle = gsap.utils.clamp(-3, 3, self.getVelocity() / -350);
            tiltWorld(angle);
            tiltMedia(angle * 0.6);
          },
        },
      });

      /* Act I · the lie → the drop (0 to 1.5) */
      tl.addLabel("lie", 0)
        .to(q("[data-act=lie] .split-line"), { yPercent: -110, stagger: 0.03, duration: 0.35, ease: "power2.in" }, 0.05)
        .to(world, { drop: 1, duration: 0.55, ease: "power3.in" }, 0.25) //           gravity: slow start, fast landing
        .to(world.camera, { pitch: -34, distance: 7, duration: 0.8, ease: "power2.inOut" }, 0.2)
        .to(world, { dissolve: 1, duration: 0.3, ease: "power2.out" }, 0.8) //      impact at 0.8
        .to(world, { morph: 1, duration: 0.7 }, 0.8) //                             per-particle easing is in the shader
        .to(world, { draw: 1, duration: 0.6, ease: "power1.inOut" }, 0.9)

        /* Act II · read the ground (1.5 to 4) */
        .addLabel("ground", 1.5)
        .from(q("[data-act=ground] .split-line"), { yPercent: 110, stagger: 0.05, duration: 0.4, ease: "power3.out" }, 1.35)
        .from(q("[data-figure]"), { autoAlpha: 0, y: 24, stagger: 0.08, duration: 0.3, ease: "power2.out" }, 1.55)
        .to(world.camera, { orbit: 18, duration: 2.5, ease: "sine.inOut" }, 1.5) // a slow survey while you read
        // Overlapping plates at three depths: same time, different distances, which is all parallax is.
        .fromTo(q("[data-plate=near]"), { yPercent: 70 }, { yPercent: -170, duration: 2.2 }, 1.8)
        .fromTo(q("[data-plate=mid]"), { yPercent: 90 }, { yPercent: -115, duration: 2.2 }, 1.8)
        .fromTo(q("[data-plate=far]"), { yPercent: 110 }, { yPercent: -75, duration: 2.2 }, 1.8)

        /* II → III · the terrain flattens into the axis (4 to 4.8) */
        .to(q("[data-act=ground]"), { autoAlpha: 0, duration: 0.25 }, 4)
        .to(world.camera, { pitch: 0, orbit: 0, flatten: 1, duration: 0.8, ease: "power2.inOut" }, 4)
        .to(world, { morph: 2, duration: 0.8 }, 4)

        /* Act III · choose the club (4.8 to 7.1) */
        .addLabel("club", 4.8)
        .to(world, { flow: 1, duration: 2.3 }, 4.8); // the axis keeps running like a belt under the plates

      const plates = q("[data-plate-card]");
      if (narrow) {
        // One plate at a time on a phone; each one is a snap point.
        plates.forEach((plate, i) => {
          const at = 4.9 + i * 0.4;
          tl.fromTo(plate, { xPercent: 115, rotationY: -40, autoAlpha: 0 },
                           { xPercent: 0, rotationY: 0, autoAlpha: 1, duration: 0.2, ease: "power3.out" }, at)
            .addLabel(`plate-${i}`, at + 0.22);
          if (i < plates.length - 1) {
            tl.to(plate, { xPercent: -115, rotationY: 40, autoAlpha: 0, duration: 0.2, ease: "power3.in" }, at + 0.32);
          }
        });
      } else {
        // The whole bento arrives along the axis, swinging in and unfolding off the line.
        tl.fromTo(plates,
          { x: () => window.innerWidth * 0.6, rotationY: -38, rotationX: (i, el) => (el.dataset.side === "above" ? 70 : -70), z: -320, autoAlpha: 0 },
          { x: 0, rotationY: 0, rotationX: 0, z: 0, autoAlpha: 1, duration: 0.6, ease: "power3.out", stagger: 0.28 }, 4.9)
          .addLabel("plates", 6.4);
      }

      /* III → IV · plates break away, the axis coils, then condenses into the cup (7.1 to 8) */
      tl.to(plates, { rotationX: -28, y: 140, z: -260, autoAlpha: 0, duration: 0.3, ease: "power2.in",
                      stagger: { each: 0.05, from: "center" } }, 7.1)
        .to(world, { morph: 3, duration: 0.45 }, 7.2)
        .to(world.camera, { orbit: 24, duration: 0.45, ease: "sine.inOut" }, 7.2)
        .to(world, { morph: 4, duration: 0.35 }, 7.6)
        .to(world.camera, { orbit: 0, pitch: -89.5, duration: 0.35, ease: "power2.inOut" }, 7.6) // look down into the cup
        .from(q("[data-act=hole] > *"), { autoAlpha: 0, scale: 0.94, stagger: 0.04, duration: 0.2 }, 7.8)
        .addLabel("hole", STORY_SCREENS)
        .set({}, {}, STORY_SCREENS); // pad so one timeline unit is exactly one screen

      return () => ScrollTrigger.removeEventListener("scrollEnd", settle);
    },
  );
}, { scope: stage });
```

Notes on the choices above:

- **`clamp(top top)`** stops the story's trigger from starting before scroll 0 when the stage is already at the top on load.
- **`snap: "labelsDirectional"`** means every scroll gesture comes to rest on a finished composition (the ball, the terrain, the plates, the cup), never a half-morph. That matters for people who skim.
- **Dolly zoom on `flatten`.** The camera widens its distance while narrowing its field of view so the subject stays the same size: `distance = d0 · tan(fov0 / 2) / tan(fov / 2)`, with `fov = mix(40°, 12°, flatten)`. Perspective drains out of the terrain as it collapses into a line. Compute the distance from the field of view in the render loop rather than tweening them separately; two separate tweens make the framing wobble.
- **Camera at `pitch: -89.5`**, not -90, so `lookAt` keeps a stable up vector.
- **Reduced motion.** Under `prefers-reduced-motion: reduce` there is no pin and no scrub. The acts are normal stacked sections, and as each one enters, `world` is set to that act's resting state with a 0.3 s crossfade of canvas opacity.
- **Keyboard.** When focus enters a plate that is off screen inside the pin, scroll to its label with `window.scrollTo({ top: tl.scrollTrigger.labelToScroll("plate-2") })`. A *Skip the story* link at the top of the stage jumps to the footer.
- **Don't** put the existing `data-lines` / `data-fade` attributes inside the stage. `Page.tsx` would animate them on its own triggers, separate from the story timeline. Split the story's headings with `SplitText` in this hook instead.
- **Hide the floating Book button** while the story is pinned. It competes with the ring.
- **Act I's copy is visible without JavaScript.** It is the LCP element and the first thing a phone on a slow connection shows. Today the reveals hide text until GSAP runs, with a 4 s CSS fallback. When hydration lands after that fallback, GSAP hides the already-visible heading and animates it again; the review caught the hero heading half-masked about 15 s after load. The story's entrance must start from visible text, or skip entrances for anything the fallback has already shown.

---

## 5. The morph mesh: one attribute, five states

The whole morph is a single grid. Every vertex stores only its grid coordinate `(u, v)`, the course's height at that point, and a random seed. All five states are pure functions of `(u, v)`, evaluated in the vertex shader. Because the ball, the terrain, the axis, the spiral and the ring are the *same vertices in the same topology*, the lines stay connected through every transition. The ball's latitude and longitude cage unwraps into the terrain grid the way a globe unrolls into a flat map. Responsive values (line length, ring radius) are uniforms, so a resize never rebuilds a buffer.

The terrain is the real course: `terrainHeight()` from `features/hole/courseLayout.ts`. The green you see on the homepage is the same ground as the 3D map on `/course`, and the same relief is wrapped around the ball in Act I.

### Geometry (built once, on the CPU)

```ts
// features/story/morphGrid.ts
import { BufferGeometry, Float32BufferAttribute, Sphere, Vector3 } from "three";
import { MAP_DEPTH, MAP_WIDTH, terrainHeight } from "@/features/hole/courseLayout";

export function buildMorphGrid(columns: number, rows: number) {
  const count = columns * rows;
  const uv = new Float32Array(count * 2);
  const height = new Float32Array(count);
  const seed = new Float32Array(count);
  let state = 18; // a small LCG keeps the seeds the same on every load
  const random = () => ((state = (state * 1664525 + 1013904223) >>> 0) / 4294967296);

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const i = row * columns + column;
      const u = column / (columns - 1);
      const v = row / (rows - 1);
      uv.set([u, v], i * 2);
      height[i] = terrainHeight((u - 0.5) * MAP_WIDTH, (v - 0.5) * MAP_DEPTH);
      seed[i] = random();
    }
  }

  const index: number[] = [];
  for (let row = 0; row < rows; row += 1)
    for (let column = 0; column < columns - 1; column += 1)
      index.push(row * columns + column, row * columns + column + 1); // along u
  for (let row = 0; row < rows - 1; row += 1)
    for (let column = 0; column < columns; column += 1)
      index.push(row * columns + column, (row + 1) * columns + column); // along v

  const attributes = {
    position: new Float32BufferAttribute(new Float32Array(count * 3), 3), // Three.js requires it; the shader ignores it
    aUV: new Float32BufferAttribute(uv, 2),
    aHeight: new Float32BufferAttribute(height, 1),
    aSeed: new Float32BufferAttribute(seed, 1),
  };
  const lines = new BufferGeometry();
  const points = new BufferGeometry(); // same attributes, no index, so each vertex is drawn once
  for (const [name, attribute] of Object.entries(attributes)) {
    lines.setAttribute(name, attribute);
    points.setAttribute(name, attribute);
  }
  lines.setIndex(index);
  // Positions move in the shader, so set the bounds by hand or Three.js will frustum-cull the mesh.
  const bounds = new Sphere(new Vector3(), 60);
  lines.boundingSphere = bounds;
  points.boundingSphere = bounds;
  return { lines, points };
}
```

That gives two draw calls, `LineSegments` for the drawing and `Points` for the shatter sparkle. They share one uniforms object, so a single write to `uMorph` moves both.

### Vertex shader

```glsl
#define PI 3.141592653589793
uniform float uMorph;        // 0 ball · 1 terrain · 2 axis · 3 spiral · 4 ring
uniform float uTime;
uniform float uSpread;       // 0.35: how far each particle's start is staggered within a step
uniform vec3  uBallCenter;   // moved by world.drop
uniform float uBallRadius;
uniform vec2  uTerrainSize;  // MAP_WIDTH, MAP_DEPTH
uniform float uHeightScale;
uniform vec2  uImpactUV;     // where the ball lands, in grid coordinates
uniform float uAxisLength;   // the viewport's width at the axis plane, from the DOM
uniform float uAxisY;        // from screenYToWorldY()
uniform float uSpiralTurns;  // 7.0
uniform float uSpiralHeight;
uniform float uRingRadius;   // from ringWorldRadius()
uniform float uPileFade;     // 4.0 / rows: thins each line when every row piles onto one
uniform float uPointSize;
uniform float uPixelRatio;

attribute vec2  aUV;
attribute float aHeight;
attribute float aSeed;

varying float vAlpha;
varying float vReveal;
varying float vOnGround;

// snoise(vec3) from stegu/webgl-noise (MIT), pasted here.
vec3 curl(vec3 p) {
  const float e = 0.1;
  vec3 dx = vec3(e, 0.0, 0.0), dy = vec3(0.0, e, 0.0), dz = vec3(0.0, 0.0, e);
  vec3 a = vec3(snoise(p), snoise(p + 31.4), snoise(p + 71.7));
  vec3 bx = vec3(snoise(p + dx), snoise(p + dx + 31.4), snoise(p + dx + 71.7));
  vec3 by = vec3(snoise(p + dy), snoise(p + dy + 31.4), snoise(p + dy + 71.7));
  vec3 bz = vec3(snoise(p + dz), snoise(p + dz + 31.4), snoise(p + dz + 71.7));
  vec3 gx = (bx - a) / e, gy = (by - a) / e, gz = (bz - a) / e;
  return vec3(gy.z - gz.y, gz.x - gx.z, gx.y - gy.x);
}

// The course's relief wrapped round the ball: a globe of the course.
vec3 ball(vec2 uv, float h) {
  float theta = uv.x * 2.0 * PI, phi = uv.y * PI;
  float r = uBallRadius * (1.0 + h * 0.06);
  return uBallCenter + r * vec3(sin(phi) * cos(theta), cos(phi), sin(phi) * sin(theta));
}
vec3 terrain(vec2 uv, float h) {
  return vec3((uv.x - 0.5) * uTerrainSize.x, h * uHeightScale, (uv.y - 0.5) * uTerrainSize.y);
}
vec3 axisLine(vec2 uv) {
  return vec3((uv.x - 0.5) * uAxisLength, uAxisY, 0.0);
}
// A goblet's silhouette, foot to rim, for y in 0..1: the trophy or glassware shape.
float goblet(float y) {
  return 0.14 + (1.0 - smoothstep(0.0, 0.14, y)) * 0.32 + smoothstep(0.42, 0.96, y) * 0.62;
}
float spiralAngle(vec2 uv) {
  // Alternate rows wind in opposite directions, which crosses into a cut-crystal lattice.
  float direction = mod(floor(uv.y * 64.0), 2.0) * 2.0 - 1.0;
  return uv.x * uSpiralTurns * 2.0 * PI * direction + uv.y * 2.0 * PI;
}
vec3 spiral(vec2 uv) {
  float angle = spiralAngle(uv);
  float r = goblet(uv.x) * uRingRadius;
  return vec3(cos(angle) * r, (uv.x - 0.5) * uSpiralHeight, sin(angle) * r);
}
// Same angle as the spiral, so the coil only flattens and widens: no vertex crosses another.
vec3 ring(vec2 uv) {
  float angle = spiralAngle(uv);
  return vec3(cos(angle) * uRingRadius, 0.0, sin(angle) * uRingRadius);
}

// The local 0..1 progress of step k, started late by `delay` (0..1) and eased.
float stepT(float k, float delay) {
  float t = clamp(uMorph - k, 0.0, 1.0);
  t = clamp((t - delay * uSpread) / (1.0 - uSpread), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

void main() {
  float fromImpact = clamp(distance(aUV, uImpactUV) * 1.4, 0.0, 1.0);
  float t0 = stepT(0.0, fromImpact);     // nearest the impact lands first: a ripple
  float t1 = stepT(1.0, aSeed * 0.3);
  float t2 = stepT(2.0, aUV.x);          // the axis coils from one end, like a spring winding up
  float t3 = stepT(3.0, aSeed * 0.5);

  vec3 p = mix(ball(aUV, aHeight), terrain(aUV, aHeight), t0);
  // Terrain to axis in two moves: flatten first, then pull every row onto the line.
  vec3 line = axisLine(aUV);
  p.y = mix(p.y, line.y, smoothstep(0.0, 0.55, t1));
  p = mix(p, line, smoothstep(0.35, 1.0, t1));
  p = mix(p, spiral(aUV), t2);
  p = mix(p, ring(aUV), t3);

  // Scatter peaks half-way through a step and is zero at rest, so every resting
  // composition is exact: a full shatter on impact, a faint shimmer as the line coils.
  float scatter = sin(t0 * PI) * 2.2 + sin(t2 * PI) * 0.35;
  p += curl(p * 0.18 + vec3(0.0, uTime * 0.04, 0.0)) * scatter;

  vec4 view = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * view;
  gl_PointSize = uPointSize * uPixelRatio / -view.z;

  // Thin each line while the rows are piled up, so the axis and the ring don't burn out to white.
  float piled = clamp(t1 * (1.0 - t2) + t3, 0.0, 1.0);
  vAlpha = mix(1.0, uPileFade, piled) * smoothstep(60.0, 12.0, -view.z);
  vReveal = fromImpact;
  vOnGround = t0;
}
```

At every whole number of `uMorph`, each `t` is exactly 0 or 1 whatever the stagger, so the resting shapes are exact and the snap labels always land on a clean composition.

### Fragment shader (lines)

```glsl
uniform vec3  uGold;   // new Color("#d4af37"): Three.js converts it to linear for us
uniform float uDraw;   // world.draw
varying float vAlpha;
varying float vReveal;
varying float vOnGround;

void main() {
  // On the ball the cage is fully drawn. On the ground it draws out from the impact point.
  float drawn = smoothstep(vReveal - 0.04, vReveal, uDraw);
  float alpha = mix(1.0, drawn, smoothstep(0.0, 0.2, vOnGround)) * vAlpha;
  if (alpha < 0.01) discard;
  gl_FragColor = vec4(uGold, alpha);
  #include <colorspace_fragment>
}
```

Use `blending: AdditiveBlending`, `transparent: true`, `depthWrite: false` and `toneMapped: false`, so the gold on screen matches the CSS gold exactly. The points use the same vertex shader. Their fragment shader draws a soft disc (`1.0 - smoothstep(0.0, 0.5, length(gl_PointCoord - 0.5))`), and they fade in only during the shatter (`sin(t0 * PI)`, passed as a varying), so you see sparks in flight, not dots at rest.

**Test it in TypeScript too.** Mirror `ball`, `terrain`, `axisLine`, `spiral` and `ring` as TS functions in `morphStates.ts` and unit-test them. Test that `ring()` lands exactly on `uRingRadius`, that `axisLine()` spans `uAxisLength`, and that the spiral at `uv.x = 1` meets its own rim. The GLSL then copies tested maths.

---

## 6. The glass ball (semi-photorealistic)

```ts
import { Mesh, MeshPhysicalMaterial, NeutralToneMapping, PMREMGenerator, SphereGeometry, Vector2, Color } from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

renderer.toneMapping = NeutralToneMapping; // Khronos PBR Neutral: keeps the brand gold true; AgX would desaturate it
renderer.toneMappingExposure = 1.05;
const pmrem = new PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; // generated: no HDR download

const glass = new MeshPhysicalMaterial({
  transmission: 1,
  thickness: 1.2,
  ior: 1.45,
  dispersion: 0.3, //   a faint rainbow split at the rim
  roughness: 0.05,
  clearcoat: 1,
  clearcoatRoughness: 0.04,
  attenuationColor: new Color("#d9e8de"), // a breath of green inside the glass
  attenuationDistance: 2.5,
  normalMap: dimples, //                    optional, high tier: baked dimple normals
  normalScale: new Vector2(0.3, 0.3),
});
const ball = new Mesh(new SphereGeometry(1, 128, 96), glass);
```

Five things that will break if they aren't planned for:

1. **Transmission only refracts opaque WebGL objects.** It refracts neither the DOM behind a transparent canvas nor transparent meshes. If the hero photo stays as an `<img>` behind the canvas, the glass will look empty and grey. The fix is also better art direction: make **Act I a dark studio, not a photo**. That means a deep reserve-green floor with a soft vignette, a faint horizon, and a warm champagne key light, the way a watchmaker shoots a product. The floor and the back half of the contour cage must be opaque so the ball has something to bend. Reveal them with `discard`, not alpha. The course photography comes back in Act II, where it shows the real place.
2. **Dimples are baked, not computed live.** A one-off script, `scripts/bake-dimples.mjs`, writes a 1024 × 512 equirectangular normal map with about 390 Fibonacci-distributed dimples to `public/textures/ball-dimples.webp`, which should come out well under 100 KB. Point the poles up and down, where the cage's lines converge and hide the stretching.
3. **Dissolve into particles on impact.** Inject a noise threshold through `onBeforeCompile`: `if (snoise(vWorldPosition * 3.0) < uDissolve * 2.0 - 1.0) discard;`. Then add a gold band to the emissive light just above the threshold. The glass burns away from a gold edge at the same moment the points burst from the same surface, because the points' state 0 *is* that sphere.
4. **Contact shadow and caustic.** Use two cheap ground planes driven by `world.drop`. A soft dark radial gradient shrinks and darkens as the ball lands (`scale = mix(1.6, 0.9, drop)`, `opacity = mix(0.15, 0.6, drop)`). An additive gold radial focuses as it lands (`scale = mix(1.2, 0.35, drop)`): the light a glass sphere bends onto the ground. These two do more for "semi-photoreal" than any post-processing.
5. **Mid tier drops transmission.** Use `transmission: 0`, `transparent: true`, with a fresnel-driven opacity (about 0.15 facing you, 0.9 at the rim, via `onBeforeCompile`), clearcoat, and environment reflections. Without the transmission pass, a phone stays at 60 fps and the ball still reads as glass.

**Bloom (high tier only).** Use `EffectComposer` → `RenderPass` → `UnrealBloomPass(half resolution, strength 0.55, radius 0.35, threshold 0.82)` → `OutputPass`. The threshold is high, so only the gold lines and the ball's highlights glow.

---

## 7. The bento plates: luxury objects, not flat boxes

The idea is **architectural folio plates**. Each card is drawn like a sheet from an architect's set: an index number, a title block, gold registration ticks in the corners, and one live figure. That makes "architecture" literal, and it is a world away from the photo-tile-with-gradient pattern every golf site uses.

### Anatomy

```
┌╴                                              ╶┐   corner ticks: 10px gold, 1px
  03   SIMULATOR BAYS                            ↗  index in Cormorant lining numerals · label in Jakarta caps 0.15em
  ───────────────────────────────────────────────    hairline rule, gold at 35%
  ┌─────────────────────────────────────────────┐
  │   media window: photo inside its own frame  │    parallax inside the window, never edge to edge
  └─────────────────────────────────────────────┘
  Bay 4 free from 18:30                              one live figure from the existing feature
└╴                                              ╶┘
```

### Material

```css
@utility plate {
  position: relative;
  background:
    linear-gradient(180deg, rgb(249 249 246 / 0.045), transparent 38%), /* light falling on the top edge */
    var(--color-charcoal);
  box-shadow:
    inset 0 1px 0 rgb(249 249 246 / 0.07),  /* the machined top edge */
    inset 0 0 0 1px rgb(212 175 55 / 0.22), /* champagne hairline */
    0 48px 96px -48px rgb(0 0 0 / 0.55);    /* lifted off the green: long and soft, never hard */
  transform-style: preserve-3d;
}
```

- **Pointer tilt.** Use `gsap.quickTo(plate, "rotationX" | "rotationY", { duration: 0.5, ease: "power3.out" })`, at most 5°, with `transformPerspective: 1200`. The media window counter-moves by 2 % to show depth. Fine pointers only (`(hover: hover) and (pointer: fine)`).
- **Light.** A faint champagne highlight follows the pointer: `radial-gradient(480px circle at var(--px) var(--py), rgb(212 175 55 / 0.08), transparent 45%)` on a `::after`. Keep it subtle enough that you only notice it moving.
- **One action per plate.** The whole plate is the link, with a small arrow chip in the corner. No nested buttons.
- **The matrix.** Let GSAP own `transform`. It composes `transformPerspective`, `rotationX`, `rotationY` and `z` into one `matrix3d()` per frame. Never set a Tailwind `rotate-*` or `translate-*` on a plate, because the two will fight. Upper plates hinge from the axis (`transformOrigin: "50% 100%"`) and lower plates hang from it (`"50% 0%"`), so they unfold off the line as they arrive.

### Layout

- **Desktop.** A 12-column grid with the gold axis running through its waist, where the WebGL line sits exactly on a 1 px DOM rule (`screenYToWorldY`). Above the axis: *Simulator bays* (span 7) and *Tee sheet* (span 5). Below it: *Corporate golf day* (span 5), *Stay & play* (span 4) and *Day pass* (span 3). A small gold node marks where each plate meets the line.
- **Phone.** One plate at a time above the axis, 86 vw wide, carried along by the conveyor. Each plate is a snap point.

### Contents (everything here exists today)

| Plate | Live figure | Goes to |
|---|---|---|
| Simulator bays | next free bay (`BayGrid` data) | `/amenities#bays` |
| Tee sheet | tomorrow's first free tee time (`TeeSheet`) | `/book` |
| Corporate golf day | "from KES …" (`quoteGolfDay`) | `/events` (the builder) |
| Stay & play | nights and rounds (`Packager`) | `/stay-and-play` |
| Day pass | pool, gym and tennis, today | `/amenities#day-pass` |

The brief mentions a **pro shop**. The site doesn't have one. A pro-shop plate needs real products and prices from the club, so it is an open decision (section 11).

---

## 8. The ring and the M-Pesa close

- The DOM ring is a circle of diameter `min(72vw, 26rem)`, centred in the pinned stage. Its radius is written to `world.anchors.ringRadius`, and the WebGL ring is sized from it with `ringWorldRadius()`, so the gold lands exactly on the DOM edge.
- Inside the ring: the eyebrow *Hole out*, the heading *Make your move*, tomorrow's first free tee time with a *change* link, and the gold button *Book with M-Pesa*. Pressing it opens the existing `MpesaCheckout` in a `<dialog>` anchored at the ring.
- **The ring is the payment status.** The checkout's states map to the world: *ready* (still), *waiting for your phone* (particles orbit the rim, `uSpin`), *paid* (the ring closes to one bright line and a check draws in), *failed* (the ring opens a gap at the top, and the error text sits in the gap). The finale's visual and its feedback are the same object.
- The M-Pesa flow is still the **demo** (`SAMPLE-…` receipts). A real integration needs a Daraja STK Push backend, and that is separate work.

---

## 9. Budgets

**Performance**

- First-load JS doesn't change. Three.js and the story's 3D code load after the hero heading has painted.
- Data: no texture over 100 KB, a generated environment map (no HDR file), and nothing 3D downloaded on the poster tier.
- GPU: at most five draw calls in the story (lines, points, ball, floor, ground decals) plus bloom on the high tier.
- 60 fps on a mid-range Android phone over 4G at the mid tier. Test this on a real device, not desktop throttling.
- Render on demand. Stop rendering when the tab is hidden and when nothing is moving.

**Accessibility**

- All copy is HTML, with one `h1` and an `h2` per act, in reading order. The canvas is `aria-hidden`.
- *Skip the story* is the first focusable element in the stage.
- Snapping never traps the keyboard: Page Down moves from label to label, and focus inside a plate scrolls to that plate.
- Viewport tilt stays at ±3° or less, only on media layers, and is off under reduced motion.
- Text never sits directly on dense line work. Act II's copy gets a reserve-green scrim or a clear zone in the camera's framing.

---

## 10. Build order

| Phase | What | Done when |
|---|---|---|
| 0 | Decisions and copy (section 11) | The owner has approved the four acts' copy and the plate list |
| 1 | World shell: store, persistent canvas in the layout, tiers, render on demand, poster frames | One renderer survives client navigation; no GPU work on pages without an act; first-load JS unchanged |
| 2 | Story skeleton: acts in the DOM, the pinned master timeline with placeholder shapes, labels, snap, skip link, reduced-motion path | Reloading half-way down lands on the same frame; the keyboard path works |
| 3 | Morph mesh: grid, shaders, TS mirrors with tests | Each label rests on an exact composition; tests pass |
| 4 | Glass ball: material, studio, dissolve, shadow and caustic, mid-tier fallback | 60 fps on a mid-range phone at the mid tier |
| 5 | Bento plates: material, conveyor, axis alignment, pointer tilt | The axis sits on the DOM rule at every width from 360 to 1920 px |
| 6 | Ring and M-Pesa: alignment, checkout states mapped to the ring | The ring matches the DOM circle; every checkout state shows on the ring |
| 7 | Across pages: the course map becomes an act of the world; inner pages carry the axis as a CSS hairline | Home → Course is one continuous camera move |
| 8 | QA: real phone on 4G, Lighthouse, reduced motion, keyboard, screen reader | Signed off on each |

**Phase 1 notes (2026-11-06).**

- **What was built:** the world shell, plus a placeholder Act I. The placeholder is a gold cage of the course's relief wrapped round a ball, drawn from `buildMorphGrid`. Today's hero photo is its poster.
- **Checked in the browser:**
  - The same canvas element survives Home → About → Home.
  - About makes zero WebGL draw calls.
  - The homepage makes none once the hero has scrolled away.
  - Phones get the `mid` tier.
- **First load:** 205–209 KB per page, about 1 KB more than before. Three.js is not in the first load.
- **A threshold that was too strict:** the first frame probe stepped down below 45 fps (22 ms). That would have taken the world away from every phone capped at 30 fps by a battery saver, so it now steps down only below 25 fps (40 ms) and ignores gaps longer than 250 ms.
- **Returning to the homepage:** the poster shows again for 1.4 s, then fades. Phase 2 should keep the world's frame up instead.
- **Not tested yet:** a real phone.

**Phase 2 notes (2026-11-06).**

- **What was built:**
  - The four acts with the draft copy.
  - The master timeline with snap rest points.
  - A *Skip the story* link.
  - The keyboard path.
  - The reduced-motion and no-script fallback (stacked sections).
  - One label each for membership ("Apply for membership", shortened to "Apply" in the header) and booking ("Book a tee time").
  - The floating buttons step aside over the story.
- **Placeholder shapes:** the world shows all five shapes as plain blends from the one grid. Phase 3 adds the per-vertex stagger, the shatter scatter and the draw-on.
- **Departures from section 4:**
  - **CSS `sticky`, not `pin: true`.** The page height is fixed before any script runs, so a reload lands on the same frame.
  - **Snap `inertia: false`.** A fast gesture can't skip an act.
  - **Story text moves with plain y and opacity, without `SplitText`.** A split taken before the fonts load can break the line wrapping.
- **Checked in the browser:**
  - Every act at 1440 × 900 and 375 × 812.
  - A reload half-way down returns to the same frame (5978 → 5980 px).
  - Tab moves through the acts and scrolls each into view.
  - Page Down steps from Act III to Act IV.
- **Bugs found and fixed:**
  - **The timeline overran to 8.07 screens.** That shifted every rest point, so the snap skipped Act III. There's now a development warning for any overrun.
  - **The stage scrolled sideways on focus.** It was `overflow: hidden`, which lets focus scroll a box sideways; it's now `overflow: clip`.
  - **Plates overflowed the right margin.**
- **Not checked yet:**
  - Snapping in a real, focused browser window. The preview pane barely draws frames, so its snaps were inconclusive.
  - The reduced-motion layout, which the pane can't emulate.
  - A real phone.

On inner pages, the "continuous line" should be a CSS or SVG hairline placed where the world's axis left off, not live WebGL. A live canvas on every page costs battery and data on every page for a line that doesn't move.

---

## 11. Decisions

Decided by the owner on 2026-11-05:

1. **Scope: story first.** Phases 1–6 build the homepage story. The persistent cross-page world (Phase 7) comes after. The quick fixes (CTA labels, the hero replay) are folded into Phase 2.
2. **Plates: what exists.** Simulator bays, tee sheet, corporate golf day, stay & play and day pass. There is no pro-shop plate.
3. **Copy: rewritten and approved.** The four acts are written around "the next move". The owner approved the wording in section 1 on 2026-11-06.
4. **Phones: the lighter full story.** Phones get the mid tier. Save-Data and reduced-motion visitors get the poster tier.

Still open:

5. **The rest of today's homepage.** *Quiet by design*, *Pick your hour*, the events list and the leaderboard would move into the plates and the inner pages. Is the homepage allowed to become the story plus the footer?
