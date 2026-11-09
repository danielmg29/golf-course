// Where everything sits on the 3D map. This holds no Three.js, so the page can read it
// without loading the 3D bundle. Names, par and yards come from the database; this is
// the invented routing that goes with the sample holes, plus each hole's sample tip.

export const MAP_WIDTH = 44;
export const MAP_DEPTH = 30;

type Point = readonly [x: number, z: number];

export type HolePlan = {
  number: number;
  tee: Point;
  bend: Point;
  green: Point;
  isParThree?: boolean;
  tip: string;
};

export const holePlans: HolePlan[] = [
  { number: 1, tee: [-2, 6.5], bend: [-5, 5.6], green: [-8, 8.4], tip: "The fairway tilts left to right. Start your drive at the left bunker and let it feed back." },
  { number: 2, tee: [-9.5, 9.6], bend: [-14, 11], green: [-17.6, 6.2], tip: "Reachable in two only from the right side. From the left, lay up short of the cross bunker." },
  { number: 3, tee: [-18, 4.2], bend: [-17.4, 3], green: [-16, 1.6], isParThree: true, tip: "Club up. The pond makes it look shorter than it plays, and anything short is wet." },
  { number: 4, tee: [-17.8, 0], bend: [-19, -3], green: [-17.2, -6], tip: "The hardest hole on the card. Bogey is a fine score, so play for the fat of the green." },
  { number: 5, tee: [-16, -7.6], bend: [-13.5, -10.4], green: [-10, -10], tip: "The old tree guards the right. Favour the left half off the tee for a clear second." },
  { number: 6, tee: [-9, -11.4], bend: [-7.2, -12.4], green: [-5.4, -11.6], isParThree: true, tip: "The wind funnels through the gap. Check the treetops, not the flag." },
  { number: 7, tee: [-4.4, -10], bend: [-7, -5.4], green: [-11.6, -4.6], tip: "Three good shots. Keep your layup left of the fairway bunkers for the best angle in." },
  { number: 8, tee: [-13.2, -3], bend: [-14.2, 0], green: [-11, 2.6], tip: "A long iron from the tee keeps you on the flat. Driver brings the hollow into play." },
  { number: 9, tee: [-9.6, 3.6], bend: [-6, 1.6], green: [-2.6, 3.6], tip: "Uphill to a two-tier green. Take one more club and stay below the hole." },
  { number: 10, tee: [1.6, 5.6], bend: [0, 2.6], green: [1.6, -0.6], tip: "Aim over the ridge marker. The ball will run further than you think." },
  { number: 11, tee: [3, -1.6], bend: [4.6, -2], green: [5.6, -3.6], isParThree: true, tip: "Short, but the green is shallow. Land it past the front edge and let it stop." },
  { number: 12, tee: [6, -5], bend: [8.6, -10.4], green: [14, -11], tip: "Stroke index 2 for a reason. Two solid shots leave a wedge, so be patient." },
  { number: 13, tee: [15.6, -10.6], bend: [18.8, -8.6], green: [18, -4.6], tip: "Trees pinch the landing zone. A hybrid finds the widest part." },
  { number: 14, tee: [17.6, -3], bend: [15.6, -0.6], green: [11.6, -1.4], tip: "The wind usually comes from the right. Allow for it on the approach as well." },
  { number: 15, tee: [12.6, 0.8], bend: [17.2, 1.8], green: [18.4, 6.6], tip: "The best birdie chance on the back nine. Go for it in two if you find the fairway." },
  { number: 16, tee: [16.4, 8], bend: [14.6, 8.1], green: [13, 9.6], isParThree: true, tip: "Ignore the flag and aim for the middle. There is more green than it looks." },
  { number: 17, tee: [11.4, 8.4], bend: [10.6, 5], green: [7, 4], tip: "Position over power. Anything on the left side opens up the green." },
  { number: 18, tee: [6, 2.4], bend: [6.6, 6], green: [3.2, 8.2], tip: "Everyone on the terrace is watching. Take enough club, because short leaves a tough chip." },
];

export const waterBodies = [
  { x: 13, z: 9.6, r: 2.7 },
  { x: -14.2, z: 3.4, r: 1.5 },
  { x: 3.6, z: -3.9, r: 1.3 },
  { x: -7.4, z: -7.6, r: 1.1 },
];

export const landmarks = [
  { id: "clubhouse", label: "Clubhouse", action: "Reserve a table", href: "/amenities", x: -0.4, z: 9.8 },
  { id: "pool", label: "Pool", action: "Get a day pass", href: "/amenities#day-pass", x: -4.4, z: 11.2 },
  { id: "bays", label: "Floodlit bays", action: "Book a bay", href: "/amenities#bays", x: 8.2, z: 11.6 },
] as const;

/** Gentle rolling ground, dipping where there's water. The same answer every time. */
export function terrainHeight(x: number, z: number) {
  let height =
    0.72 * Math.sin(x * 0.22 + 1.3) * Math.cos(z * 0.27 - 0.6) +
    0.34 * Math.sin(x * 0.55 - z * 0.35 + 2) +
    0.16 * Math.cos(x * 0.9 + z * 0.8);
  for (const water of waterBodies) {
    const distance = ((x - water.x) ** 2 + (z - water.z) ** 2) / water.r ** 2;
    height -= 0.75 * Math.exp(-distance * 1.2);
  }
  return height;
}

/** A point along a hole's line of play, where t runs from the tee (0) to the green (1). */
export function pointOnHole(plan: HolePlan, t: number): [x: number, z: number] {
  const inverse = 1 - t;
  return [
    inverse * inverse * plan.tee[0] + 2 * inverse * t * plan.bend[0] + t * t * plan.green[0],
    inverse * inverse * plan.tee[1] + 2 * inverse * t * plan.bend[1] + t * t * plan.green[1],
  ];
}

// The page and the scene talk through this, so the page never imports Three.js.
export const mapController = {
  selected: null as number | null,
  /** Set by the scene while it's mounted. */
  flyTo: null as ((hole: number | null) => void) | null,
  /** Label elements, which the scene moves every frame to follow the camera. */
  labels: new Map<string, HTMLElement>(),
  /** The layer the labels sit in, which the scene fades in once the whole course is in view. */
  labelLayer: null as HTMLElement | null,
  /**
   * The homepage's scroll story (features/home/CourseStage.tsx): `arrival` is the ball's drop onto
   * hole 1's green (0 high in the air, 1 at rest by the pin), `reveal` the camera's rise from that
   * green to the whole course (0 on the green, 1 overhead). Pages without the story leave both at 1.
   */
  arrival: 1,
  reveal: 1,
  /** True while copy is laid over the map (the homepage stage), so narrow screens frame the course below it. */
  copyOver: false,
  select(hole: number | null) {
    this.selected = hole;
    this.flyTo?.(hole);
  },
};
