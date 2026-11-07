const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export const BASE_FOV = 40;
export const FLAT_FOV = 12;
export const BASE_DISTANCE = 9;

/** The field of view for a `flatten` of 0 to 1. */
export const fovFor = (flatten: number) => BASE_FOV + (FLAT_FOV - BASE_FOV) * flatten;

/**
 * The dolly zoom: as the field of view narrows, the camera backs away just enough that the
 * subject keeps its size on screen, so only the perspective drains out.
 */
export const dollyDistance = (fov: number) =>
  (BASE_DISTANCE * Math.tan(toRadians(BASE_FOV / 2))) / Math.tan(toRadians(fov / 2));

/** The camera's offset from its target for a pitch and orbit in degrees, at `distance`. */
export function orbitOffset(pitch: number, orbit: number, distance: number): [number, number, number] {
  const elevation = toRadians(-pitch);
  const turn = toRadians(orbit);
  return [
    Math.sin(turn) * Math.cos(elevation) * distance,
    Math.sin(elevation) * distance,
    Math.cos(turn) * Math.cos(elevation) * distance,
  ];
}

/**
 * The world-space radius that shows as `radiusPx` on screen, for a flat ring facing a camera
 * `distance` away with field of view `fov`, on a canvas `viewportHeight` pixels tall.
 */
export const worldRadiusFor = (radiusPx: number, viewportHeight: number, distance: number, fov: number) =>
  (radiusPx / (viewportHeight / 2)) * distance * Math.tan(toRadians(fov / 2));
