/**
 * The homepage blueprint's motion tokens, in seconds for GSAP. They are starting values,
 * not mandates, and every use sits behind the reduced-motion check (MOTION_OK).
 */
export const duration = {
  /** Immediate UI feedback. */
  instant: 0.12,
  /** Hover and buttons. */
  fast: 0.2,
  /** Menus and components. */
  standard: 0.35,
  /** Image and type reveals. */
  editorial: 0.65,
  /** A selected story beat. */
  dramatic: 1,
  /** Camera sequences, sparingly. */
  scene: 1.4,
} as const;
