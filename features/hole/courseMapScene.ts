import {
  ACESFilmicToneMapping,
  BackSide,
  type BufferGeometry,
  CanvasTexture,
  CatmullRomCurve3,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  ExtrudeGeometry,
  Float32BufferAttribute,
  FogExp2,
  RepeatWrapping,
  SRGBColorSpace,
  Group,
  HemisphereLight,
  IcosahedronGeometry,
  InstancedMesh,
  LinearMipmapLinearFilter,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Object3D,
  BoxGeometry,
  PlaneGeometry,
  PMREMGenerator,
  Quaternion,
  ShaderMaterial,
  Shape,
  SphereGeometry,
  TubeGeometry,
  Vector3,
  Vector4,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { mergeGeometries, mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import {
  holePlans,
  landmarks,
  MAP_DEPTH,
  MAP_WIDTH,
  mapController,
  pointOnHole,
  type HolePlan,
  terrainHeight,
  waterBodies,
} from "@/features/hole/courseLayout";
import { gsap, MOTION_OK } from "@/lib/motion";
import type { SceneSetup } from "@/lib/three";
import { createGolfBall, paintShadow } from "@/lib/world/golfBall";
import { paintNoise, seeded, smoothstep } from "@/lib/world/noise";
import { pickTier, readTierEnvironment } from "@/lib/world/tier";

const PANEL_BREAKPOINT = 1024;
const ANTIQUE = 0xb89556;

// Late afternoon from the west: long shadows run east across the course, as in an aerial
// photograph taken a couple of hours before sunset.
const SUN = new Vector3(-0.78, 0.5, 0.36).normalize();
// Where a shadow falls on flat ground, and how far per unit of height.
const SHADOW_DIRECTION = { x: -SUN.x, z: -SUN.z };
const shadowLength = Math.hypot(SUN.x, SUN.z) / SUN.y;
{
  const flat = Math.hypot(SHADOW_DIRECTION.x, SHADOW_DIRECTION.z);
  SHADOW_DIRECTION.x /= flat;
  SHADOW_DIRECTION.z /= flat;
}

// sRGB colours, read from aerial photographs of parkland courses in the Kenyan highlands.
const palette = {
  rough: "#56692d",
  roughDry: "#857f45",
  bush: "#34451f",
  cut: "#5e7f2f",
  fairway: "#6a9b36",
  collar: "#5f9734",
  green: "#78ae42",
  sand: "#e3d6b0",
  path: "#cbc1a6",
  waterDeep: "#173538",
  waterShallow: "#3b5f4c",
  pool: "#47bfc4",
  skyZenith: "#6992bd",
  skyHorizon: "#c9d2cc",
  sun: "#ffdcaa",
  skyLight: "#a7bdd2",
};
const linear = (hex: string) => {
  const { r, g, b } = new Color(hex);
  return `vec3(${r.toFixed(4)}, ${g.toFixed(4)}, ${b.toFixed(4)})`;
};
const glslPalette = Object.entries(palette)
  .map(([name, hex]) => `const vec3 ${name.replace(/[A-Z]/g, (c) => `_${c}`).toUpperCase()} = ${linear(hex)};`)
  .join("\n");

// The ball is larger than life against the map's scale, so it reads beside the pin.
const BALL_RADIUS = 0.034;
const FLAG_HEIGHT = 0.5;

/** The course's ground, carried on past its edges into rough country and a line of far hills. */
function groundHeight(x: number, z: number) {
  const reach = Math.max(Math.abs(x) / (MAP_WIDTH / 2), Math.abs(z) / (MAP_DEPTH / 2));
  const beyond = smoothstep(1.05, 2.2, reach);
  const far = smoothstep(2.4, 4.6, reach);
  const swell = 0.5 + 0.5 * Math.sin(x * 0.07 + 1.1) * Math.cos(z * 0.06 - 0.4);
  const ridge = 0.6 + 0.4 * Math.sin(x * 0.031 + z * 0.022);
  return terrainHeight(x, z) + beyond * (0.8 + 2 * swell) + far * 5.5 * ridge;
}

type Pin = { x: number; z: number };

/** Where each hole's flag stands: somewhere on its green, never dead centre. */
function placePins(): Pin[] {
  const random = seeded(18);
  return holePlans.map((plan) => {
    const angle = random() * Math.PI * 2;
    const offset = 0.12 + random() * 0.2;
    return { x: plan.green[0] + Math.cos(angle) * offset, z: plan.green[1] + Math.sin(angle) * offset };
  });
}

type Tree = { x: number; z: number; kind: "round" | "acacia"; size: number; shade: number };

function plantTrees(count: number, outside: number): Tree[] {
  const random = seeded(7);
  const corridor = holePlans.flatMap((plan) => Array.from({ length: 16 }, (_, step) => pointOnHole(plan, step / 15)));
  const trees: Tree[] = [];
  const clear = (x: number, z: number, room: number) =>
    !corridor.some(([px, pz]) => (x - px) ** 2 + (z - pz) ** 2 < room) &&
    // Greens stay open to the sky, so they read and the putting surface isn't in shade.
    !holePlans.some((plan) => (x - plan.green[0]) ** 2 + (z - plan.green[1]) ** 2 < 2.4 ** 2) &&
    !waterBodies.some((water) => (x - water.x) ** 2 + (z - water.z) ** 2 < (water.r * 1.2) ** 2) &&
    !(z > 8 && x > -6.5 && x < 11.5);

  // Groves between the holes, thickest where the ground is folded.
  for (let attempt = 0; attempt < count * 14 && trees.length < count; attempt += 1) {
    const x = (random() - 0.5) * MAP_WIDTH * 0.96;
    const z = (random() - 0.5) * MAP_DEPTH * 0.96;
    const grove = Math.sin(x * 0.7 + 1) * Math.cos(z * 0.9 - 2) + Math.sin(x * 1.9 - z * 1.3) * 0.35 + (random() - 0.5) * 0.3;
    if (grove < 0.25 || !clear(x, z, 1.25)) continue;
    const acacia = random() < 0.18;
    trees.push({ x, z, kind: acacia ? "acacia" : "round", size: 0.7 + random() * 0.6, shade: random() });
  }
  // Beyond the course: a belt of woodland at its edge, then acacias scattered across the rough country.
  for (let placed = 0, attempt = 0; placed < outside && attempt < outside * 8; attempt += 1) {
    const angle = random() * Math.PI * 2;
    const ring = 1.02 + random() ** 1.8 * 1.6;
    const x = Math.cos(angle) * (MAP_WIDTH / 2) * ring * 1.05;
    const z = Math.sin(angle) * (MAP_DEPTH / 2) * ring * 1.05;
    const acacia = ring > 1.25 ? random() < 0.75 : random() < 0.25;
    trees.push({ x, z, kind: acacia ? "acacia" : "round", size: 0.8 + random() * 0.7, shade: random() });
    placed += 1;
  }
  return trees;
}

const treeShape = {
  round: { canopy: 0.26, trunk: 0.16 },
  acacia: { canopy: 0.36, trunk: 0.3 },
};

/**
 * Paints the course plan as distance ramps rather than flat fills: each surface is 1 inside,
 * 0.5 on its edge and 0 a short way beyond. The shader cuts each ramp at 0.5 (nudged by noise
 * for ragged, organic edges), so the edges stay sharp however close the camera comes, from a
 * texture small enough for a phone. Channels are drawn with "lighten", so they never mix.
 *   surfaces  r fairways and tees · g greens · b bunkers
 *   details   r tree shadows · g cart paths and paving · b the cups
 */
function paintPlan(width: number, pins: Pin[], trees: Tree[]) {
  const height = Math.round((width * MAP_DEPTH) / MAP_WIDTH);
  const unit = width / MAP_WIDTH;
  const tx = (x: number) => (x + MAP_WIDTH / 2) * unit;
  const tz = (z: number) => (z + MAP_DEPTH / 2) * unit;

  const canvas = () => {
    const element = document.createElement("canvas");
    element.width = width;
    element.height = height;
    const context = element.getContext("2d");
    if (!context) throw new Error("No 2D canvas available.");
    context.fillStyle = "#000";
    context.fillRect(0, 0, width, height);
    context.globalCompositeOperation = "lighten";
    return { element, context };
  };
  type Channel = 0 | 1 | 2;
  const tone = (channel: Channel, value: number) => {
    const v = Math.round(Math.min(1, Math.max(0, value)) * 255);
    return channel === 0 ? `rgb(${v},0,0)` : channel === 1 ? `rgb(0,${v},0)` : `rgb(0,0,${v})`;
  };

  /** An ellipse ramp: `radius` to its edge, `falloff` wide across it, turned by `angle`. */
  const blob = (
    context: CanvasRenderingContext2D,
    channel: Channel,
    x: number,
    z: number,
    radius: number,
    falloff: number,
    stretch = 1,
    angle = 0,
    peak = 1,
  ) => {
    const outer = (radius + falloff / 2) * unit;
    const inner = Math.max(0, radius - falloff / 2) * unit;
    context.save();
    context.translate(tx(x), tz(z));
    context.rotate(angle);
    context.scale(stretch, 1);
    const gradient = context.createRadialGradient(0, 0, 0, 0, 0, outer);
    gradient.addColorStop(0, tone(channel, peak));
    gradient.addColorStop(inner / outer, tone(channel, peak));
    gradient.addColorStop(1, tone(channel, 0));
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(0, 0, outer, 0, Math.PI * 2);
    context.fill();
    context.restore();
  };

  /** A ramp along a path: a stack of strokes, widest and faintest first. */
  const ribbon = (
    context: CanvasRenderingContext2D,
    channel: Channel,
    points: [number, number][],
    half: number,
    falloff: number,
  ) => {
    context.lineCap = "round";
    context.lineJoin = "round";
    for (let step = 1; step <= 16; step += 1) {
      const value = step / 16;
      const width = 2 * (half + falloff * (0.5 - value));
      if (width <= 0) continue;
      context.strokeStyle = tone(channel, value);
      context.lineWidth = width * unit;
      context.beginPath();
      points.forEach(([x, z], index) => (index === 0 ? context.moveTo(tx(x), tz(z)) : context.lineTo(tx(x), tz(z))));
      context.stroke();
    }
  };

  const surfaces = canvas();
  const details = canvas();
  const s = surfaces.context;
  const d = details.context;
  const random = seeded(3);

  for (const plan of holePlans) {
    const along = (t: number) => pointOnHole(plan, t);
    const [teeX, teeZ] = plan.tee;
    const [greenX, greenZ] = plan.green;
    const heading = Math.atan2(greenZ - teeZ, greenX - teeX);

    // The fairway swells and narrows along its length, like a real one.
    if (!plan.isParThree) {
      const phase = random() * Math.PI * 2;
      for (let t = 0.17; t <= 0.95; t += 0.012) {
        const [x, z] = along(t);
        const taper = smoothstep(0.17, 0.3, t) * 0.35 + 0.65;
        const radius = 0.5 * taper * (0.86 + 0.24 * Math.sin(t * Math.PI * 2.4 + phase));
        blob(s, 0, x, z, radius, 0.9);
      }
    } else {
      // A short apron in front of a par three's green.
      for (let t = 0.6; t <= 0.95; t += 0.03) blob(s, 0, ...along(t), 0.3, 0.6);
    }
    // The tee box, mown like the fairway.
    blob(s, 0, teeX, teeZ, 0.2, 0.3, 1.8, heading);

    // An oval green, set across or along the line of play.
    blob(s, 1, greenX, greenZ, 0.7, 0.55, 1.1 + random() * 0.25, heading + (random() - 0.5) * 1.2);

    // Bunkers guarding the green, and a pair where the drives land.
    const guard = random() * Math.PI * 2;
    for (const side of [0, 2.2 + random() * 0.8]) {
      const a = guard + side;
      const x = greenX + Math.cos(a) * 0.95;
      const z = greenZ + Math.sin(a) * 0.95;
      blob(s, 2, x, z, 0.24, 0.16, 1.7, a + Math.PI / 2);
      blob(s, 2, x + Math.cos(a + 1.2) * 0.14, z + Math.sin(a + 1.2) * 0.14, 0.17, 0.16, 1.3, a);
    }
    if (!plan.isParThree) {
      const [lx, lz] = along(0.58);
      const [ax, az] = along(0.6);
      const normal = Math.atan2(az - lz, ax - lx) + Math.PI / 2;
      const flip = random() < 0.5 ? 1 : -1;
      blob(s, 2, lx + Math.cos(normal) * 0.62 * flip, lz + Math.sin(normal) * 0.62 * flip, 0.18, 0.14, 2.1, normal + Math.PI / 2);
    }

    // The cart path runs beside the hole, a little off its right-hand side.
    const path: [number, number][] = [];
    for (let t = 0.04; t <= 0.8; t += 0.04) {
      const [x, z] = along(t);
      const [nx, nz] = along(t + 0.02);
      const angle = Math.atan2(nz - z, nx - x) - Math.PI / 2;
      // Swings out wide as it nears the green, where carts are kept off.
      const offset = 0.95 + 0.2 * Math.sin(t * 6) + smoothstep(0.55, 0.8, t) * 0.7;
      path.push([x + Math.cos(angle) * offset, z + Math.sin(angle) * offset]);
    }
    ribbon(d, 1, path, 0.035, 0.05);
  }

  // The driving range, mown short, and the paved terrace and car park round the clubhouse.
  const bays = landmarks[2];
  for (let step = 1; step <= 10; step += 1) {
    const inset = (0.6 - step * 0.06) * unit;
    s.fillStyle = tone(0, step / 10);
    s.fillRect(tx(bays.x - 2.3) - inset, tz(bays.z - 2.8) - inset, 4.6 * unit + inset * 2, 2.7 * unit + inset * 2);
  }
  const [clubhouse] = landmarks;
  blob(d, 1, clubhouse.x, clubhouse.z + 0.62, 0.42, 0.12, 2.4);
  blob(d, 1, clubhouse.x + 2.4, clubhouse.z + 0.9, 0.36, 0.1, 1.8);

  // Every tree's shadow, cast by the same sun as the lighting: long, and away from it.
  for (const tree of trees) {
    if (Math.abs(tree.x) > MAP_WIDTH / 2 || Math.abs(tree.z) > MAP_DEPTH / 2) continue;
    const shape = treeShape[tree.kind];
    const tall = (shape.trunk + shape.canopy) * tree.size;
    const reach = tall * shadowLength * 0.55;
    const radius = shape.canopy * tree.size * (tree.kind === "acacia" ? 1.5 : 1);
    blob(
      d,
      0,
      tree.x + SHADOW_DIRECTION.x * reach,
      tree.z + SHADOW_DIRECTION.z * reach,
      radius,
      radius * 0.7,
      1 + reach / radius / 1.6,
      Math.atan2(SHADOW_DIRECTION.z, SHADOW_DIRECTION.x),
    );
  }

  for (const pin of pins) blob(d, 2, pin.x, pin.z, 0.03, 0.05);

  const texture = (element: HTMLCanvasElement) => {
    const result = new CanvasTexture(element);
    // The shader reads it by world position, with the canvas's top row at the course's far edge.
    result.flipY = false;
    result.minFilter = LinearMipmapLinearFilter;
    result.anisotropy = 8;
    return result;
  };
  return { surfaces: texture(surfaces.element), details: texture(details.element) };
}

const groundShader = (surfaces: CanvasTexture, details: CanvasTexture, fog: FogExp2) =>
  new ShaderMaterial({
    uniforms: {
      surfaces: { value: surfaces },
      details: { value: details },
      noiseMap: { value: paintNoise() },
      mapSize: { value: [MAP_WIDTH, MAP_DEPTH] },
      sunDirection: { value: SUN },
      waters: { value: waterBodies.map((water) => new Vector4(water.x, water.z, water.r, 0)) },
      pool: { value: new Vector4(landmarks[1].x, landmarks[1].z, 0.62, 0.3) },
      fogColor: { value: fog.color },
      fogDensity: { value: fog.density },
    },
    vertexShader: /* glsl */ `
      varying vec3 vWorld;
      varying vec3 vNormal;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorld = world.xyz;
        vNormal = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D surfaces;
      uniform sampler2D details;
      uniform sampler2D noiseMap;
      uniform vec2 mapSize;
      uniform vec3 sunDirection;
      uniform vec4 waters[${waterBodies.length}];
      uniform vec4 pool;
      uniform vec3 fogColor;
      uniform float fogDensity;
      varying vec3 vWorld;
      varying vec3 vNormal;

      ${glslPalette}

      // Noise in cell units, read from the tiling noise texture (16 cells to a tile).
      float noise(vec2 p) { return texture2D(noiseMap, p / 16.0).r; }
      float noiseB(vec2 p) { return texture2D(noiseMap, p / 16.0).g; }
      float fbm(vec2 p) {
        return noise(p) * 0.57 + noiseB(p * 2.03 + 17.1) * 0.29 + noise(p * 4.1 + 5.3) * 0.14;
      }
      // Fine detail: mipmaps already fade it to flat where it would be finer than a pixel.
      float detail(vec2 p) { return texture2D(noiseMap, p / 64.0).b; }
      // Cuts a distance ramp at \`at\`, antialiased to one pixel at any distance.
      float cut(float value, float at) {
        float w = fwidth(value) * 0.75 + 0.002;
        return smoothstep(at - w, at + w, value);
      }

      void main() {
        vec2 p = vWorld.xz;
        vec2 uv = p / mapSize + 0.5;
        // The plan only covers the course: past its edges a clamped texture would smear its last
        // row out across the country, so it fades to nothing there.
        vec2 inPlan = smoothstep(0.0, 0.004, uv) * smoothstep(1.0, 0.996, uv);
        float planned = inPlan.x * inPlan.y;
        vec3 s = texture2D(surfaces, uv).rgb * planned;
        vec3 d = texture2D(details, uv).rgb * planned;

        float large = fbm(p * 0.16);
        float mid = noise(p * 1.6);
        float fine = detail(p * 11.0);
        float grain = detail(p * 70.0);
        vec2 outside = abs(p) - mapSize * 0.5;
        float beyond = smoothstep(-3.0, 5.0, max(outside.x, outside.y));

        // Rough: olive, drying to straw in patches, with dark scrub that thickens off the course.
        vec3 color = mix(ROUGH, ROUGH_DRY, smoothstep(0.45, 0.78, large) * 0.5);
        color *= 0.88 + 0.24 * mid;
        float scrub = smoothstep(0.44, 0.62, noiseB(p * 0.45 + 3.0) * 0.65 + noise(p * 1.1 + 9.0) * 0.35);
        color = mix(color, BUSH * (0.75 + 0.5 * fine), scrub * (0.3 + 0.7 * beyond));

        // Fairways, with a first cut of semi-rough round them and a checkerboard of mowing.
        float ragged = (mid - 0.5) * 0.14;
        float fairway = cut(s.r + ragged, 0.5);
        float firstCut = cut(s.r + ragged, 0.27) * (1.0 - fairway);
        color = mix(color, CUT * (0.94 + 0.12 * mid), firstCut);
        vec2 q = mat2(0.866, 0.5, -0.5, 0.866) * p * 1.6;
        float checker = mod(floor(q.x) + floor(q.y), 2.0);
        float stripes = 1.0 - smoothstep(0.25, 0.6, length(fwidth(q)));
        color = mix(color, FAIRWAY * (1.0 + (checker - 0.5) * 0.08 * stripes) * (0.95 + 0.1 * mid), fairway);

        // Greens: a collar, then the putting surface, cut in fine bands.
        float green = cut(s.g + (fine - 0.5) * 0.03, 0.5);
        float collar = cut(s.g + (fine - 0.5) * 0.04, 0.36) * (1.0 - green);
        color = mix(color, COLLAR, collar);
        float band = step(0.5, fract(dot(p, vec2(0.6, 0.8)) * 3.4));
        float bands = 1.0 - smoothstep(0.08, 0.2, length(fwidth(p * 3.4)));
        // Fine grain on the putting surface, which only shows close up.
        float grainGreen = detail(p * 5.0);
        color = mix(color, GREEN * (0.97 + 0.07 * band * bands) * (0.95 + 0.06 * fine + 0.06 * grainGreen), green);

        // Bunkers, with a dark turf lip where the grass hangs over the sand.
        float sandRamp = s.b + (fine - 0.5) * 0.06 + (mid - 0.5) * 0.08;
        float sand = cut(sandRamp, 0.5);
        float lip = smoothstep(0.3, 0.5, sandRamp) * (1.0 - sand);
        color *= 1.0 - lip * 0.6;
        // Raked sand: fine furrows that fade out before they could shimmer, and a damp, shaded
        // band just inside the edge where the face drops away from the lip.
        vec2 rakeAxis = vec2(0.8, 0.6);
        float rakeCoord = dot(p, rakeAxis) * 9.0 + mid * 1.5;
        float rake = (sin(rakeCoord * 6.2831) * 0.5 + 0.5) * (1.0 - smoothstep(0.15, 0.5, length(fwidth(vec2(rakeCoord)))));
        float face = mix(0.8, 1.0, smoothstep(0.5, 0.75, sandRamp));
        color = mix(color, SAND * (0.88 + 0.1 * fine + 0.05 * grain + 0.08 * rake) * face, sand);

        float path = cut(d.g + (fine - 0.5) * 0.05, 0.5);
        color = mix(color, PATH * (0.9 + 0.12 * fine), path);
        float grass = (1.0 - sand) * (1.0 - path);
        color *= 1.0 + (grain - 0.5) * 0.16 * grass;

        // The low sun, the sky, and the trees' shadows, baked from the same sun.
        vec3 n = normalize(vNormal);
        float sunlight = max(dot(n, sunDirection), 0.0) * (1.0 - d.r * 0.82);
        vec3 light = SKY_LIGHT * (0.4 + 0.2 * n.y) + SUN * sunlight * 1.85;
        vec3 shaded = color * light;
        shaded = mix(shaded, vec3(0.01, 0.009, 0.007), cut(d.b, 0.5));

        // Water: round ponds in the plan, with ragged banks, the sky in them, and the sun's glint.
        float shore = 10.0;
        for (int i = 0; i < ${waterBodies.length}; i++) {
          shore = min(shore, (length(p - waters[i].xy) - waters[i].z) / waters[i].z);
        }
        shore += (mid - 0.5) * 0.14 + (fine - 0.5) * 0.04;
        vec2 poolEdge = abs(p - pool.xy) - pool.zw;
        float inPool = 1.0 - cut(max(poolEdge.x, poolEdge.y), 0.0);
        float water = max(cut(-shore, 0.0), inPool);
        shaded *= 1.0 - (1.0 - smoothstep(0.0, 0.12, shore)) * 0.3 * (1.0 - water);
        if (water > 0.001) {
        vec3 view = normalize(cameraPosition - vWorld);
        vec2 ripple = vec2(noise(p * 7.0), noiseB(p * 7.0)) - 0.5;
        vec3 surfaceNormal = normalize(vec3(ripple.x * 0.08, 1.0, ripple.y * 0.08));
        float fresnel = 0.04 + 0.96 * pow(1.0 - max(dot(view, surfaceNormal), 0.0), 5.0);
        vec3 reflected = reflect(-view, surfaceNormal);
        float glint = pow(max(dot(reflected, sunDirection), 0.0), 240.0);
        vec3 body = mix(WATER_SHALLOW, WATER_DEEP, smoothstep(0.0, 0.6, -shore)) * (SKY_LIGHT * 0.6 + SUN * 0.45);
        body = mix(body, POOL * (SKY_LIGHT * 0.55 + SUN * 0.75), inPool);
        vec3 skyTone = mix(SKY_HORIZON, SKY_ZENITH, clamp(reflected.y * 1.5, 0.0, 1.0));
        shaded = mix(shaded, mix(body, skyTone, fresnel) + SUN * glint * 4.0, water);
        }

        // Aerial haze: the same fog as everything else in the scene.
        float range = length(cameraPosition - vWorld);
        shaded = mix(shaded, fogColor, 1.0 - exp(-pow(fogDensity * range, 2.0)));

        gl_FragColor = vec4(shaded, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });

/** One grid for the course and the country round it: fine over the course, coarse far out. */
function buildGround(columns: number, rows: number) {
  const geometry = new PlaneGeometry(2, 2, columns, rows);
  geometry.rotateX(-Math.PI / 2);
  const warp = (u: number, half: number, far: number) => {
    const a = Math.abs(u);
    const inner = 0.6;
    const course = half + 3;
    const value = a <= inner ? (a / inner) * course : course + ((a - inner) / (1 - inner)) ** 1.8 * (far - course);
    return Math.sign(u) * value;
  };
  const positions = geometry.attributes.position;
  for (let index = 0; index < positions.count; index += 1) {
    const x = warp(positions.getX(index), MAP_WIDTH / 2, 150);
    const z = warp(positions.getZ(index), MAP_DEPTH / 2, 130);
    positions.setXYZ(index, x, groundHeight(x, z), z);
  }
  // Normals from the height function itself rather than the triangles: the far-out triangles are
  // long and thin, and averaging their faces streaks the light across the hills.
  const normals = geometry.attributes.normal;
  const step = 0.05;
  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const z = positions.getZ(index);
    const dx = (groundHeight(x + step, z) - groundHeight(x - step, z)) / (2 * step);
    const dz = (groundHeight(x, z + step) - groundHeight(x, z - step)) / (2 * step);
    const length = Math.hypot(dx, 1, dz);
    normals.setXYZ(index, -dx / length, 1 / length, -dz / length);
  }
  normals.needsUpdate = true;
  return geometry;
}

function buildSky() {
  return new Mesh(
    new SphereGeometry(300, 32, 16),
    new ShaderMaterial({
      uniforms: { sunDirection: { value: SUN } },
      vertexShader: /* glsl */ `
        varying vec3 vDirection;
        void main() {
          vDirection = position;
          vec4 clip = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_Position = clip.xyww;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 sunDirection;
        varying vec3 vDirection;
        ${glslPalette}
        void main() {
          vec3 d = normalize(vDirection);
          vec3 color = mix(SKY_HORIZON, SKY_ZENITH, pow(smoothstep(0.0, 0.55, max(d.y, 0.0)), 0.65));
          float toSun = max(dot(d, sunDirection), 0.0);
          color += SUN * (pow(toSun, 8.0) * 0.12 + pow(toSun, 80.0) * 0.35 + pow(toSun, 1600.0) * 6.0);
          gl_FragColor = vec4(color, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `,
      side: BackSide,
      depthWrite: false,
    }),
  );
}

/** Leaf clusters, light and dark, for the canopies. */
function paintFoliage() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("No 2D canvas available.");
  const random = seeded(23);
  context.fillStyle = "#b8b8b8";
  context.fillRect(0, 0, 256, 256);
  for (let index = 0; index < 2600; index += 1) {
    const light = random();
    context.fillStyle = `rgba(${light > 0.5 ? "255,255,255" : "0,0,0"},${0.12 + random() * 0.25})`;
    context.beginPath();
    context.arc(random() * 256, random() * 256, 1.5 + random() * 4.5, 0, Math.PI * 2);
    context.fill();
  }
  const texture = new CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(3, 2);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/** A lumpy canopy of several blobs, shaded darker underneath, baked into vertex colours. */
function canopyGeometry(kind: Tree["kind"], random: () => number) {
  const lumps: BufferGeometry[] = [];
  const count = kind === "round" ? 4 : 5;
  for (let index = 0; index < count; index += 1) {
    const lump = new IcosahedronGeometry(1, 1);
    const radius = kind === "round" ? 0.5 + random() * 0.3 : 0.42 + random() * 0.24;
    const angle = (index / count) * Math.PI * 2 + random();
    const spread = kind === "round" ? 0.32 + random() * 0.18 : 0.55 + random() * 0.25;
    lump.scale(radius, radius * (kind === "acacia" ? 0.36 : 0.86), radius);
    lump.translate(
      Math.cos(angle) * spread * (index === 0 ? 0 : 1),
      kind === "round" ? (random() - 0.35) * 0.45 : random() * 0.1,
      Math.sin(angle) * spread * (index === 0 ? 0 : 1),
    );
    lumps.push(mergeVertices(lump));
  }
  const geometry = mergeGeometries(lumps);
  const positions = geometry.attributes.position;
  let low = Infinity;
  let high = -Infinity;
  for (let index = 0; index < positions.count; index += 1) {
    low = Math.min(low, positions.getY(index));
    high = Math.max(high, positions.getY(index));
  }
  const colors: number[] = [];
  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const y = positions.getY(index);
    const z = positions.getZ(index);
    // Leaf clumps: a fixed jitter from the position, so shared vertices move together.
    const jitter = Math.sin(x * 12.9 + y * 78.2 + z * 37.7) * 0.06;
    positions.setXYZ(index, x * (1 + jitter), y * (1 + jitter * 0.6), z * (1 + jitter));
    const height = (y - low) / (high - low || 1);
    const clump = 0.5 + 0.5 * Math.sin(x * 23 + y * 11) * Math.cos(z * 19 - y * 7);
    const tone = (0.28 + 0.72 * smoothstep(0, 0.95, height)) * (0.78 + 0.34 * clump);
    colors.push(tone, tone, tone);
  }
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function buildTrees(trees: Tree[]) {
  const group = new Group();
  const random = seeded(11);
  // Leaf clusters: a speckled texture as colour and as bump, so the light breaks up on them.
  const foliage = paintFoliage();
  const leaves = new MeshLambertMaterial({ vertexColors: true, map: foliage, bumpMap: foliage, bumpScale: 2.2 });
  const bark = new MeshLambertMaterial({ color: 0x3f3226 });
  const trunk = new CylinderGeometry(0.035, 0.06, 1, 5, 1);
  trunk.translate(0, 0.5, 0);
  const trunks = new InstancedMesh(trunk, bark, trees.length);
  const tones = {
    round: ["#2c461d", "#365222", "#283f1c", "#405a26", "#233a19"].map((hex) => new Color(hex)),
    acacia: ["#45552a", "#4f5f2c", "#3e4f25"].map((hex) => new Color(hex)),
  };
  const dummy = new Object3D();
  const tint = new Color();

  for (const kind of ["round", "acacia"] as const) {
    const own = trees.filter((tree) => tree.kind === kind);
    const canopies = new InstancedMesh(canopyGeometry(kind, random), leaves, own.length);
    own.forEach((tree, index) => {
      const shape = treeShape[kind];
      const ground = groundHeight(tree.x, tree.z);
      const tall = shape.trunk * tree.size;
      const radius = shape.canopy * tree.size;
      dummy.position.set(tree.x, ground + tall + radius * (kind === "acacia" ? 0.12 : 0.6), tree.z);
      dummy.rotation.set(0, tree.shade * Math.PI * 2, 0);
      dummy.scale.setScalar(radius);
      dummy.updateMatrix();
      canopies.setMatrixAt(index, dummy.matrix);
      const swatch = tones[kind][Math.floor(tree.shade * tones[kind].length)];
      canopies.setColorAt(index, tint.copy(swatch).multiplyScalar(0.85 + random() * 0.3));
    });
    group.add(canopies);
  }
  trees.forEach((tree, index) => {
    const shape = treeShape[tree.kind];
    dummy.position.set(tree.x, groundHeight(tree.x, tree.z) - 0.02, tree.z);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(tree.size * (tree.kind === "acacia" ? 0.8 : 1), shape.trunk * tree.size + 0.05, tree.size * (tree.kind === "acacia" ? 0.8 : 1));
    dummy.updateMatrix();
    trunks.setMatrixAt(index, dummy.matrix);
  });
  group.add(trunks);
  return group;
}

function buildFlags(pins: Pin[]) {
  const group = new Group();
  const poles = new InstancedMesh(
    new CylinderGeometry(0.006, 0.006, FLAG_HEIGHT, 6).translate(0, FLAG_HEIGHT / 2, 0),
    new MeshLambertMaterial({ color: 0xf4f1e8 }),
    pins.length,
  );
  // A flag lifting in the breeze.
  const cloth = new PlaneGeometry(0.15, 0.09, 6, 1);
  const positions = cloth.attributes.position;
  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index) + 0.075;
    positions.setXYZ(index, x, positions.getY(index), Math.sin(x * 26) * 0.012);
  }
  cloth.computeVertexNormals();
  const flags = new InstancedMesh(cloth, new MeshLambertMaterial({ color: 0xe9c547, side: DoubleSide }), pins.length);
  const dummy = new Object3D();
  pins.forEach((pin, index) => {
    const ground = groundHeight(pin.x, pin.z);
    dummy.position.set(pin.x, ground - 0.01, pin.z);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    poles.setMatrixAt(index, dummy.matrix);
    dummy.position.set(pin.x, ground + FLAG_HEIGHT - 0.05, pin.z);
    // Blowing east, with the afternoon wind.
    dummy.rotation.set(0, -0.35, 0);
    dummy.updateMatrix();
    flags.setMatrixAt(index, dummy.matrix);
  });
  group.add(poles, flags);
  return group;
}

/** A gabled roof: a triangle across `width`, run along `depth`. */
function gable(width: number, depth: number, rise: number) {
  const shape = new Shape();
  shape.moveTo(-width / 2, 0);
  shape.lineTo(width / 2, 0);
  shape.lineTo(0, rise);
  shape.closePath();
  const geometry = new ExtrudeGeometry(shape, { depth, bevelEnabled: false });
  geometry.translate(0, 0, -depth / 2);
  return geometry;
}

function buildClubhouse() {
  const group = new Group();
  const wall = new MeshLambertMaterial({ color: 0xe8dfcb });
  const roof = new MeshLambertMaterial({ color: 0x4b4c46 });
  const glass = new MeshLambertMaterial({ color: 0x24302d });
  const [{ x, z }, , bays] = landmarks;

  for (const [dx, dz, width, depth, turn] of [
    [0, 0, 1.6, 0.7, 0],
    [-1.05, 0.45, 0.62, 0.62, Math.PI / 2],
    [1.05, 0.3, 0.55, 0.85, Math.PI / 2],
  ]) {
    const ground = groundHeight(x + dx, z + dz);
    const block = new Mesh(new BoxGeometry(width, 0.24, depth), wall);
    block.position.set(x + dx, ground + 0.12, z + dz);
    const windows = new Mesh(new BoxGeometry(width * 0.86, 0.08, depth + 0.004), glass);
    windows.position.set(x + dx, ground + 0.13, z + dz);
    const cap = new Mesh(gable(turn ? depth + 0.1 : width + 0.1, turn ? width + 0.1 : depth + 0.1, 0.2), roof);
    cap.position.set(x + dx, ground + 0.24, z + dz);
    cap.rotation.y = turn ? Math.PI / 2 : 0;
    // A gable reads best across the short side.
    cap.rotation.y += Math.PI / 2;
    group.add(block, windows, cap);
  }

  // The floodlit bays: a long low roof with a line of lights along its front.
  const baysGround = groundHeight(bays.x, bays.z + 1.5);
  const baysRoof = new Mesh(new BoxGeometry(4.6, 0.05, 0.42), roof);
  baysRoof.position.set(bays.x, baysGround + 0.22, bays.z + 1.5);
  const baysBack = new Mesh(new BoxGeometry(4.6, 0.2, 0.06), wall);
  baysBack.position.set(bays.x, baysGround + 0.1, bays.z + 1.7);
  const lights = new Mesh(new BoxGeometry(4.6, 0.02, 0.02), new MeshBasicMaterial({ color: ANTIQUE }));
  lights.position.set(bays.x, baysGround + 0.19, bays.z + 1.29);
  group.add(baysRoof, baysBack, lights);
  return group;
}

function holeRouteGeometry(plan: HolePlan) {
  const points = Array.from({ length: 26 }, (_, step) => {
    const [x, z] = pointOnHole(plan, step / 25);
    return new Vector3(x, groundHeight(x, z) + 0.05, z);
  });
  return new TubeGeometry(new CatmullRomCurve3(points), 80, 0.016, 6);
}

type Pose = { position: Vector3; look: Vector3 };

function holePose(plan: HolePlan): Pose {
  const tee = new Vector3(plan.tee[0], groundHeight(...plan.tee), plan.tee[1]);
  const green = new Vector3(plan.green[0], groundHeight(...plan.green), plan.green[1]);
  const length = tee.distanceTo(green);
  const direction = green.clone().sub(tee).setY(0).normalize();
  return {
    position: tee
      .clone()
      .addScaledVector(direction, -(1.6 + length * 0.3))
      .setY(tee.y + 1.4 + length * 0.2),
    look: tee.clone().lerp(green, 0.68),
  };
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * The course, photoreal but cheap: one ground mesh painted by a shader, one sky, instanced
 * trees and flags, a few boxes for the clubhouse, and a golf ball. It draws only when something
 * moves (lib/three.ts), so a still course costs nothing.
 *
 * On the homepage the scroll tells it a story (mapController.arrival and .reveal): the ball
 * driven from the hero drops onto hole 1's green and rolls up by the pin, then the camera rises
 * from that green until the whole course lies below. Picking a hole flies to its tee.
 */
const setup: SceneSetup = ({ scene, camera, renderer }) => {
  const tier = pickTier(readTierEnvironment());
  const detail = tier === "high" ? "high" : "mid";
  // Haze and soft light hide the difference above 1.5, and the GPU is spared a third of the work.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, detail === "mid" ? 1.25 : 1.5));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  camera.near = 0.03;
  camera.far = 400;
  camera.updateProjectionMatrix();
  const motionAllowed = window.matchMedia(MOTION_OK).matches;

  const fog = new FogExp2(new Color(palette.skyHorizon), 1 / 175);
  scene.fog = fog;
  scene.add(new HemisphereLight(new Color(palette.skyLight), new Color("#3c4a22"), 0.95));
  const sun = new DirectionalLight(new Color(palette.sun), 2.4);
  sun.position.copy(SUN).multiplyScalar(50);
  scene.add(sun);

  const pins = placePins();
  const trees = plantTrees(detail === "high" ? 760 : 420, detail === "high" ? 520 : 260);
  const plan = paintPlan(detail === "high" ? 2048 : 1024, pins, trees);
  const ground = new Mesh(
    detail === "high" ? buildGround(420, 320) : buildGround(260, 200),
    groundShader(plan.surfaces, plan.details, fog),
  );
  const sky = buildSky();
  sky.frustumCulled = false;
  sky.renderOrder = -1;
  scene.add(sky, ground, buildTrees(trees), buildFlags(pins), buildClubhouse());

  const route = new Mesh(new TubeGeometry(), new MeshBasicMaterial({ color: ANTIQUE }));
  route.visible = false;
  scene.add(route);

  // The ball, lit by the scene's sun and reflecting a soft studio room.
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const { ball } = createGolfBall(renderer, detail);
  ball.scale.setScalar(BALL_RADIUS);
  const ballShadow = new Mesh(
    new PlaneGeometry(1, 1).rotateX(-Math.PI / 2),
    new MeshBasicMaterial({
      map: paintShadow(0.4),
      color: 0x0a1405,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: -4,
    }),
  );
  scene.add(ball, ballShadow);

  // The ball's drop onto hole 1: in from high over the fairway, two hops, and a roll up by the pin.
  const first = holePlans[0];
  const pin = new Vector3(pins[0].x, 0, pins[0].z);
  const greenCentre = new Vector3(first.green[0], 0, first.green[1]);
  const towardTee = new Vector3(first.tee[0] - first.green[0], 0, first.tee[1] - first.green[1]).normalize();
  const across = new Vector3(-towardTee.z, 0, towardTee.x);
  const touchdown = greenCentre.clone().addScaledVector(towardTee, 0.5).addScaledVector(across, 0.06);
  const rest = pin.clone().addScaledVector(towardTee, 0.13).addScaledVector(across, 0.05);
  const launch = touchdown.clone().addScaledVector(towardTee, 5).setY(groundHeight(touchdown.x, touchdown.z) + 4.2);
  const onGround = (point: Vector3) => groundHeight(point.x, point.z) + BALL_RADIUS;
  const ballPosition = new Vector3();
  const previousBall = new Vector3();
  const spinAxis = new Vector3();
  const spin = new Quaternion();
  const up = new Vector3(0, 1, 0);

  const placeBall = (arrival: number) => {
    const point = new Vector3();
    let height = 0;
    if (arrival < 0.6) {
      // Falling: steady across the ground, faster and faster down, as gravity has it.
      const k = arrival / 0.6;
      point.lerpVectors(launch, touchdown, k);
      const floor = onGround(point);
      point.y = floor + (launch.y - floor) * (1 - k * k);
      height = point.y - floor;
    } else {
      const k = (arrival - 0.6) / 0.4;
      // Along the green from touchdown to rest: two hops, then a slowing roll.
      const along = k < 0.3 ? (k / 0.3) * 0.42 : k < 0.5 ? 0.42 + ((k - 0.3) / 0.2) * 0.2 : 0.62 + (1 - (1 - (k - 0.5) / 0.5) ** 2) * 0.38;
      point.lerpVectors(touchdown, rest, along);
      if (k < 0.3) height = Math.sin((Math.PI * k) / 0.3) * 0.16;
      else if (k < 0.5) height = Math.sin((Math.PI * (k - 0.3)) / 0.2) * 0.045;
      point.y = onGround(point) + height;
    }
    ballPosition.copy(point);
    const floor = groundHeight(point.x, point.z);
    const lift = Math.max(0, point.y - BALL_RADIUS - floor);
    ballShadow.position.set(
      point.x + SHADOW_DIRECTION.x * lift * shadowLength * 0.9,
      floor + 0.002,
      point.z + SHADOW_DIRECTION.z * lift * shadowLength * 0.9,
    );
    const spread = BALL_RADIUS * (2.2 + lift * 6);
    ballShadow.scale.set(spread * (1 + 0.9 * Math.min(1, lift * 4)), 1, spread);
    ballShadow.rotation.y = -Math.atan2(SHADOW_DIRECTION.z, SHADOW_DIRECTION.x);
    (ballShadow.material as MeshBasicMaterial).opacity = 0.8 / (1 + lift * 5);
    ballShadow.visible = lift < 2.5;
    return height;
  };

  const anchors = new Map<string, Vector3>();
  holePlans.forEach((plan, index) => {
    const { x, z } = pins[index];
    anchors.set(`hole-${plan.number}`, new Vector3(x, groundHeight(x, z) + FLAG_HEIGHT + 0.22, z));
  });
  for (const landmark of landmarks) {
    anchors.set(landmark.id, new Vector3(landmark.x, groundHeight(landmark.x, landmark.z) + 0.8, landmark.z));
  }

  const overview = (): Pose => {
    // The course is wider than it is deep, so on an upright phone it's seen from the side,
    // low enough that the country beyond it and the hills on the horizon come into view.
    if (camera.aspect < 1) {
      const distance = (30 / (0.83 * camera.aspect)) * (mapController.copyOver ? 1.15 : 1);
      return { position: new Vector3(distance * 0.72, distance * 0.62, 2), look: new Vector3(-2, 0, 0) };
    }
    // Pull back on squarer screens, so the whole course still fits.
    const pullBack = Math.max(1, 1.75 / camera.aspect);
    return { position: new Vector3(0, 24 * pullBack, 33 * pullBack), look: new Vector3(0, 0, -2) };
  };

  // Close on hole 1's green, from the fairway, where the ball comes down.
  const landing = (): Pose => {
    const floor = groundHeight(touchdown.x, touchdown.z);
    const position = greenCentre
      .clone()
      .addScaledVector(towardTee, camera.aspect < 1 ? 2.9 : 2.7)
      .addScaledVector(across, camera.aspect < 1 ? 0.25 : 0.6)
      .setY(floor + (camera.aspect < 1 ? 2 : 1.65));
    const look = pin.clone().lerp(touchdown, 0.45).setY(floor + 0.04);
    return { position, look };
  };

  const story = (): Pose => {
    const near = landing();
    const far = overview();
    const t = easeInOut(mapController.reveal);
    const position = near.position.lerp(far.position, t);
    // The rise swings wide rather than backing straight out.
    position.y += Math.sin(Math.PI * t) * 3;
    return { position, look: near.look.lerp(far.look, t) };
  };

  // On wider screens the copy sits on the left, so the course is framed to its right; on
  // narrower ones the copy runs across the top, so the course is framed below it.
  let framed = "";
  const centreBesidePanel = (width: number, height: number) => {
    const key = `${width}x${height}:${mapController.copyOver}`;
    if (key === framed) return;
    framed = key;
    if (width >= PANEL_BREAKPOINT) camera.setViewOffset(width, height, -width * 0.07, 0, width, height);
    else if (mapController.copyOver) camera.setViewOffset(width, height, 0, -height * 0.15, width, height);
    else camera.clearViewOffset();
  };

  const from: Pose = story();
  let to: Pose = story();
  const flight = { progress: 1, route: 0 };
  const look = from.look.clone();
  let flightTween: gsap.core.Tween | undefined;
  let routeTween: gsap.core.Tween | undefined;

  const flyTo = (hole: number | null) => {
    const plan = holePlans.find((candidate) => candidate.number === hole);
    from.position.copy(camera.position);
    from.look.copy(look);
    to = plan ? holePose(plan) : story();

    route.visible = Boolean(plan);
    if (plan) {
      route.geometry.dispose();
      route.geometry = holeRouteGeometry(plan);
    }

    flightTween?.kill();
    routeTween?.kill();
    flight.progress = motionAllowed ? 0 : 1;
    flight.route = motionAllowed ? 0 : 1;
    if (!motionAllowed) return;

    flightTween = gsap.to(flight, { progress: 1, duration: 2.2, ease: "power3.inOut" });
    routeTween = gsap.to(flight, { route: 1, duration: 1.6, delay: 0.9, ease: "power2.inOut" });
  };
  mapController.flyTo = flyTo;
  if (mapController.selected !== null) flyTo(mapController.selected);

  // The camera leans a little towards the pointer, eased so it drifts rather than jerks.
  const pointer = { x: 0, y: 0 };
  const leaning = { x: 0, y: 0 };
  const onPointerMove = (event: PointerEvent) => {
    pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
    pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
  };
  if (motionAllowed) window.addEventListener("pointermove", onPointerMove, { passive: true });

  const projected = new Vector3();
  const position = new Vector3();
  let signature = "";

  const frame = (_time: number, deltaMs: number) => {
    if (mapController.selected === null) to = story();

    position.lerpVectors(from.position, to.position, flight.progress);
    // Every flight lifts up and swoops down rather than sliding across the ground.
    position.y += Math.sin(Math.PI * flight.progress) * 4;
    look.lerpVectors(from.look, to.look, flight.progress);

    const ease = 1 - Math.exp(-deltaMs / 260);
    leaning.x += (pointer.x - leaning.x) * ease;
    leaning.y += (pointer.y - leaning.y) * ease;
    if (Math.abs(pointer.x - leaning.x) < 0.001) leaning.x = pointer.x;
    if (Math.abs(pointer.y - leaning.y) < 0.001) leaning.y = pointer.y;
    // Less lean close to the ground, where it would swing the view about.
    const reach = Math.min(1, position.distanceTo(look) / 12);
    position.x += leaning.x * 0.45 * reach;
    position.y -= leaning.y * 0.22 * reach;
    camera.position.copy(position);
    camera.lookAt(look);
    sky.position.copy(camera.position);

    route.geometry.setDrawRange(0, Math.floor((route.geometry.index?.count ?? 0) * flight.route));

    const arrival = mapController.arrival;
    previousBall.copy(ballPosition);
    const height = placeBall(arrival);
    ball.visible = arrival > 0.02;
    // Spin by distance: rolling on the ground, backspin in the air.
    const moved = previousBall.distanceTo(ballPosition);
    if (moved > 0 && moved < 1) {
      spinAxis.subVectors(ballPosition, previousBall).setY(0);
      if (spinAxis.lengthSq() > 0) {
        spinAxis.cross(up).normalize().negate();
        spin.setFromAxisAngle(spinAxis, ((height > 0.002 ? -0.5 : 1) * moved) / BALL_RADIUS);
        ball.quaternion.premultiply(spin);
      }
    }
    ball.position.copy(ballPosition);

    // The hole numbers and landmarks wait until the course opens out below.
    const layer = mapController.labelLayer;
    const labelsShown = mapController.selected !== null ? 1 : smoothstep(0.55, 0.9, mapController.reveal);
    if (layer) {
      layer.style.opacity = labelsShown.toFixed(3);
      layer.style.visibility = labelsShown < 0.02 ? "hidden" : "";
    }

    const { clientWidth: width, clientHeight: height2 } = renderer.domElement;
    centreBesidePanel(width, height2);

    const next = [
      camera.position.x,
      camera.position.y,
      camera.position.z,
      look.x,
      look.y,
      look.z,
      ballPosition.x,
      ballPosition.y,
      ballPosition.z,
      flight.route,
      labelsShown,
      width,
      height2,
    ]
      .map((value) => value.toFixed(4))
      .join();
    if (next === signature) return false;
    signature = next;

    camera.updateMatrixWorld();
    for (const [id, anchor] of anchors) {
      const label = mapController.labels.get(id);
      if (!label) continue;
      projected.copy(anchor).project(camera);
      const onScreen = projected.z < 1 && Math.abs(projected.x) < 0.98 && Math.abs(projected.y) < 0.98;
      label.style.visibility = onScreen ? "visible" : "hidden";
      if (onScreen) {
        const x = (projected.x * 0.5 + 0.5) * width;
        const y = (-projected.y * 0.5 + 0.5) * height2;
        label.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      }
    }
    return true;
  };

  return {
    frame,
    dispose: () => {
      window.removeEventListener("pointermove", onPointerMove);
      flightTween?.kill();
      routeTween?.kill();
      mapController.flyTo = null;
      pmrem.dispose();
      const layer = mapController.labelLayer;
      if (layer) {
        layer.style.opacity = "";
        layer.style.visibility = "";
      }
    },
  };
};

export default setup;
