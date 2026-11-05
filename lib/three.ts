import { PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { gsap } from "@/lib/motion";

export type Stage = {
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
};

/**
 * Builds a scene on a ready stage. Tweens created here are reverted automatically.
 * Return a function to clean up anything else, such as event listeners.
 */
export type SceneSetup = (stage: Stage) => void | (() => void);

// Above this, the GPU cost keeps rising with little visible gain.
const MAX_PIXEL_RATIO = 2;

/**
 * Runs a scene inside `container` and returns its teardown. Throws when WebGL is
 * unavailable. Only import this dynamically (SceneCanvas does), which keeps Three.js
 * out of the first-load bundle.
 */
export function mountStage(container: HTMLElement, setup: SceneSetup): () => void {
  const renderer = new WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
  renderer.domElement.className = "block size-full";

  const scene = new Scene();
  const camera = new PerspectiveCamera(45, 1, 0.1, 100);
  const render = () => renderer.render(scene, camera);

  const tweens = gsap.context(() => setup({ scene, camera, renderer }));
  container.append(renderer.domElement);

  // Sized from the container, not the window, so a scene fits any layout it's placed in.
  const resize = () => {
    const { clientWidth: width, clientHeight: height } = container;
    if (width === 0 || height === 0) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    render();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  // GSAP's ticker drives rendering so tweens and frames share one clock. The loop
  // only runs while the scene is on screen.
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) gsap.ticker.add(render);
    else gsap.ticker.remove(render);
  });
  visibilityObserver.observe(container);

  return () => {
    visibilityObserver.disconnect();
    resizeObserver.disconnect();
    gsap.ticker.remove(render);
    tweens.revert();
    renderer.dispose();
    // Frees every GPU resource at once, so scenes need no per-object dispose calls.
    // Browsers also cap live WebGL contexts, and hidden routes remount scenes.
    renderer.forceContextLoss();
    renderer.domElement.remove();
  };
}
