/** Shared, non-React state read every frame by the 3D scene. */
export type Pose = {
  /** horizontal offset, -1..1 of half viewport width */
  x: number
  /** vertical offset, -1..1 of half viewport height */
  y: number
  /** uniform scale (1 = unit sphere) */
  s: number
  /** 0 = formed, 1 = scattered point cloud */
  spread: number
  /** wireframe opacity multiplier */
  wire: number
  /** overall brightness multiplier (keeps text legible) */
  dim: number
  /** y-axis spin speed, rad/s */
  spin: number
}

export const poses: Record<string, Pose> = {
  hero: { x: 0.5, y: 0.02, s: 1.18, spread: 0, wire: 0.55, dim: 1, spin: 0.12 },
  about: { x: -0.62, y: -0.05, s: 0.75, spread: 0, wire: 0.2, dim: 0.55, spin: 0.08 },
  skills: { x: 0.68, y: 0.05, s: 0.62, spread: 0, wire: 1, dim: 0.4, spin: 0.1 },
  experience: { x: -0.72, y: 0, s: 0.55, spread: 0.08, wire: 0.3, dim: 0.35, spin: 0.06 },
  projects: { x: 0.8, y: -0.1, s: 0.5, spread: 0.1, wire: 0.5, dim: 0.28, spin: 0.05 },
  education: { x: -0.74, y: 0.05, s: 0.5, spread: 0, wire: 0.7, dim: 0.3, spin: 0.07 },
  contact: { x: 0, y: 0.3, s: 1.0, spread: 0, wire: 0.7, dim: 0.9, spin: 0.14 },
}

export const stage = {
  pose: { ...poses.hero, spread: 1 } as Pose,
  /** normalised pointer, -1..1 */
  mouse: { x: 0, y: 0 },
  /** 0..1, raised while the pointer is over something interactive: the orb spins up and glows */
  energy: 0,
  /** click shockwave: the scene copies the pointer position and restarts the wave when `fresh` is set */
  pulse: { fresh: false },
}

export const firePulse = () => {
  stage.pulse.fresh = true
}

/** Lets a demand-driven (reduced-motion) canvas know when to redraw. */
export const stageListeners = new Set<() => void>()
export const notifyStage = () => stageListeners.forEach((l) => l())
