"use client";

import { useEffect } from "react";
import { drivePoint, HERO_FRAME, horizonAt, LAND_FRAME } from "@/features/home/fairwayLine";
import { gsap, MOTION_OK } from "@/lib/motion";
import { world } from "@/lib/world/store";

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));
const clamp01 = (value: number) => clamp(value, 0, 1);
const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount;
const smoothstep = (from: number, to: number, value: number) => {
  const t = clamp01((value - from) / (to - from));
  return t * t * (3 - 2 * t);
};

// The aerial hero's sun is high on the left: shadows fall down and to the right (about 24°).
const AERIAL_CAST = 0.42;
// The hero's green overlay, top to bottom (Chapters.tsx), and how much of it the ball takes.
const OVERLAY = [
  [0, 0.5],
  [0.45, 0.64],
  [1, 0.95],
] as const;
const OVERLAY_SHARE = 0.72;
// Along the land's horizon: where the ball drops in from the sky, and where it lands.
const DROP_FROM = 0.12;
const LANDS_AT = 0.3;

function overlayAt(fraction: number) {
  const f = clamp01(fraction);
  const index = f < OVERLAY[1][0] ? 0 : 1;
  const [fromAt, fromValue] = OVERLAY[index];
  const [toAt, toValue] = OVERLAY[index + 1];
  return lerp(fromValue, toValue, (f - fromAt) / (toAt - fromAt));
}

/**
 * Flies the homepage's ball (features/home/flightAct.ts) with the scroll. It sits on its tee in
 * the hero; scroll and it's driven along the hero's fairway line, rising towards you and out of
 * the frame, its shadow running away across the ground; it drops out of the land photograph's
 * sky, lands on the horizon line with two short hops and rolls along it, off the picture's end.
 *
 * Everything is measured from the page every frame, so it holds at any size and with fonts or
 * streamed content still settling. The scroll the ball follows is eased a little, which gives
 * it weight. Renders nothing; with reduced motion the hero keeps its still ball.
 */
export function BallFlight() {
  useEffect(() => {
    if (!window.matchMedia(MOTION_OK).matches) return;
    const hero = document.querySelector<HTMLElement>("[data-hero]");
    const photo = document.querySelector<HTMLElement>("[data-land-photo]");
    if (!hero || !photo) return;

    const flight = world.flight;
    let eased: number | null = null;
    let lastScroll = Number.NaN;
    let dirty = true;
    const resizes = new ResizeObserver(() => {
      dirty = true;
    });
    resizes.observe(document.body);

    // Where the drive starts and leaves the screen, along the line, for this hero size.
    let frameKey = "";
    let teeAt = 0;
    let exitAt = 1;

    const place = (scroll: number, ball: number) => {
      const width = document.documentElement.clientWidth;
      const height = window.innerHeight;
      const heroBox = hero.getBoundingClientRect();
      const photoBox = photo.getBoundingClientRect();

      // The hero's frame is sliced to cover it, like the SVG it replaces.
      const scale = Math.max(heroBox.width / HERO_FRAME.width, heroBox.height / HERO_FRAME.height);
      const left = heroBox.left + (heroBox.width - HERO_FRAME.width * scale) / 2;
      const top = heroBox.top + (heroBox.height - HERO_FRAME.height * scale) / 2;
      const onHero = (t: number): [number, number] => {
        const [x, y] = drivePoint(t);
        return [left + x * scale, top + y * scale];
      };

      // Larger than life (a real ball would be a speck from this high), but only just.
      const teeRadius = clamp(width * 0.0073, 6.5, 10.5);
      const key = `${width}:${heroBox.width}:${heroBox.height}`;
      if (key !== frameKey) {
        frameKey = key;
        // On a phone the slice crops the start of the line, so the tee moves to where it shows.
        teeAt = 0;
        while (teeAt < 0.6 && onHero(teeAt)[0] < Math.max(28, width * 0.12)) teeAt += 0.005;
        exitAt = teeAt;
        while (exitAt < 2 && onHero(exitAt)[0] < width + teeRadius * 6) exitAt += 0.005;
      }

      const heroTop = heroBox.top + scroll;
      // The drive must clear the headline before the scroll carries it up into the line, and a
      // phone's headline is the full width, so there the ball has to leave the screen sooner.
      const driveLength = heroBox.height * (width < 768 ? 0.34 : 0.62);
      const a = clamp01((ball - heroTop) / driveLength);

      const photoTop = photoBox.top + scroll;
      const horizon = (along: number) => horizonAt(along * LAND_FRAME.width) / LAND_FRAME.height;
      const landX = (along: number) => photoBox.left + along * photoBox.width;
      const landY = (along: number) => photoBox.top + horizon(along) * photoBox.height;
      const dropStart = photoTop - height * 0.66;
      const touchdown = photoTop + horizon(LANDS_AT) * photoBox.height - height * 0.56;
      const rollEnd = touchdown + height * 0.38;
      // Small: it lands at the far edge of the field, at the foot of the trees.
      const landRadius = clamp(photoBox.width * 0.0036, 3.6, 5);

      const shadow = flight.shadow;

      if (ball >= dropStart && ball < rollEnd) {
        // In the land photograph, inside its frame.
        flight.visible = true;
        flight.light = 1;
        flight.veil = 0.1;
        flight.rolling = false;
        flight.clip = { top: photoBox.top, right: photoBox.right, bottom: photoBox.bottom, left: photoBox.left };
        const across = (LANDS_AT - DROP_FROM) * photoBox.width;

        if (ball < touchdown) {
          // Falling out of the photograph's sky: steady across, faster and faster down.
          const b = clamp01((ball - dropStart) / (touchdown - dropStart));
          const along = lerp(DROP_FROM, LANDS_AT, b);
          const ground = landY(along);
          const fall = ground - photoBox.top + landRadius * 4;
          // Coming from above and behind the camera, it shrinks as it falls away to the horizon.
          flight.radius = landRadius * (1 + 0.7 * (1 - b));
          flight.x = landX(along);
          flight.y = ground - flight.radius - fall * (1 - b * b);
          flight.travel = across * b + fall * b * b;
          const vertical = 2 * b * fall;
          const speed = Math.hypot(across, vertical) || 1;
          flight.dirX = across / speed;
          flight.dirY = vertical / speed;
          flight.contact = 0;
          // The sun is behind the camera: the shadow lies on the field beneath, just beyond the
          // ball, growing sharper and darker as the ball comes down to meet it.
          shadow.x = flight.x + landRadius * 0.25;
          shadow.y = ground - landRadius * 0.15;
          shadow.width = landRadius * (1.3 + 2.4 * (1 - b));
          shadow.height = landRadius * (0.3 + 0.6 * (1 - b));
          shadow.angle = -0.04;
          shadow.opacity = 0.62 * b * b;
        } else {
          // Two short hops, then a roll along the horizon line and out of the picture.
          const q = clamp01((ball - touchdown) / (rollEnd - touchdown));
          const end = 1 + (landRadius * 3) / photoBox.width;
          const along = lerp(LANDS_AT, end, 1 - (1 - q) ** 1.25);
          const hops = q / 0.22;
          let hop = 0;
          if (hops < 0.62) hop = 3.4 * landRadius * Math.sin((Math.PI * hops) / 0.62);
          else if (hops < 1) hop = 1.1 * landRadius * Math.sin((Math.PI * (hops - 0.62)) / 0.38);
          const ground = landY(along);
          flight.radius = landRadius;
          flight.x = landX(along);
          flight.y = ground - landRadius - hop;
          flight.rolling = true;
          flight.dirX = 1;
          flight.dirY = 0;
          const fallFull = landY(LANDS_AT) - photoBox.top + landRadius * 4;
          flight.travel = across + fallFull + (along - LANDS_AT) * photoBox.width;
          const lift = clamp01(hop / (landRadius * 3.4));
          flight.contact = 1 - smoothstep(0, 0.12, lift);
          // Low sun behind the camera: the shadow runs away from you, so on ground this far off it
          // is a thin dark sliver at the ball's foot, a little to the right.
          shadow.x = flight.x + landRadius * 0.25;
          shadow.y = ground - landRadius * 0.15;
          shadow.width = landRadius * (1.3 + 1.1 * lift);
          shadow.height = landRadius * (0.3 + 0.25 * lift);
          shadow.angle = -0.04;
          shadow.opacity = 0.62 * (1 - 0.5 * lift);
        }
        return;
      }

      if (a < 1 && ball < dropStart) {
        // The drive, over the aerial photograph.
        flight.visible = true;
        flight.light = 0;
        flight.rolling = false;
        flight.clip = null;
        // Fast off the face and slowing as the air takes its speed, which also carries it past
        // the headline's end before the headline scrolls up to meet it.
        const t = lerp(teeAt, exitAt, 1 - (1 - a) ** 3.2);
        const [groundX, groundY] = onHero(t);
        // It leaves the page and the camera follows it: the line it flies is where the hero's
        // line was before you scrolled, while the ground, and its shadow, scroll away beneath.
        // A phone's headline runs the full width under the line, so there the ball keeps to the
        // page, above the headline, and leaves by the top of the screen instead.
        const follow = width >= 768 ? smoothstep(0, 0.22, a) * (scroll - heroTop) : 0;
        flight.radius = teeRadius * (1 + 1.5 * Math.sin(Math.PI * a) ** 1.15);
        flight.x = groundX;
        flight.y = groundY + follow - teeRadius * 0.35;
        const [aheadX, aheadY] = onHero(t + 0.01);
        const speed = Math.hypot(aheadX - groundX, aheadY - groundY) || 1;
        flight.dirX = (aheadX - groundX) / speed;
        flight.dirY = (aheadY - groundY) / speed;
        flight.travel = (t - teeAt) * HERO_FRAME.width * scale;
        flight.veil = overlayAt((flight.y - heroBox.top) / heroBox.height) * OVERLAY_SHARE;
        flight.contact = 1 - smoothstep(0, 0.03, a);
        // At rest the afternoon sun throws a shadow about twice the ball's length, like the trees'
        // in the photograph. Once it's up, the shadow stays on the ground, slides away along the
        // line, spreads and fades.
        const reach = teeRadius * 1.3 + 120 * a;
        shadow.x = groundX + Math.cos(AERIAL_CAST) * reach;
        shadow.y = groundY + Math.sin(AERIAL_CAST) * reach;
        shadow.width = teeRadius * (1.7 + 3 * a);
        shadow.height = teeRadius * (0.72 + 1.6 * a);
        shadow.angle = AERIAL_CAST;
        shadow.opacity = 0.85 * (1 - smoothstep(0.02, 0.36, a));
        return;
      }

      flight.visible = false;
      flight.clip = null;
    };

    const tick = (_time: number, deltaMs: number) => {
      const scroll = window.scrollY;
      if (eased === null) eased = scroll;
      if (eased === scroll && scroll === lastScroll && !dirty) return;
      lastScroll = scroll;
      dirty = false;
      eased += (scroll - eased) * (1 - Math.exp(-deltaMs / 110));
      if (Math.abs(scroll - eased) < 0.3) eased = scroll;
      place(scroll, eased);
    };

    // Ahead of the world's own tick, so each frame draws this frame's position.
    gsap.ticker.add(tick, false, true);
    return () => {
      gsap.ticker.remove(tick);
      resizes.disconnect();
      flight.visible = false;
      flight.clip = null;
    };
  }, []);

  return null;
}
