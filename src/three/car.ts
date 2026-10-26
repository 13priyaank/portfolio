import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Shape,
  SpotLight,
  type BufferGeometry,
} from 'three'

export type Car = {
  root: Group
  body: Group
  wheels: Object3D[]
  lights: MeshStandardMaterial
  tail: MeshStandardMaterial
  beam: SpotLight
}

/**
 * Build a solid from a side profile (x = forward, y = up), extruded across the car's width.
 * The result faces -z (direction of travel) and is centred on x.
 */
function profileSolid(points: [number, number][], width: number, bevel = 0.06) {
  const shape = new Shape()
  points.forEach(([x, y], i) => (i ? shape.lineTo(x, y) : shape.moveTo(x, y)))
  shape.closePath()
  const geo = new ExtrudeGeometry(shape, {
    depth: width,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 1,
  })
  geo.translate(0, 0, -width / 2)
  // shape +x (forward) → world -z
  geo.rotateY(Math.PI / 2)
  geo.computeVertexNormals()
  return geo
}

/** Pull in the upper vertices of a solid so the canopy narrows toward the roof. */
function narrowTop(geo: BufferGeometry, above: number, k: number) {
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) if (pos.getY(i) > above) pos.setX(i, pos.getX(i) * k)
  geo.computeVertexNormals()
  return geo
}

// side profile of the body: long low nose, short tail (x forward, y up)
const BODY: [number, number][] = [
  [2.25, 0.3],
  [2.32, 0.5],
  [1.4, 0.68],
  [0.6, 0.78],
  [-0.9, 0.8],
  [-1.7, 0.86],
  [-2.2, 0.84],
  [-2.24, 0.36],
  [-1.9, 0.26],
  [1.9, 0.26],
]
// the glass canopy: steep windscreen, fastback rear
const CANOPY: [number, number][] = [
  [0.75, 0.74],
  [0.0, 1.14],
  [-0.55, 1.16],
  [-1.55, 0.86],
  [-1.55, 0.78],
  [0.75, 0.7],
]

/**
 * A low wedge sports coupé, modelled in code. Faces -z. Units ≈ metres, length ≈ 4.6.
 */
export function makeCar(): Car {
  const paint = new MeshStandardMaterial({ color: '#178f86', roughness: 0.28, metalness: 0.35, flatShading: true })
  const stripe = new MeshStandardMaterial({ color: '#e2603b', roughness: 0.35, metalness: 0.2, flatShading: true })
  const cream = new MeshStandardMaterial({ color: '#fff3dc', roughness: 0.4, flatShading: true })
  const glass = new MeshStandardMaterial({ color: '#141a22', roughness: 0.08, metalness: 0.6, flatShading: true })
  const dark = new MeshStandardMaterial({ color: '#1a1817', roughness: 0.7, flatShading: true })
  const chrome = new MeshStandardMaterial({ color: '#d9d4cc', roughness: 0.2, metalness: 0.9 })
  const lights = new MeshStandardMaterial({ color: '#fff6d8', emissive: '#ffe7a3', emissiveIntensity: 0.4 })
  const tail = new MeshStandardMaterial({ color: '#c0392b', emissive: '#ff3b2f', emissiveIntensity: 0.5 })

  const root = new Group()
  const body = new Group()
  root.add(body)
  const add = (geo: BufferGeometry, mat: MeshStandardMaterial, x = 0, y = 0, z = 0, parent: Object3D = body) => {
    const m = new Mesh(geo, mat)
    m.position.set(x, y, z)
    parent.add(m)
    return m
  }

  // body, canopy, and a racing stripe with cream pinstripes riding on top of the body
  add(profileSolid(BODY, 1.84), paint)
  add(narrowTop(profileSolid(CANOPY, 1.5, 0.04), 0.95, 0.86), glass)
  add(profileSolid(BODY, 0.36), stripe, 0, 0.012)
  // thinner bevel than the body, so lift them by the difference to sit on its surface
  for (const x of [-0.25, 0.25]) add(profileSolid(BODY, 0.05, 0.02), cream, x, 0.058)

  // front: dark intake, slim headlights; rear: light bar, diffuser, twin exhausts
  add(new BoxGeometry(1.3, 0.14, 0.1), dark, 0, 0.38, -2.36)
  for (const x of [-0.66, 0.66]) add(new BoxGeometry(0.46, 0.08, 0.12), lights, x, 0.58, -2.3)
  add(new BoxGeometry(1.7, 0.08, 0.08), tail, 0, 0.72, 2.3)
  add(new BoxGeometry(1.5, 0.16, 0.16), dark, 0, 0.36, 2.28)
  const pipe = new CylinderGeometry(0.075, 0.075, 0.3, 10)
  pipe.rotateX(Math.PI / 2)
  for (const x of [-0.35, 0.35]) add(pipe, chrome, x, 0.32, 2.36)

  // side intakes ahead of the rear wheels, mirrors
  for (const x of [-0.99, 0.99]) {
    add(new BoxGeometry(0.06, 0.16, 0.6), dark, x, 0.56, 0.55)
    add(new BoxGeometry(0.2, 0.1, 0.22), paint, x * 0.98, 0.86, -0.55)
  }

  // rear wing on two struts
  add(new BoxGeometry(1.86, 0.06, 0.42), dark, 0, 1.12, 1.95)
  for (const x of [-0.95, 0.95]) add(new BoxGeometry(0.06, 0.22, 0.44), dark, x, 1.04, 1.95)
  for (const x of [-0.55, 0.55]) add(new BoxGeometry(0.08, 0.26, 0.16), dark, x, 0.96, 1.98)

  // big wheels: tyre + five-spoke cream rim, spun about x as the car moves
  const tyre = new CylinderGeometry(0.44, 0.44, 0.34, 18)
  tyre.rotateZ(Math.PI / 2)
  const rim = new CylinderGeometry(0.3, 0.3, 0.36, 5)
  rim.rotateZ(Math.PI / 2)
  const cap = new CylinderGeometry(0.09, 0.09, 0.38, 8)
  cap.rotateZ(Math.PI / 2)
  const wheels: Object3D[] = []
  for (const [x, z] of [
    [-0.96, -1.45],
    [0.96, -1.45],
    [-0.98, 1.38],
    [0.98, 1.38],
  ]) {
    const w = new Group()
    w.position.set(x, 0.44, z)
    w.add(new Mesh(tyre, dark), new Mesh(rim, cream), new Mesh(cap, chrome))
    root.add(w)
    wheels.push(w)
  }

  // headlight beam, only really visible at night
  const beam = new SpotLight('#ffe7b0', 0, 60, 0.5, 0.6, 1.2)
  beam.position.set(0, 0.6, -2.3)
  beam.target.position.set(0, 0, -16)
  root.add(beam, beam.target)

  return { root, body, wheels, lights, tail, beam }
}
