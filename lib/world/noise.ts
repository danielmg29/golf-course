import { DataTexture, LinearFilter, LinearMipmapLinearFilter, RepeatWrapping } from "three";

// Small shared helpers for the 3D scenes: a seeded random sequence and tiling noise.

/** A deterministic random sequence, so the course is planted the same way every visit. */
export function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const smoothstep = (from: number, to: number, value: number) => {
  const t = Math.min(1, Math.max(0, (value - from) / (to - from)));
  return t * t * (3 - 2 * t);
};

/**
 * Smooth value noise in a small tile that repeats: three independent channels, 16 cells to a
 * tile in r and g and 64 in b. Reading it is one texture fetch where computing noise in the
 * shader is a dozen operations, and its mipmaps fade fine detail out at a distance for free.
 */
export function paintNoise(size = 256) {
  const random = seeded(5);
  const data = new Uint8Array(size * size * 4);
  const channel = (cells: number, offset: number) => {
    const lattice = Array.from({ length: cells * cells }, () => random());
    const at = (i: number, j: number) => lattice[((j + cells) % cells) * cells + ((i + cells) % cells)];
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const fx = (x / size) * cells;
        const fy = (y / size) * cells;
        const i = Math.floor(fx);
        const j = Math.floor(fy);
        const u = smoothstep(0, 1, fx - i);
        const v = smoothstep(0, 1, fy - j);
        const top = at(i, j) + (at(i + 1, j) - at(i, j)) * u;
        const bottom = at(i, j + 1) + (at(i + 1, j + 1) - at(i, j + 1)) * u;
        data[(y * size + x) * 4 + offset] = Math.round((top + (bottom - top) * v) * 255);
      }
    }
  };
  channel(16, 0);
  channel(16, 1);
  channel(64, 2);
  for (let index = 3; index < data.length; index += 4) data[index] = 255;
  const texture = new DataTexture(data, size, size);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

