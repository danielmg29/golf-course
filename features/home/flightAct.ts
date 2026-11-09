import {
  Color,
  DirectionalLight,
  EquirectangularReflectionMapping,
  Group,
  HemisphereLight,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  type MeshPhysicalMaterial,
  NeutralToneMapping,
  PlaneGeometry,
  PMREMGenerator,
  Quaternion,
  type Texture,
  Vector3,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";
import { disposeObject } from "@/lib/world/dispose";
import { createGolfBall, paintShadow } from "@/lib/world/golfBall";
import type { Act } from "@/lib/world/runtime";
import { world } from "@/lib/world/store";

// Each photograph has its own sun, and the ball takes the light of the one it's over.
// The aerial hero is a late summer afternoon: the sun is high on the left, so tree shadows fall
// down and to the right, and the grass throws green light back up. The land is golden hour:
// the sun is low behind the camera, warm, and the bright field lights the ball from below.
const AERIAL = {
  key: new Color("#ffe2b6"),
  keyIntensity: 2.6,
  from: new Vector3(-0.8, 0.95, 0.85),
  sky: new Color("#dfe9f1"),
  ground: new Color("#4d7a2a"),
  ambient: 0.65,
  shade: new Color("#03100a"),
  tint: new Color("#f3f1ea"),
  veil: new Color("#102f25"),
};
const LAND = {
  key: new Color("#ffc47e"),
  keyIntensity: 2.9,
  from: new Vector3(-0.32, 0.3, 1),
  sky: new Color("#b9cede"),
  ground: new Color("#8ab83e"),
  ambient: 0.85,
  shade: new Color("#0d2103"),
  tint: new Color("#f4e2c4"),
  veil: new Color("#dcdfd2"),
};

const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount;

/**
 * The homepage's drive: one photoreal ball, hit from the tee in the hero, landing in the land
 * photograph and rolling along its horizon. features/home/BallFlight.tsx works out where it is,
 * in screen pixels, from the page; this draws it. The camera is set so one world unit is one CSS
 * pixel at the page's depth, and the ball spins by the distance it travels.
 */
const flightAct: Act = ({ scene, camera, renderer, tier }) => {
  const previousToneMapping = renderer.toneMapping;
  renderer.toneMapping = NeutralToneMapping;

  const root = new Group();
  scene.add(root);

  // Reflections: a generated room at once, then on the high tier the Poly Haven dusk sky
  // (CC0, public/world/dusk.hdr), which matches both photographs' warm low sun.
  const pmrem = new PMREMGenerator(renderer);
  const room = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  let sky: Texture = room;
  let disposed = false;
  let needsFrame = true;
  scene.environment = room;
  if (tier === "high") {
    new HDRLoader()
      .loadAsync("/world/dusk.hdr")
      .then((texture) => {
        texture.mapping = EquirectangularReflectionMapping;
        const environment = pmrem.fromEquirectangular(texture).texture;
        texture.dispose();
        if (disposed) {
          environment.dispose();
          return;
        }
        sky = environment;
        scene.environment = sky;
        needsFrame = true;
      })
      .catch((error: unknown) => console.error(error));
  }

  const key = new DirectionalLight(AERIAL.key, AERIAL.keyIntensity);
  const fill = new HemisphereLight(AERIAL.sky, AERIAL.ground, AERIAL.ambient);
  root.add(key, key.target, fill);

  const { ball, dimples } = createGolfBall(renderer, tier);
  const surface = ball.material as MeshPhysicalMaterial;
  surface.envMapIntensity = 0.75;

  // Two shadows, both tinted by the ground they fall on: the cast shadow, long and soft, and the
  // small dark contact where the ball presses into the grass. They are drawn first and write no
  // depth, so they sit at the ball's own depth (no parallax) and the ball always covers them.
  const castMaterial = new MeshBasicMaterial({ map: paintShadow(0.4), color: AERIAL.shade, transparent: true, depthWrite: false });
  const contactMaterial = new MeshBasicMaterial({ map: paintShadow(0.2), color: 0x020602, transparent: true, depthWrite: false });
  const cast = new Mesh(new PlaneGeometry(1, 1), castMaterial);
  const contact = new Mesh(new PlaneGeometry(1, 1), contactMaterial);
  cast.renderOrder = -2;
  contact.renderOrder = -1;
  root.add(cast, contact, ball);

  const canvas = renderer.domElement;
  let width = 1;
  let height = 1;
  let clipped = "";
  let lastTravel: number | null = null;
  let signature = "";
  const axis = new Vector3();
  const turn = new Quaternion();
  const veilColor = new Color();

  return {
    update() {
      const f = world.flight;

      // Keeps the ball inside a photograph: the canvas is clipped to its rectangle.
      const clip = f.visible && f.clip
        ? `inset(${Math.max(0, f.clip.top)}px ${Math.max(0, width - f.clip.right)}px ${Math.max(0, height - f.clip.bottom)}px ${Math.max(0, f.clip.left)}px)`
        : "";
      if (clip !== clipped) {
        canvas.style.clipPath = clip;
        clipped = clip;
      }

      root.visible = f.visible;
      if (!f.visible) {
        lastTravel = null;
        const changed = signature !== "hidden";
        signature = "hidden";
        return changed;
      }

      // Spin by distance: one radian for every radius travelled. In the air it's backspin about
      // the axis across its flight; along the ground, seen from the side, it rolls about the axis
      // pointing into the screen.
      if (lastTravel !== null) {
        const travelled = f.travel - lastTravel;
        if (travelled !== 0) {
          if (f.rolling) axis.set(0, 0, f.dirX >= 0 ? -1 : 1);
          else axis.set(f.dirY, f.dirX, 0);
          if (axis.lengthSq() > 0) {
            axis.normalize();
            turn.setFromAxisAngle(axis, ((f.rolling ? 1 : -0.6) * travelled) / f.radius);
            ball.quaternion.premultiply(turn);
          }
        }
      }
      lastTravel = f.travel;

      // Screen pixels to world: the origin at the viewport's centre, y up.
      const x = f.x - width / 2;
      const y = height / 2 - f.y;
      ball.position.set(x, y, 0);
      ball.scale.setScalar(f.radius);

      const l = f.light;
      key.color.lerpColors(AERIAL.key, LAND.key, l);
      key.intensity = lerp(AERIAL.keyIntensity, LAND.keyIntensity, l);
      key.position.lerpVectors(AERIAL.from, LAND.from, l).normalize().multiplyScalar(1000).add(ball.position);
      key.target.position.copy(ball.position);
      fill.color.lerpColors(AERIAL.sky, LAND.sky, l);
      fill.groundColor.lerpColors(AERIAL.ground, LAND.ground, l);
      fill.intensity = lerp(AERIAL.ambient, LAND.ambient, l);

      // The photograph's grading over the ball: colour * (1 - veil) + veil colour * veil, the same
      // blend the hero's overlay applies to the picture under it.
      veilColor.lerpColors(AERIAL.veil, LAND.veil, l);
      surface.color.lerpColors(AERIAL.tint, LAND.tint, l).multiplyScalar(1 - f.veil);
      surface.emissive.copy(veilColor).multiplyScalar(f.veil);
      surface.envMapIntensity = 0.75 * (1 - f.veil);

      const s = f.shadow;
      cast.visible = s.opacity > 0.002;
      cast.position.set(s.x - width / 2, height / 2 - s.y, 0);
      cast.rotation.z = -s.angle;
      // The rim fades out a little past the shadow's visible size.
      cast.scale.set(s.width * 2.4, s.height * 2.4, 1);
      castMaterial.color.lerpColors(AERIAL.shade, LAND.shade, l);
      // Under the hero's overlay a shadow loses contrast with everything else in the picture.
      castMaterial.opacity = s.opacity * (1 - f.veil);

      // Seen from above (the hero) the contact is a dark rim showing past the ball on its shaded
      // side; seen from the side (the land) it is a thin line of shade along the ball's foot.
      contact.visible = f.contact > 0.002;
      contact.position.set(
        x + f.radius * lerp(0.2, 0, l),
        y - f.radius * lerp(0.32, 0.94, l),
        0,
      );
      contact.scale.set(f.radius * lerp(1.15, 1.35, l) * 2.6, f.radius * lerp(1.05, 0.26, l) * 2.6, 1);
      contactMaterial.opacity = f.contact * 0.9 * (1 - f.veil);

      const next = [f.x, f.y, f.radius, f.travel, l, f.veil, f.contact, s.x, s.y, s.width, s.height, s.opacity]
        .map((value) => value.toFixed(2))
        .join();
      const changed = next !== signature || needsFrame;
      signature = next;
      needsFrame = false;
      return changed;
    },
    resize(nextWidth, nextHeight) {
      width = nextWidth;
      height = nextHeight;
      camera.fov = 30;
      const distance = height / 2 / Math.tan(MathUtils.degToRad(camera.fov / 2));
      camera.near = distance * 0.1;
      camera.far = distance * 3;
      camera.position.set(0, 0, distance);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
      needsFrame = true;
    },
    dispose() {
      disposed = true;
      canvas.style.clipPath = "";
      disposeObject(root);
      dimples.dispose();
      room.dispose();
      if (sky !== room) sky.dispose();
      pmrem.dispose();
      scene.environment = null;
      renderer.toneMapping = previousToneMapping;
    },
  };
};

export default flightAct;
