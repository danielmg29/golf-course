import {
  ACESFilmicToneMapping,
  BackSide,
  BufferGeometry,
  CanvasTexture,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  Float32BufferAttribute,
  Fog,
  HemisphereLight,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Quaternion,
  RingGeometry,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { gsap } from "@/lib/motion";
import { createGolfBall, paintShadow } from "@/lib/world/golfBall";
import { paintNoise, seeded } from "@/lib/world/noise";

// Real sizes, in metres: a ball is 42.7 mm across and the cup 108 mm.
const BALL = 0.02135;
const CUP = 0.054;
// The putt starts up the green and breaks right to left into the cup, which sits at the origin.
const START = new Vector3(0.62, 0, -5.4);
const BEND = new Vector3(0.82, 0, -2.3);
// Golden hour, the sun low behind the ball: it is rimmed with light and its shadow runs to you.
const SUN = new Vector3(-0.55, 0.32, -0.77).normalize();
const HAZE = new Color("#b7c0a4");

const linear = (hex: string) => {
  const { r, g, b } = new Color(hex);
  return `vec3(${r.toFixed(4)}, ${g.toFixed(4)}, ${b.toFixed(4)})`;
};

function greenMaterial(fog: Fog) {
  return new ShaderMaterial({
    uniforms: {
      noiseMap: { value: paintNoise() },
      sunDirection: { value: SUN },
      fogColor: { value: fog.color },
      fogNear: { value: fog.near },
      fogFar: { value: fog.far },
    },
    vertexShader: /* glsl */ `
      varying vec3 vWorld;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorld = world.xyz;
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D noiseMap;
      uniform vec3 sunDirection;
      uniform vec3 fogColor;
      uniform float fogNear;
      uniform float fogFar;
      varying vec3 vWorld;
      const vec3 GRASS = ${linear("#5b8a3c")};
      const vec3 SUN = ${linear("#ffd49a")};
      const vec3 SKY = ${linear("#b4c7d6")};
      void main() {
        vec2 p = vWorld.xz;
        float fromCup = length(p);
        // The cup is a hole in the green.
        if (fromCup < ${CUP.toFixed(4)}) discard;
        float grain = texture2D(noiseMap, p * 3.0).b;
        float clumps = texture2D(noiseMap, p * 0.35).r;
        float patches = texture2D(noiseMap, p * 0.05).g;
        // Mown in bands running up the line of the putt, light and dark as the grass lies.
        float band = smoothstep(0.42, 0.58, fract(p.x / 1.8 + 0.25)) * smoothstep(0.92, 0.76, fract(p.x / 1.8 + 0.25));
        vec3 color = GRASS * (0.86 + 0.1 * band) * (0.9 + 0.2 * clumps) * (0.94 + 0.12 * patches);
        color *= 0.86 + 0.28 * grain;
        // The lip of the cup is worn a little bare.
        color *= mix(0.7, 1.0, smoothstep(${CUP.toFixed(4)}, ${(CUP + 0.012).toFixed(4)}, fromCup));
        vec3 light = SKY * 0.55 + SUN * max(sunDirection.y, 0.0) * 1.6;
        vec3 shaded = color * light;
        float range = length(cameraPosition - vWorld);
        shaded = mix(shaded, fogColor, smoothstep(fogNear, fogFar, range));
        gl_FragColor = vec4(shaded, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
}

function skyMaterial() {
  return new ShaderMaterial({
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
      const vec3 HORIZON = ${linear("#d9c9a4")};
      const vec3 ZENITH = ${linear("#8fa9bd")};
      const vec3 SUN = ${linear("#ffd08a")};
      void main() {
        vec3 d = normalize(vDirection);
        vec3 color = mix(HORIZON, ZENITH, pow(smoothstep(0.0, 0.5, max(d.y, 0.0)), 0.7));
        float toSun = max(dot(d, sunDirection), 0.0);
        color += SUN * (pow(toSun, 5.0) * 0.35 + pow(toSun, 60.0) * 0.6 + pow(toSun, 900.0) * 5.0);
        gl_FragColor = vec4(color, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
    side: BackSide,
    depthWrite: false,
  });
}

/** A far line of trees, soft and blue with distance, as a strip of canopies on a cylinder. */
function treeLine() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 96;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("No 2D canvas available.");
  const random = seeded(31);
  // Far trees, blue-green with the air between them: one soft silhouette of overlapping crowns,
  // a little out of focus, as a lens this close to the ground would see them.
  context.filter = "blur(2.5px)";
  context.fillStyle = "rgb(118, 136, 124)";
  context.fillRect(0, 70, 1024, 26);
  for (let index = 0; index < 520; index += 1) {
    const x = random() * 1024;
    const crown = 8 + random() * 16 + (Math.sin(x / 90) + 1) * 6;
    const shade = 112 + random() * 22;
    context.fillStyle = `rgb(${shade}, ${shade + 16}, ${shade + 8})`;
    context.beginPath();
    context.ellipse(x, 78 - crown * 0.7, crown, crown * 0.8, 0, 0, Math.PI * 2);
    context.fill();
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  const strip = new Mesh(
    new CylinderGeometry(70, 70, 4.2, 64, 1, true, Math.PI * 0.55, Math.PI * 0.9),
    new MeshBasicMaterial({ map: texture, transparent: true, side: BackSide, fog: false, opacity: 0.92 }),
  );
  strip.position.y = 1.5;
  return strip;
}

/** The fringe the camera lies in, and the green's grain beyond it: thin blades, darker at the root. */
function grass(count: number) {
  const blade = new BufferGeometry();
  // A tapered, slightly bent blade: two quads and a tip.
  blade.setAttribute(
    "position",
    new Float32BufferAttribute([-0.5, 0, 0, 0.5, 0, 0, -0.38, 0.45, 0.06, 0.38, 0.45, 0.06, 0, 1, 0.2], 3),
  );
  blade.setAttribute("color", new Float32BufferAttribute([0.12, 0.22, 0.07, 0.12, 0.22, 0.07, 0.24, 0.42, 0.12, 0.24, 0.42, 0.12, 0.3, 0.5, 0.15], 3));
  blade.setIndex([0, 1, 2, 2, 1, 3, 2, 3, 4]);
  blade.computeVertexNormals();
  const mesh = new InstancedMesh(
    blade,
    // Thin blades catch the low sun from behind; kept dark so they read as turf, not as glare.
    new MeshLambertMaterial({ vertexColors: true, side: DoubleSide, color: new Color(0.5, 0.52, 0.46) }),
    count,
  );
  const random = seeded(9);
  const dummy = new Object3D();
  const tint = new Color();
  let placed = 0;
  while (placed < count) {
    const x = (random() - 0.5) * 0.9;
    const z = -0.7 + random() * 1.1;
    if (Math.hypot(x, z) < CUP + 0.006) continue;
    // Longer in the fringe at the camera's feet, short on the putting surface.
    const fringe = z > 0.16;
    const tall = fringe ? 0.012 + random() * 0.012 : 0.0035 + random() * 0.004;
    dummy.position.set(x, 0, z);
    dummy.rotation.set((random() - 0.5) * 0.5, random() * Math.PI * 2, (random() - 0.5) * 0.5);
    dummy.scale.set(0.0011 + random() * 0.0006, tall, 0.0011);
    dummy.updateMatrix();
    mesh.setMatrixAt(placed, dummy.matrix);
    const lift = 0.8 + random() * 0.3;
    mesh.setColorAt(placed, tint.setRGB(lift, lift, lift));
    placed += 1;
  }
  return mesh;
}

const easeOut = (t: number) => 1 - (1 - t) ** 3;

/**
 * The loading screen's putt (components/feedback/Loader.tsx): a low camera behind the cup,
 * looking back up the line, and a photoreal ball rolling towards it through the grass.
 * `progress()` runs from 0 to 1; at the end the ball drops. The scene stays mounted between
 * putts and draws only while `active()` says one is playing. Returns a teardown.
 */
export function mountPutt(container: HTMLElement, progress: () => number, active: () => boolean = () => true) {
  const renderer = new WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.domElement.className = "block size-full";
  container.append(renderer.domElement);

  const scene = new Scene();
  const fog = new Fog(HAZE, 3, 70);
  scene.fog = fog;
  const camera = new PerspectiveCamera(30, 1, 0.004, 200);
  camera.position.set(0.03, 0.07, 0.4);
  camera.lookAt(-0.04, 0.012, -2.4);

  scene.add(new HemisphereLight(new Color("#b8cde0"), new Color("#4d6b2a"), 0.9));
  const sun = new DirectionalLight(new Color("#ffd49a"), 2.8);
  sun.position.copy(SUN).multiplyScalar(10);
  scene.add(sun);

  const ground = new Mesh(new PlaneGeometry(400, 400).rotateX(-Math.PI / 2), greenMaterial(fog));
  const sky = new Mesh(new SphereGeometry(120, 32, 16), skyMaterial());
  sky.renderOrder = -1;
  sky.frustumCulled = false;
  scene.add(sky, treeLine(), ground, grass(7000));

  // The cup: a white liner at the top, then dark.
  // Cut turf and soil at the top of the wall, then the white liner a little down, then dark.
  const soil = new Mesh(new CylinderGeometry(CUP, CUP, 0.011, 48, 1, true), new MeshLambertMaterial({ color: 0x2a1e12, side: BackSide }));
  soil.position.y = -0.0055;
  const liner = new Mesh(new CylinderGeometry(CUP, CUP, 0.014, 48, 1, true), new MeshLambertMaterial({ color: 0xdcd6c6, side: BackSide }));
  liner.position.y = -0.018;
  // The lip: a thin lit edge of cut turf round the hole.
  const lip = new Mesh(new RingGeometry(CUP, CUP + 0.0045, 64).rotateX(-Math.PI / 2), new MeshLambertMaterial({ color: 0x5f7a34 }));
  lip.position.y = 0.0004;
  const well = new Mesh(new CylinderGeometry(CUP, CUP, 0.1, 48, 1, true), new MeshLambertMaterial({ color: 0x1c1a14, side: BackSide }));
  well.position.y = -0.075;
  scene.add(soil, liner, well, lip);

  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const { ball, dimples } = createGolfBall(renderer, "mid");
  ball.scale.setScalar(BALL);
  const shadow = new Mesh(
    new PlaneGeometry(1, 1).rotateX(-Math.PI / 2),
    new MeshBasicMaterial({ map: paintShadow(0.2), color: 0x10200a, transparent: true, depthWrite: false, opacity: 0.6 }),
  );
  scene.add(ball, shadow);

  const point = new Vector3();
  const last = new Vector3().copy(START);
  const axis = new Vector3();
  const turn = new Quaternion();
  const up = new Vector3(0, 1, 0);

  let lateral = 1;
  const place = (value: number) => {
    // Rolling, slowing as a putt does, until it reaches the cup at 0.94; then it drops.
    const roll = easeOut(Math.min(1, value / 0.94));
    const u = 1 - roll;
    point.set(
      (u * u * START.x + 2 * u * roll * BEND.x) * lateral,
      0,
      u * u * START.z + 2 * u * roll * BEND.z,
    );
    const drop = Math.max(0, (value - 0.94) / 0.06);
    point.y = BALL - drop * BALL * 2.6;
    ball.position.copy(point);
    const moved = last.distanceTo(point);
    if (moved > 0 && moved < 1) {
      axis.subVectors(point, last).setY(0);
      if (axis.lengthSq() > 0) {
        axis.cross(up).normalize().negate();
        turn.setFromAxisAngle(axis, moved / BALL);
        ball.quaternion.premultiply(turn);
      }
    }
    last.copy(point);
    // The shadow falls towards the camera, long in the low sun, and is gone once the ball drops.
    shadow.position.set(point.x - SUN.x * BALL * 2.2, 0.0004, point.z - SUN.z * BALL * 2.2);
    shadow.scale.set(BALL * 3.6, 1, BALL * 5.5);
    shadow.rotation.y = Math.atan2(-SUN.x, -SUN.z);
    shadow.visible = drop < 0.4;
  };

  const resize = () => {
    const { clientWidth: width, clientHeight: height } = container;
    if (!width || !height) return;
    camera.aspect = width / height;
    // On an upright phone the lens widens a touch, so the cup stays in frame.
    camera.fov = camera.aspect < 1 ? 46 : 30;
    lateral = Math.min(1, camera.aspect * 0.9);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  };
  const observer = new ResizeObserver(resize);
  observer.observe(container);
  resize();

  const tick = () => {
    if (!active()) return;
    place(progress());
    sky.position.copy(camera.position);
    renderer.render(scene, camera);
  };
  gsap.ticker.add(tick);

  return () => {
    gsap.ticker.remove(tick);
    observer.disconnect();
    dimples.dispose();
    pmrem.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  };
}
