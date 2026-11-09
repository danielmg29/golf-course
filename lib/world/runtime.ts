import { PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { gsap } from "@/lib/motion";
import { type ActId, subscribe, world } from "@/lib/world/store";
import { type LiveTier, lowerTier, tierSettings } from "@/lib/world/tier";

export type WorldStage = {
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  tier: LiveTier;
};

export type ActHandle = {
  /** Runs once a frame while the act is on screen. Return true while anything is moving. */
  update: (time: number, delta: number) => boolean;
  /** Runs when the canvas changes size, after the camera's aspect has been updated. */
  resize?: (width: number, height: number) => void;
  /** Takes the act's objects out of the scene and frees their GPU memory. */
  dispose: () => void;
};

/** Builds an act on the world's stage. Acts set the camera themselves when they mount. */
export type Act = (stage: WorldStage) => ActHandle;
export type ActLoaders = Record<ActId, () => Promise<{ default: Act }>>;

// The frame probe ignores the first frames, while shaders compile and the page settles,
// then steps the tier down once if the median frame is slower than 25 fps. Not 60: iOS Low
// Power Mode and Android battery savers cap pages at 30 fps (33 ms) on capable phones, and
// those visitors should keep the world. Gaps longer than a quarter second are a tab switch
// or a throttled background page, not the device's speed, so they don't count.
const PROBE_SKIP = 30;
const PROBE_SAMPLES = 60;
const SLOW_FRAME_MS = 40;
const IGNORED_GAP_MS = 250;

/**
 * Runs the site's one WebGL renderer inside `container` and returns its teardown. Acts come
 * and go with `world.act`, but the renderer, its canvas and the GPU context last the whole
 * visit. Nothing is drawn while there's no act or `world.presence` is 0, and a frame is only
 * drawn when something changed. Calls `onFallback` when the device is too slow even for
 * the mid tier, or an act fails to load. Throws when WebGL is unavailable.
 *
 * Only import this dynamically, as World does, so Three.js stays out of the first load.
 */
export function startWorld(
  container: HTMLElement,
  loaders: ActLoaders,
  initialTier: LiveTier,
  onFallback: () => void,
): () => void {
  let tier = initialTier;
  const renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
  const applyPixelRatio = () =>
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, tierSettings[tier].maxPixelRatio));
  applyPixelRatio();
  renderer.domElement.className = "block size-full";
  container.append(renderer.domElement);

  const scene = new Scene();
  const camera = new PerspectiveCamera(40, 1, 0.1, 200);
  const root = document.documentElement;

  let disposed = false;
  let act: ActHandle | null = null;
  let shownAct: ActId | null = null;
  let loading = 0;
  let needsFrame = true;
  let shownPresence = -1;
  let probeSkipped = 0;
  let probeDone = false;
  const samples: number[] = [];

  const resize = () => {
    const { clientWidth: width, clientHeight: height } = container;
    if (width === 0 || height === 0) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    act?.resize?.(width, height);
    needsFrame = true;
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);

  const probe = (deltaMs: number) => {
    if (probeDone || deltaMs > IGNORED_GAP_MS) return;
    if (probeSkipped < PROBE_SKIP) {
      probeSkipped += 1;
      return;
    }
    samples.push(deltaMs);
    if (samples.length < PROBE_SAMPLES) return;
    probeDone = true;
    const median = samples.sort((a, b) => a - b)[Math.floor(samples.length / 2)];
    if (median <= SLOW_FRAME_MS) return;
    const next = lowerTier(tier);
    if (process.env.NODE_ENV !== "production") {
      console.info(`World: median frame ${median.toFixed(1)} ms on the ${tier} tier, stepping down to ${next}.`);
    }
    world.tier = next;
    if (next === "poster") {
      onFallback();
      return;
    }
    tier = next;
    applyPixelRatio();
    resize();
  };

  const tick = (time: number, deltaMs: number) => {
    if (!act) return;
    if (world.presence !== shownPresence) {
      shownPresence = world.presence;
      container.style.opacity = String(shownPresence);
      needsFrame = true;
    }
    if (shownPresence <= 0) return;

    const moving = act.update(time, deltaMs / 1000);
    if (!moving && !needsFrame) return;
    renderer.render(scene, camera);
    needsFrame = false;
    // Pages fade their poster artwork out once the world has something to show.
    root.dataset.world = "live";
    if (moving) probe(deltaMs);
  };

  const unmountAct = () => {
    if (!act) return;
    gsap.ticker.remove(tick);
    act.dispose();
    act = null;
    delete root.dataset.world;
    // The canvas keeps showing its last frame until it's cleared.
    renderer.setRenderTarget(null);
    renderer.clear();
  };

  const fail = (error: unknown) => {
    console.error(error);
    onFallback();
  };

  const showAct = async () => {
    const next = world.act;
    if (next === shownAct) return;
    shownAct = next;
    const ticket = ++loading;
    unmountAct();
    if (next === null) return;

    const { default: mount } = await loaders[next]();
    // A newer act was asked for, or the world stopped, while this one downloaded.
    if (ticket !== loading || disposed) return;
    act = mount({ scene, camera, renderer, tier });
    shownPresence = -1;
    resize();
    gsap.ticker.add(tick);
  };

  const unsubscribe = subscribe(() => showAct().catch(fail));
  showAct().catch(fail);

  return () => {
    disposed = true;
    unsubscribe();
    unmountAct();
    resizeObserver.disconnect();
    renderer.dispose();
    // Frees the GPU context now rather than whenever the browser collects it.
    renderer.forceContextLoss();
    renderer.domElement.remove();
    container.style.opacity = "";
  };
}
