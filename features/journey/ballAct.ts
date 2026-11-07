import {
  CanvasTexture,
  Color,
  DirectionalLight,
  EquirectangularReflectionMapping,
  Group,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  NeutralToneMapping,
  ObjectSpaceNormalMap,
  PlaneGeometry,
  PMREMGenerator,
  Quaternion,
  SphereGeometry,
  type Texture,
  Vector3,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";
import { disposeObject } from "@/lib/world/dispose";
import { bakeDimples, paintPrint } from "@/lib/world/golfBall";
import type { Act } from "@/lib/world/runtime";
import { world } from "@/lib/world/store";

/** A soft round shadow, for where the ball touches the page. */
function paintShadow() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("No 2D canvas available.");
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(0,0,0,0.7)");
  gradient.addColorStop(0.45, "rgba(0,0,0,0.35)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  return new CanvasTexture(canvas);
}

const DAWN_LIGHT = new Color("#d6e4ea");
const DUSK_LIGHT = new Color("#ffb066");
const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount;

/**
 * The putt journey's ball: one photoreal golf ball, positioned in screen pixels by
 * features/journey/JourneyClient.tsx. It rolls by the distance it has travelled, so it turns
 * exactly as a real ball would, and drops into the cup at the end. The camera is set so one
 * world unit is one CSS pixel at the page's depth.
 */
const ballAct: Act = ({ scene, camera, renderer, tier }) => {
  const previousToneMapping = renderer.toneMapping;
  // Neutral keeps the white ball and the gold print true to their colours.
  renderer.toneMapping = NeutralToneMapping;

  const root = new Group();
  scene.add(root);

  // Light. A generated room first, so the ball is lit at once; on the high tier the Poly Haven
  // dawn and dusk skies (CC0, public/world) replace it once they arrive.
  const pmrem = new PMREMGenerator(renderer);
  const room = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  let dawn: Texture = room;
  let dusk: Texture = room;
  let disposed = false;
  let needsFrame = true;
  if (tier === "high") {
    const loader = new HDRLoader();
    const load = (url: string) =>
      loader.loadAsync(url).then((texture) => {
        texture.mapping = EquirectangularReflectionMapping;
        const environment = pmrem.fromEquirectangular(texture).texture;
        texture.dispose();
        return environment;
      });
    Promise.all([load("/world/dawn.hdr"), load("/world/dusk.hdr")])
      .then(([dawnSky, duskSky]) => {
        if (disposed) {
          dawnSky.dispose();
          duskSky.dispose();
          return;
        }
        dawn = dawnSky;
        dusk = duskSky;
        needsFrame = true;
      })
      .catch((error: unknown) => console.error(error));
  }

  const key = new DirectionalLight(DAWN_LIGHT, 2.4);
  root.add(key);

  const dimples = bakeDimples(renderer, tier === "high" ? 1024 : 512);
  const ball = new Mesh(
    new SphereGeometry(1, 96, 64),
    new MeshPhysicalMaterial({
      color: 0xffffff,
      map: paintPrint(),
      normalMap: dimples.texture,
      normalMapType: ObjectSpaceNormalMap,
      roughness: 0.32,
      metalness: 0,
      clearcoat: 0.5,
      clearcoatRoughness: 0.22,
      envMapIntensity: 1.1,
    }),
  );
  root.add(ball);

  const shadow = new Mesh(
    new PlaneGeometry(1, 1),
    new MeshBasicMaterial({ map: paintShadow(), transparent: true, depthWrite: false }),
  );
  root.add(shadow);

  let width = 1;
  let height = 1;
  let lastTravel: number | null = null;
  let signature = "";
  const axis = new Vector3();
  const turn = new Quaternion();

  return {
    update() {
      const b = world.ball;
      root.visible = b.visible;
      if (!b.visible) {
        const changed = signature !== "hidden";
        signature = "hidden";
        return changed;
      }

      // Roll: a ball turns one radian for every radius it travels, about the axis lying flat
      // on the page at right angles to its path. The page's normal faces the camera (+z).
      if (lastTravel !== null) {
        const travelled = b.travel - lastTravel;
        if (travelled !== 0) {
          axis.set(b.dirY, b.dirX, 0).normalize();
          turn.setFromAxisAngle(axis, travelled / b.radius);
          ball.quaternion.premultiply(turn);
        }
      }
      lastTravel = b.travel;

      // Screen pixels to world: origin at the viewport's centre, y up.
      const x = b.x - width / 2;
      const y = height / 2 - b.y;
      const sink = b.drop;
      ball.position.set(x, y, -sink * b.radius * 1.8);
      ball.scale.setScalar(b.radius * (1 - sink * 0.2));
      (ball.material as MeshPhysicalMaterial).color.setScalar(1 - sink * 0.75);

      // Daylight: a cool key from the upper left at dawn, a low amber one from the right at dusk.
      key.color.lerpColors(DAWN_LIGHT, DUSK_LIGHT, b.daylight);
      key.intensity = lerp(2.4, 3.1, b.daylight);
      key.position.set(lerp(-1, 1.2, b.daylight), lerp(1.3, -0.2, b.daylight), 1.4).multiplyScalar(1000);
      key.target.position.set(0, 0, 0);
      scene.environment = b.daylight < 0.55 ? dawn : dusk;

      // The shadow falls away from the light, and fades as the ball sinks.
      shadow.position.set(x - key.position.x * 0.00025 * b.radius, y - key.position.y * 0.00025 * b.radius - b.radius * 0.18, -b.radius * 1.2);
      shadow.scale.setScalar(b.radius * 2.6);
      (shadow.material as MeshBasicMaterial).opacity = 0.75 * (1 - sink);

      const next = [b.x, b.y, b.travel, b.radius, sink, b.daylight].map((value) => value.toFixed(2)).join();
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
      disposeObject(root);
      dimples.dispose();
      room.dispose();
      if (dawn !== room) dawn.dispose();
      if (dusk !== room) dusk.dispose();
      pmrem.dispose();
      scene.environment = null;
      renderer.toneMapping = previousToneMapping;
    },
  };
};

export default ballAct;
