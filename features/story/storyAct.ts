import { AdditiveBlending, Color, LineSegments, Matrix4, Object3D, ShaderMaterial, Vector3 } from "three";
import { dollyDistance, FLAT_FOV, fovFor, orbitOffset, worldRadiusFor } from "@/features/story/camera";
import { buildMorphGrid } from "@/features/story/morphGrid";
import { disposeObject } from "@/lib/world/dispose";
import type { Act } from "@/lib/world/runtime";
import { world } from "@/lib/world/store";

// The grid's columns and rows. Phones get fewer: lines cost fill rate, and on a small screen
// a dense cage blurs into a solid disc.
const GRID = { high: [52, 34], mid: [40, 26] } as const;

// Everything after the drop happens round this point: the green, the axis, the spiral, the ring.
const GROUND_Y = -2;
const TERRAIN = { width: 16, depth: 11, heightScale: 0.35 };

const vertexShader = /* glsl */ `
  #define PI 3.141592653589793
  uniform float uMorph;
  uniform mat4 uBall;
  uniform float uRadius;
  uniform float uRelief;
  uniform float uGround;
  uniform vec3 uTerrain;
  uniform float uAxisLength;
  uniform float uRingRadius;
  uniform float uSpiralHeight;
  uniform float uSpiralTurns;
  uniform float uSpin;
  uniform float uRows;
  uniform float uPileFade;
  attribute vec2 aUV;
  attribute float aHeight;
  varying float vAlpha;

  // The progress of step k (0 to 1), eased. Phase 3 staggers this per vertex.
  float stepT(float k) {
    float t = clamp(uMorph - k, 0.0, 1.0);
    return t * t * (3.0 - 2.0 * t);
  }

  // A goblet's silhouette from foot (0) to rim (1), scaled so the rim is 1.
  float goblet(float y) {
    return (0.14 + (1.0 - smoothstep(0.0, 0.14, y)) * 0.32 + smoothstep(0.42, 0.96, y) * 0.62) / 0.76;
  }

  void main() {
    float theta = aUV.x * 2.0 * PI;
    float phi = aUV.y * PI;
    vec3 direction = vec3(sin(phi) * cos(theta), cos(phi), sin(phi) * sin(theta));

    // The five shapes, all from the same grid coordinate.
    vec3 ball = (uBall * vec4(direction * uRadius * (1.0 + aHeight * uRelief), 1.0)).xyz;
    vec3 terrain = vec3((aUV.x - 0.5) * uTerrain.x, uGround + aHeight * uTerrain.z, (aUV.y - 0.5) * uTerrain.y);
    vec3 axis = vec3((aUV.x - 0.5) * uAxisLength, uGround, 0.0);
    // Alternate rows wind in opposite directions, which crosses into a cut-crystal lattice.
    float row = floor(aUV.y * (uRows - 1.0) + 0.5);
    float winding = mod(row, 2.0) * 2.0 - 1.0;
    float angle = aUV.x * uSpiralTurns * 2.0 * PI * winding + aUV.y * 2.0 * PI + uSpin;
    float rim = goblet(aUV.x) * uRingRadius;
    vec3 spiral = vec3(cos(angle) * rim, uGround + (aUV.x - 0.5) * uSpiralHeight, sin(angle) * rim);
    // Every row on the same circle at the same angles, so the lines joining rows shrink to
    // nothing instead of cutting across the ring behind the call to action.
    float around = aUV.x * 2.0 * PI + uSpin;
    vec3 ring = vec3(cos(around) * uRingRadius, uGround, sin(around) * uRingRadius);

    float t0 = stepT(0.0);
    float t1 = stepT(1.0);
    float t2 = stepT(2.0);
    float t3 = stepT(3.0);
    vec3 p = mix(ball, terrain, t0);
    // Terrain to axis in two moves: flatten first, then pull every row onto the line.
    p.y = mix(p.y, axis.y, smoothstep(0.0, 0.55, t1));
    p = mix(p, axis, smoothstep(0.35, 1.0, t1));
    p = mix(p, spiral, t2);
    p = mix(p, ring, t3);

    vec4 view = viewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * view;

    // On the ball the far side is dimmer, so the cage reads as a solid form, and lines thin out
    // at the poles, where every meridian meets. Both give way as the ball changes shape.
    vec3 normal = normalize(mat3(viewMatrix) * mat3(uBall) * direction);
    float facing = dot(normal, normalize(-view.xyz));
    float onBall = mix(0.14, 1.0, smoothstep(-0.3, 0.6, facing)) * smoothstep(0.04, 0.3, sin(phi));
    // Every row lands on the same line in the axis and the ring; thin each one so they don't burn out.
    float piled = clamp(t1 * (1.0 - t2) + t3, 0.0, 1.0);
    vAlpha = mix(onBall, 1.0, t0) * mix(1.0, uPileFade, piled);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uGold;
  uniform float uOpacity;
  varying float vAlpha;

  void main() {
    gl_FragColor = vec4(uGold, uOpacity * vAlpha);
    #include <colorspace_fragment>
  }
`;

const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount;

/**
 * The homepage story, drawn as one grid of gold lines that the scroll timeline reshapes:
 * a ball wrapped in the course's relief, which drops onto the green and becomes the terrain,
 * then one axis line, a cut-crystal spiral, and a ring around the call to action. This is
 * the Phase 2 version: plain blends between shapes. Phase 3 staggers and scatters them, and
 * Phase 4 puts the glass ball inside the cage.
 */
const storyAct: Act = ({ scene, camera, tier }) => {
  const [columns, rows] = GRID[tier];
  const uniforms = {
    uMorph: { value: 0 },
    uBall: { value: new Matrix4() },
    uRadius: { value: 1 },
    // Enough to feel the ground under the lines, not so much that the ball stops being round.
    uRelief: { value: 0.016 },
    uGround: { value: GROUND_Y },
    uTerrain: { value: new Vector3(TERRAIN.width, TERRAIN.depth, TERRAIN.heightScale) },
    uAxisLength: { value: 12 },
    uRingRadius: { value: 1.5 },
    uSpiralHeight: { value: 3.4 },
    uSpiralTurns: { value: 2.5 },
    uSpin: { value: 0 },
    uRows: { value: rows },
    uPileFade: { value: 4 / rows },
    uGold: { value: new Color("#d4af37") },
    uOpacity: { value: 0.36 },
  };
  const lines = new LineSegments(
    buildMorphGrid(columns, rows),
    new ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      // The gold on screen matches the CSS gold exactly.
      toneMapped: false,
    }),
  );
  scene.add(lines);

  // The ball's own frame: it floats, turns slowly and drops. The shader reads its matrix.
  const ball = new Object3D();
  ball.rotation.set(0.42, 0, -0.18);
  const target = new Vector3();
  let restY = 0;
  let viewportHeight = 1;

  return {
    update(time) {
      const { morph, drop, tilt, camera: rig, anchors } = world;

      ball.rotation.y = time * 0.05;
      ball.position.y = lerp(restY + Math.sin(time * 0.6) * 0.05, GROUND_Y + 0.4, drop);
      ball.updateMatrix();
      uniforms.uBall.value.copy(ball.matrix);
      uniforms.uMorph.value = morph;
      uniforms.uSpin.value = time * 0.25;

      // The DOM ring is measured by the story; the WebGL ring is sized to match it, as seen
      // by the final, fully flattened camera looking straight down.
      if (anchors.ringRadius > 0) {
        uniforms.uRingRadius.value = worldRadiusFor(
          anchors.ringRadius,
          viewportHeight,
          dollyDistance(FLAT_FOV),
          FLAT_FOV,
        );
      }

      camera.fov = fovFor(rig.flatten);
      const [x, y, z] = orbitOffset(rig.pitch + tilt, rig.orbit, dollyDistance(camera.fov));
      target.set(0, lerp(0, GROUND_Y, drop), 0);
      camera.position.set(target.x + x, target.y + y, target.z + z);
      camera.lookAt(target);
      camera.updateProjectionMatrix();
      return true;
    },
    resize(width, height) {
      viewportHeight = height;
      // Sized from the area the camera sees at the target's depth, so it sits the same on any screen.
      const visibleHeight = 2 * Math.tan((fovFor(0) / 2) * (Math.PI / 180)) * dollyDistance(fovFor(0));
      const visibleWidth = visibleHeight * (width / height);
      uniforms.uRadius.value = Math.min(visibleHeight * 0.29, visibleWidth * 0.4);
      uniforms.uAxisLength.value = visibleWidth * 1.15;
      restY = -visibleHeight * 0.04;
    },
    dispose() {
      disposeObject(lines);
    },
  };
};

export default storyAct;
