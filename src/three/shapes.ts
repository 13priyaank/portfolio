/**
 * Point-cloud targets the particles morph between, one per section.
 * Each returns 3 floats per particle, centred on the origin, ~2 units radius.
 */

const TAU = Math.PI * 2
const rand = (a: number, b: number) => a + Math.random() * (b - a)
const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5

/** hero: a dense fibonacci sphere wrapped in a loose halo */
export function sphere(n: number) {
  const out = new Float32Array(n * 3)
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < n; i++) {
    const halo = i % 5 === 0
    const y = 1 - (i / (n - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const th = golden * i
    const R = halo ? rand(2.1, 2.9) : 1.85 + gauss() * 0.03
    out[i * 3] = Math.cos(th) * r * R
    out[i * 3 + 1] = y * R
    out[i * 3 + 2] = Math.sin(th) * r * R
  }
  return out
}

/** about: a DNA double helix with rungs (the healthcare work) */
export function helix(n: number) {
  const out = new Float32Array(n * 3)
  const H = 5.2
  const turns = 2.6
  const R = 0.95
  for (let i = 0; i < n; i++) {
    const kind = i % 10
    const t = Math.random()
    const a = t * turns * TAU
    const y = (t - 0.5) * H
    let x: number, z: number
    if (kind < 7) {
      // two strands, half a turn apart
      const off = kind % 2 ? Math.PI : 0
      const j = 0.07
      x = Math.cos(a + off) * R + gauss() * j
      z = Math.sin(a + off) * R + gauss() * j
    } else {
      // rungs: snap to evenly spaced steps, interpolate across
      const steps = 34
      const ts = Math.round(t * steps) / steps
      const as = ts * turns * TAU
      const k = Math.random()
      x = Math.cos(as) * R * (1 - 2 * k)
      z = Math.sin(as) * R * (1 - 2 * k)
      out[i * 3 + 1] = (ts - 0.5) * H + gauss() * 0.02
      out[i * 3] = x
      out[i * 3 + 2] = z
      continue
    }
    out[i * 3] = x
    out[i * 3 + 1] = y
    out[i * 3 + 2] = z
  }
  return out
}

/** experience: a lattice of server-like blocks */
export function lattice(n: number) {
  const out = new Float32Array(n * 3)
  const div = 4
  const S = 3.1
  const step = S / div
  for (let i = 0; i < n; i++) {
    // pick a random edge of the lattice and a point along it
    const axis = i % 3
    const a = Math.floor(Math.random() * (div + 1)) * step - S / 2
    const b = Math.floor(Math.random() * (div + 1)) * step - S / 2
    const c = Math.random() * S - S / 2
    const p = axis === 0 ? [c, a, b] : axis === 1 ? [a, c, b] : [a, b, c]
    out[i * 3] = p[0] + gauss() * 0.015
    out[i * 3 + 1] = p[1] + gauss() * 0.015
    out[i * 3 + 2] = p[2] + gauss() * 0.015
  }
  return out
}

/** projects: a (2,3) torus knot, things woven together */
export function knot(n: number) {
  const out = new Float32Array(n * 3)
  const p = 2
  const q = 3
  for (let i = 0; i < n; i++) {
    const t = Math.random() * TAU
    const r = 1.25 + 0.55 * Math.cos(q * t)
    const cx = r * Math.cos(p * t)
    const cy = r * Math.sin(p * t)
    const cz = 0.55 * Math.sin(q * t)
    // thicken into a tube
    const tube = 0.2 * Math.sqrt(Math.random())
    const u = Math.random() * TAU
    out[i * 3] = cx + Math.cos(u) * tube
    out[i * 3 + 1] = cy + Math.sin(u) * tube
    out[i * 3 + 2] = cz + Math.cos(u + 1) * tube
  }
  return out
}

/** stack: a small planet with a wide ring system */
export function planet(n: number) {
  const out = new Float32Array(n * 3)
  const tilt = 0.42
  const ct = Math.cos(tilt)
  const st = Math.sin(tilt)
  for (let i = 0; i < n; i++) {
    let x: number, y: number, z: number
    if (i % 3 === 0) {
      const u = Math.random() * 2 - 1
      const th = Math.random() * TAU
      const r = Math.sqrt(1 - u * u) * 0.95
      x = Math.cos(th) * r
      y = u * 0.95
      z = Math.sin(th) * r
    } else {
      const band = Math.random() < 0.6 ? rand(1.45, 2.05) : rand(2.2, 2.75)
      const th = Math.random() * TAU
      x = Math.cos(th) * band
      y = gauss() * 0.025
      z = Math.sin(th) * band
    }
    // tilt the whole thing toward the camera
    out[i * 3] = x
    out[i * 3 + 1] = y * ct - z * st
    out[i * 3 + 2] = y * st + z * ct
  }
  return out
}

/** contact: a three-armed spiral galaxy */
export function galaxy(n: number) {
  const out = new Float32Array(n * 3)
  const arms = 3
  for (let i = 0; i < n; i++) {
    const r = Math.pow(Math.random(), 1.6) * 3.1
    const arm = (i % arms) * (TAU / arms)
    const spin = r * 1.25
    const spread = 0.35 * (0.3 + r * 0.25)
    const th = arm + spin
    const x = Math.cos(th) * r + gauss() * spread
    const z = Math.sin(th) * r + gauss() * spread
    const y = gauss() * 0.12 * (1.2 - r / 3.1)
    // lean it back so we see the spiral
    out[i * 3] = x
    out[i * 3 + 1] = y * 0.6 + z * 0.55
    out[i * 3 + 2] = z * 0.8 - y * 0.3
  }
  return out
}

export const SHAPES = [sphere, helix, lattice, knot, planet, galaxy]
