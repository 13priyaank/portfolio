/**
 * Shared state between the DOM (scroll, pointer, intro) and the WebGL scene.
 * The scene reads it every frame and writes back speed/odometer for the dashboard.
 */
export const stage = {
  /** scroll position through the page, 0..1 */
  progress: 0,
  /** where each section starts, 0..1 (about, work, projects, stack, contact) */
  milestones: [0.14, 0.32, 0.55, 0.76, 0.94],
  /** pointer in NDC (-1..1) */
  pointer: { x: 0, y: 0 },
  /** written by the scene */
  speed: 0,
  odometer: 0,
  night: 0,
  /** set by the scene: flash the lights and bounce the car */
  honk: () => {},
}

export const EXITS = [
  { top: 'EXIT 01', main: 'ABOUT' },
  { top: 'EXIT 02', main: 'EXPERIENCE' },
  { top: 'EXIT 03', main: 'PROJECTS' },
  { top: 'EXIT 04', main: 'THE TOOLBOX' },
  { top: 'LAST STOP', main: 'SAY HELLO' },
]
