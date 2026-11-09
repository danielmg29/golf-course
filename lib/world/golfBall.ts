import {
  CanvasTexture,
  LinearMipmapLinearFilter,
  Mesh,
  MeshPhysicalMaterial,
  ObjectSpaceNormalMap,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  type WebGLRenderer,
  WebGLRenderTarget,
} from "three";
import { disposeObject } from "@/lib/world/dispose";

// A real ball has 300 to 400 dimples covering about three quarters of its surface.
const DIMPLES = 336;
const DIMPLE_RADIUS = 0.098; // radians across the ball
const DIMPLE_DEPTH = 0.016; // of the ball's radius

const bakeShader = /* glsl */ `
  #define PI 3.141592653589793
  varying vec2 vUv;
  void main() {
    // The same direction three.js's SphereGeometry gives this texel.
    float phi = vUv.x * 2.0 * PI;
    float theta = (1.0 - vUv.y) * PI;
    vec3 d = vec3(-cos(phi) * sin(theta), cos(theta), sin(phi) * sin(theta));

    // The nearest dimple centre, from a Fibonacci spiral, which spreads them evenly.
    float best = -2.0;
    vec3 centre = vec3(0.0, 1.0, 0.0);
    for (int i = 0; i < ${DIMPLES}; i++) {
      float fi = float(i);
      float y = 1.0 - 2.0 * (fi + 0.5) / ${DIMPLES}.0;
      float r = sqrt(max(0.0, 1.0 - y * y));
      float a = fi * 2.399963229728653;
      vec3 p = vec3(cos(a) * r, y, sin(a) * r);
      float k = dot(p, d);
      if (k > best) { best = k; centre = p; }
    }

    // Inside a dimple the wall faces its centre: tilt the normal by the bowl's slope.
    float angle = acos(clamp(best, -1.0, 1.0));
    vec3 normal = d;
    if (angle < ${DIMPLE_RADIUS} && angle > 0.0001) {
      float slope = 2.0 * ${DIMPLE_DEPTH} * angle / (${DIMPLE_RADIUS} * ${DIMPLE_RADIUS});
      vec3 away = normalize(d * best - centre);
      normal = normalize(d - slope * away);
    }
    gl_FragColor = vec4(normal * 0.5 + 0.5, 1.0);
  }
`;

/** Bakes the dimples into an object-space normal map, once, on the GPU. */
export function bakeDimples(renderer: WebGLRenderer, width: number) {
  const target = new WebGLRenderTarget(width, width / 2, {
    generateMipmaps: true,
    minFilter: LinearMipmapLinearFilter,
  });
  const scene = new Scene();
  const quad = new Mesh(
    new PlaneGeometry(2, 2),
    new ShaderMaterial({
      vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
      fragmentShader: bakeShader,
    }),
  );
  scene.add(quad);
  const previous = renderer.getRenderTarget();
  renderer.setRenderTarget(target);
  renderer.render(scene, new OrthographicCamera(-1, 1, 1, -1, 0, 1));
  renderer.setRenderTarget(previous);
  disposeObject(quad);
  return target;
}

/** The ball's print: a gold alignment line round its equator and the club's name above it. */
export function paintPrint() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("No 2D canvas available.");
  context.fillStyle = "#f4f2ec";
  context.fillRect(0, 0, 1024, 512);
  // The line golfers draw to aim a putt.
  context.fillStyle = "#b8902a";
  context.fillRect(0, 252, 1024, 8);
  // u = 0.25 faces the camera at rest.
  context.fillStyle = "#1b110a";
  context.font = "600 26px sans-serif";
  context.textAlign = "center";
  context.fillText("THE RESERVE", 256, 236);
  context.font = "italic 20px serif";
  context.fillText("Kenya", 256, 290);
  // A small crest on the far side.
  context.strokeStyle = "#b8902a";
  context.lineWidth = 4;
  context.beginPath();
  context.arc(768, 216, 22, 0, Math.PI * 2);
  context.stroke();
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/**
 * A white disc for shadows, solid to `edge` (0 to 1 of its radius) and fading smoothly to nothing
 * at its rim: a low `edge` gives a soft, high shadow; a high one the firm shadow of a ball on
 * the ground. Tint it with the material's colour, so a shadow takes the hue of the ground it
 * falls on rather than a flat black.
 */
export function paintShadow(edge: number) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("No 2D canvas available.");
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(edge, "rgba(255,255,255,0.92)");
  for (let step = 1; step <= 6; step += 1) {
    const t = step / 6;
    // A smoothstep from the edge to the rim.
    const fade = 1 - t * t * (3 - 2 * t);
    gradient.addColorStop(edge + (1 - edge) * t, `rgba(255,255,255,${(0.92 * fade).toFixed(3)})`);
  }
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  return new CanvasTexture(canvas);
}

/**
 * One photoreal golf ball of radius 1: a dimpled, clear-coated shell with the club's print.
 * The dimples are baked on this renderer's GPU, so each WebGL context builds its own ball.
 * Free the returned `dimples` target along with the mesh.
 */
export function createGolfBall(renderer: WebGLRenderer, detail: "high" | "mid") {
  const dimples = bakeDimples(renderer, detail === "high" ? 1024 : 512);
  const ball = new Mesh(
    detail === "high" ? new SphereGeometry(1, 96, 64) : new SphereGeometry(1, 48, 32),
    new MeshPhysicalMaterial({
      color: 0xffffff,
      map: paintPrint(),
      normalMap: dimples.texture,
      normalMapType: ObjectSpaceNormalMap,
      roughness: 0.32,
      metalness: 0,
      clearcoat: 0.5,
      clearcoatRoughness: 0.22,
      envMapIntensity: 1,
    }),
  );
  return { ball, dimples };
}
