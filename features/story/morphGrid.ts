import { BufferGeometry, Float32BufferAttribute, Sphere, Vector3 } from "three";
import { MAP_DEPTH, MAP_WIDTH, terrainHeight } from "@/features/hole/courseLayout";

/**
 * The grid every shape of the story is drawn from (see docs/next-move-roadmap.md, section 5).
 * Each vertex stores only its grid coordinate, the course's height there and a random seed;
 * the shaders turn that coordinate into the ball, the terrain, the axis, the spiral or the
 * ring. Lines join each vertex to its neighbours along both grid directions.
 */
export function buildMorphGrid(columns: number, rows: number) {
  const count = columns * rows;
  const uv = new Float32Array(count * 2);
  const height = new Float32Array(count);
  const seed = new Float32Array(count);
  // A small LCG, so the seeds are the same on every visit.
  let state = 18;
  const random = () => (state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 4294967296;

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const i = row * columns + column;
      const u = column / (columns - 1);
      const v = row / (rows - 1);
      uv[i * 2] = u;
      uv[i * 2 + 1] = v;
      height[i] = terrainHeight((u - 0.5) * MAP_WIDTH, (v - 0.5) * MAP_DEPTH);
      seed[i] = random();
    }
  }

  const index: number[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns - 1; column += 1) {
      index.push(row * columns + column, row * columns + column + 1);
    }
  }
  for (let row = 0; row < rows - 1; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      index.push(row * columns + column, (row + 1) * columns + column);
    }
  }

  const geometry = new BufferGeometry();
  // Three.js requires a position attribute; the shaders compute positions from aUV instead.
  geometry.setAttribute("position", new Float32BufferAttribute(new Float32Array(count * 3), 3));
  geometry.setAttribute("aUV", new Float32BufferAttribute(uv, 2));
  geometry.setAttribute("aHeight", new Float32BufferAttribute(height, 1));
  geometry.setAttribute("aSeed", new Float32BufferAttribute(seed, 1));
  geometry.setIndex(index);
  // Positions move in the shader, so the bounds are set by hand or Three.js would cull the mesh.
  geometry.boundingSphere = new Sphere(new Vector3(), 60);
  return geometry;
}
