/**
 * Shared state between the DOM (scroll, pointer, intro) and the WebGL scene.
 * The scene reads it every frame; nothing here triggers React renders.
 */
export const stage = {
  /** scroll-driven target: 0 = hero sphere ... 5 = contact galaxy (fractional while morphing) */
  target: 0,
  /** pointer in NDC (-1..1) */
  pointer: { x: 0, y: 0, active: false },
  /** 0 before the intro is dismissed, eases to 1 as the field assembles */
  intro: 0,
  /** set by the scene: fire a shockwave from the centre */
  pulse: () => {},
}

export const SHAPE_NAMES = ['sphere', 'helix', 'lattice', 'knot', 'planet', 'galaxy'] as const
