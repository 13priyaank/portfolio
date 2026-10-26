import { Color } from 'three'

/** Length of the drive, in world units (~metres). The car goes from z=0 to z=-ROAD_LEN. */
export const ROAD_LEN = 900
export const ROAD_HALF = 4.2

/** Centre line of the road: two slow S-curves layered together. */
export function roadX(z: number) {
  return Math.sin(z * 0.011) * 13 + Math.sin(z * 0.0042 + 1.3) * 22
}

/** Y rotation that points an object's -z axis along the road (direction of travel) at z. */
export function roadYaw(z: number) {
  const dz = 0.5
  const dx = roadX(z - dz) - roadX(z + dz)
  return Math.atan2(-dx, 2 * dz)
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/** Desert terrain: flat by the road, rolling dunes, then mesas further out. */
export function terrainH(x: number, z: number) {
  const d = Math.abs(x - roadX(z))
  const near = smooth(7, 26, d)
  const dunes =
    Math.sin(x * 0.045 + z * 0.012) * 3.2 + Math.sin(z * 0.029 + x * 0.018) * 2.4 + Math.sin(x * 0.12) * Math.sin(z * 0.1) * 1.2
  const mesa = Math.max(0, d - 55) * 0.42 * (0.55 + 0.45 * Math.sin(z * 0.017 + x * 0.01))
  // flat-topped mesas: clamp the tallest peaks into plateaus
  const plateau = Math.min(mesa, 26 + Math.sin(z * 0.05) * 4)
  return (dunes + 2.2) * near + plateau - 0.15
}

export type Sky = {
  top: Color
  horizon: Color
  ground: Color
  sun: Color
  sunElev: number
  sunInt: number
  hemiInt: number
  night: number
}

/** Time of day along the drive: morning → noon → golden hour → sunset → night. */
const KEYS: {
  p: number
  top: string
  horizon: string
  ground: string
  sun: string
  elev: number
  int: number
  hemi: number
  night: number
}[] = [
  { p: 0.0, top: '#7fc4e8', horizon: '#fde4c3', ground: '#e8b77d', sun: '#fff0d4', elev: 22, int: 2.6, hemi: 1.15, night: 0 },
  { p: 0.32, top: '#3d9bd9', horizon: '#e9f3f1', ground: '#e9bf86', sun: '#ffffff', elev: 58, int: 3.0, hemi: 1.25, night: 0 },
  { p: 0.62, top: '#5577ad', horizon: '#f7b56a', ground: '#d99a62', sun: '#ffb463', elev: 13, int: 2.4, hemi: 0.95, night: 0 },
  { p: 0.84, top: '#3a3a78', horizon: '#f06c47', ground: '#a8634a', sun: '#ff7a45', elev: 3, int: 1.6, hemi: 0.6, night: 0.35 },
  { p: 1.0, top: '#0a1230', horizon: '#2b2c58', ground: '#2a2440', sun: '#9fb6ff', elev: 28, int: 0.45, hemi: 0.28, night: 1 },
]
const PAL = KEYS.map((k) => ({
  ...k,
  cTop: new Color(k.top),
  cHor: new Color(k.horizon),
  cGround: new Color(k.ground),
  cSun: new Color(k.sun),
}))

export function skyAt(p: number, out: Sky) {
  let i = 0
  while (i < PAL.length - 2 && p > PAL[i + 1].p) i++
  const a = PAL[i]
  const b = PAL[i + 1]
  const t = smooth(0, 1, (p - a.p) / (b.p - a.p))
  out.top.copy(a.cTop).lerp(b.cTop, t)
  out.horizon.copy(a.cHor).lerp(b.cHor, t)
  out.ground.copy(a.cGround).lerp(b.cGround, t)
  out.sun.copy(a.cSun).lerp(b.cSun, t)
  out.sunElev = a.elev + (b.elev - a.elev) * t
  out.sunInt = a.int + (b.int - a.int) * t
  out.hemiInt = a.hemi + (b.hemi - a.hemi) * t
  out.night = a.night + (b.night - a.night) * t
  return out
}

export const newSky = (): Sky => ({
  top: new Color(),
  horizon: new Color(),
  ground: new Color(),
  sun: new Color(),
  sunElev: 0,
  sunInt: 1,
  hemiInt: 1,
  night: 0,
})

/** Seeded random so the scenery is the same on every visit. */
export function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}
