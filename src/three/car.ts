import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshStandardMaterial, Object3D, SpotLight, type BufferGeometry } from 'three'

/** Taper the top face of a box (for the cabin and bonnet shapes). */
function taper(geo: BufferGeometry, sx: number, sz: number, zShift = 0) {
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    if (pos.getY(i) > 0) {
      pos.setX(i, pos.getX(i) * sx)
      pos.setZ(i, pos.getZ(i) * sz + zShift)
    }
  }
  geo.computeVertexNormals()
  return geo
}

export type Car = {
  root: Group
  body: Group
  wheels: Object3D[]
  lights: MeshStandardMaterial
  tail: MeshStandardMaterial
  beam: SpotLight
}

/**
 * A chunky low-poly hatchback, modelled in code. Faces -z (the direction of travel).
 * Units: ~metres. Total length ≈ 4.2.
 */
export function makeCar(): Car {
  const paint = new MeshStandardMaterial({ color: '#1f7a72', roughness: 0.45, metalness: 0.15, flatShading: true })
  const cream = new MeshStandardMaterial({ color: '#f4e9d8', roughness: 0.6, flatShading: true })
  const glass = new MeshStandardMaterial({ color: '#23303a', roughness: 0.15, metalness: 0.4, flatShading: true })
  const dark = new MeshStandardMaterial({ color: '#1c1a19', roughness: 0.85, flatShading: true })
  const lights = new MeshStandardMaterial({ color: '#fff3c4', emissive: '#ffe7a3', emissiveIntensity: 0.4 })
  const tail = new MeshStandardMaterial({ color: '#c0392b', emissive: '#ff3b2f', emissiveIntensity: 0.5 })

  const root = new Group()
  const body = new Group()
  root.add(body)

  const add = (geo: BufferGeometry, mat: MeshStandardMaterial, x: number, y: number, z: number, parent: Object3D = body) => {
    const m = new Mesh(geo, mat)
    m.position.set(x, y, z)
    parent.add(m)
    return m
  }

  // lower shell, a bonnet that slopes forward, and the cabin
  add(new BoxGeometry(2.0, 0.62, 4.1), paint, 0, 0.72, 0)
  add(taper(new BoxGeometry(1.96, 0.22, 1.25), 1, 0.92, 0.05), paint, 0, 1.13, -1.35)
  add(taper(new BoxGeometry(1.86, 0.72, 2.3), 0.84, 0.7, 0.12), glass, 0, 1.38, 0.3)
  // cream roof + racing stripe, the bit of personality
  add(new BoxGeometry(1.5, 0.08, 1.45), cream, 0, 1.78, 0.42)
  add(new BoxGeometry(0.42, 0.02, 1.27), cream, 0, 1.25, -1.35)
  // bumpers
  add(new BoxGeometry(2.08, 0.26, 0.28), cream, 0, 0.5, -2.08)
  add(new BoxGeometry(2.08, 0.26, 0.28), cream, 0, 0.5, 2.08)
  // headlights / tail lights
  for (const x of [-0.68, 0.68]) {
    add(new BoxGeometry(0.42, 0.2, 0.08), lights, x, 0.86, -2.07)
    add(new BoxGeometry(0.42, 0.16, 0.08), tail, x, 0.88, 2.07)
  }
  // mirrors and a roof rack for the road-trip look
  for (const x of [-1.06, 1.06]) add(new BoxGeometry(0.16, 0.14, 0.26), paint, x, 1.2, -0.65)
  for (const z of [0.05, 0.8]) add(new BoxGeometry(1.6, 0.06, 0.08), dark, 0, 1.86, z)
  add(
    new BoxGeometry(1.1, 0.34, 0.7),
    new MeshStandardMaterial({ color: '#e2603b', roughness: 0.8, flatShading: true }),
    0,
    2.06,
    0.42,
  )

  // wheels: a tyre plus a cream hub; spun around x as the car moves
  const tyre = new CylinderGeometry(0.44, 0.44, 0.34, 14)
  tyre.rotateZ(Math.PI / 2)
  const hub = new CylinderGeometry(0.2, 0.2, 0.36, 6)
  hub.rotateZ(Math.PI / 2)
  const wheels: Object3D[] = []
  for (const [x, z] of [
    [-0.98, -1.35],
    [0.98, -1.35],
    [-0.98, 1.3],
    [0.98, 1.3],
  ]) {
    const w = new Group()
    w.position.set(x, 0.44, z)
    w.add(new Mesh(tyre, dark))
    w.add(new Mesh(hub, cream))
    root.add(w)
    wheels.push(w)
  }

  // headlight beam, only really visible at night
  const beam = new SpotLight('#ffe7b0', 0, 60, 0.5, 0.6, 1.2)
  beam.position.set(0, 0.9, -2)
  beam.target.position.set(0, 0, -16)
  root.add(beam, beam.target)

  root.traverse((o) => {
    if (o instanceof Mesh) o.castShadow = false
  })
  return { root, body, wheels, lights, tail, beam }
}
