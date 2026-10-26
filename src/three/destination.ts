import {
  BoxGeometry,
  CanvasTexture,
  CylinderGeometry,
  DoubleSide,
  Group,
  LatheGeometry,
  Mesh,
  MeshLambertMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  PointLight,
  SRGBColorSpace,
  TorusGeometry,
  Vector2,
} from 'three'
import { makeSign } from './signs'
import { lotFrame } from './world'

/** Painted lettering on the parking bay. */
function bayDecal() {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 1024
  const g = c.getContext('2d')!
  g.clearRect(0, 0, 512, 1024)
  g.fillStyle = '#f2b33d'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.font = "900 150px 'Big Shoulders Display Variable', 'Arial Narrow', sans-serif"
  g.save()
  g.translate(256, 512)
  g.rotate(-Math.PI / 2)
  g.fillText('PRIYANK', 0, 0)
  g.restore()
  const tex = new CanvasTexture(c)
  tex.colorSpace = SRGBColorSpace
  return tex
}

/**
 * The end of the trip: a little parking lot off the road with a reserved bay,
 * a reserved sign, a flag and a trophy. Built in the lot's own frame:
 * local +x = away from the road, local -z = along the road.
 */
export function makeDestination() {
  const L = lotFrame()
  const root = new Group()
  root.position.set(L.road.x, 0, L.road.z)
  root.rotation.y = L.roadYaw
  // in this group, the right-hand side of the road is +x and the parked spot sits at x = LOT_OFFSET
  const sx = Math.hypot(L.spot.x - L.road.x, L.spot.z - L.road.z)

  const asphalt = new MeshLambertMaterial({ color: '#4a4440' })
  const paintW = new MeshLambertMaterial({ color: '#f6ecdc' })
  const paintY = new MeshLambertMaterial({ color: '#f2b33d' })

  // the lot pad and a short driveway from the road
  const pad = new Mesh(new PlaneGeometry(14, 20), asphalt)
  pad.rotation.x = -Math.PI / 2
  pad.position.set(sx + 1, 0.05, 0)
  const drive = new Mesh(new PlaneGeometry(sx - 4, 7), asphalt)
  drive.rotation.x = -Math.PI / 2
  drive.position.set((sx - 4) / 2 + 3, 0.045, 0)
  root.add(pad, drive)

  // three bays: lines along x, the middle one is ours (mustard outline + name)
  for (const z of [-5.4, -1.8, 1.8, 5.4]) {
    const line = new Mesh(new BoxGeometry(6.4, 0.02, 0.14), Math.abs(z) < 2 ? paintY : paintW)
    line.position.set(sx + 0.6, 0.07, z)
    root.add(line)
  }
  const head = new Mesh(new BoxGeometry(0.14, 0.02, 3.74), paintY)
  head.position.set(sx + 3.8, 0.07, 0)
  root.add(head)
  const decal = new Mesh(
    new PlaneGeometry(2.6, 5.2),
    new MeshLambertMaterial({ map: bayDecal(), transparent: true, depthWrite: false }),
  )
  decal.rotation.x = -Math.PI / 2
  decal.position.set(sx + 0.3, 0.08, 0)
  root.add(decal)

  // kerb stop at the head of the bay
  const kerb = new Mesh(new BoxGeometry(0.4, 0.18, 2.2), new MeshLambertMaterial({ color: '#e2603b', flatShading: true }))
  kerb.position.set(sx + 3.3, 0.14, 0)
  root.add(kerb)

  // reserved sign facing back toward the car and the road
  const spec = { kind: 'reserved' as const, top: 'RESERVED · GOAL REACHED', main: 'PRIYANK W.' }
  const sign = makeSign(spec)
  sign.userData.spec = spec
  sign.scale.setScalar(0.5)
  sign.position.set(sx + 4.6, 0, 0)
  sign.rotation.y = -Math.PI / 2
  root.add(sign)

  // flagpole with a waving flag
  const pole = new Mesh(
    new CylinderGeometry(0.08, 0.1, 7.4, 8),
    new MeshStandardMaterial({ color: '#d9d4cc', metalness: 0.8, roughness: 0.3 }),
  )
  pole.position.set(sx + 6.8, 3.7, 9.5)
  const flagGeo = new PlaneGeometry(2.8, 1.7, 14, 4)
  flagGeo.translate(1.4, 0, 0)
  const flag = new Mesh(flagGeo, new MeshLambertMaterial({ color: '#e2603b', side: DoubleSide, flatShading: true }))
  flag.position.set(sx + 6.8, 6.5, 9.5)
  flag.rotation.y = -Math.PI / 2 + 0.6
  const base = Float32Array.from(flagGeo.attributes.position.array as Float32Array)
  root.add(pole, flag)

  // a big golden trophy on a plinth beside the bay (on the open side of the screen): goal achieved
  const gold = new MeshStandardMaterial({
    color: '#f2b33d',
    metalness: 0.85,
    roughness: 0.28,
    emissive: '#5a3a00',
    emissiveIntensity: 0,
  })
  const trophy = new Group()
  const plinth = new Mesh(
    new BoxGeometry(2.2, 1.2, 2.2),
    new MeshStandardMaterial({ color: '#1f1b16', roughness: 0.6, flatShading: true }),
  )
  plinth.position.y = 0.6
  const cupProfile = [
    [0.0, 0],
    [0.7, 0],
    [0.7, 0.15],
    [0.22, 0.3],
    [0.16, 0.9],
    [0.3, 1.05],
    [0.95, 1.55],
    [1.05, 2.6],
    [0.95, 2.62],
  ].map(([x, y]) => new Vector2(x, y))
  const cup = new Mesh(new LatheGeometry(cupProfile, 10), gold)
  cup.position.y = 1.2
  for (const side of [-1, 1]) {
    const handle = new Mesh(new TorusGeometry(0.42, 0.09, 6, 12, Math.PI), gold)
    handle.rotation.z = (side * -Math.PI) / 2
    handle.position.set(side * 1.0, 3.2, 0)
    trophy.add(handle)
  }
  trophy.add(plinth, cup)
  trophy.position.set(sx + 5.4, 0, 4.4)
  trophy.rotation.y = 0.4
  root.add(trophy)

  // a lamp behind the bays so the lot is lit when the sun has gone down
  const lampPole = new Mesh(new BoxGeometry(0.22, 6.5, 0.22), new MeshLambertMaterial({ color: '#3a3532' }))
  lampPole.position.set(sx + 7.5, 3.25, -7)
  const bulbMat = new MeshStandardMaterial({ color: '#fff3d0', emissive: '#ffd98a', emissiveIntensity: 0 })
  const bulb = new Mesh(new BoxGeometry(1.4, 0.25, 0.6), bulbMat)
  bulb.position.set(sx + 6.9, 6.5, -7)
  const lamp = new PointLight('#ffd98a', 0, 34, 1.4)
  lamp.position.set(sx + 3, 6.2, -3)
  root.add(lampPole, bulb, lamp)

  /** per-frame: wave the flag, light up at night */
  const update = (time: number, night: number) => {
    const pos = flagGeo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = base[i * 3]
      const y = base[i * 3 + 1]
      pos.setZ(i, Math.sin(x * 2.2 - time * 4.5 + y * 0.6) * 0.18 * (x / 2.8))
    }
    pos.needsUpdate = true
    flagGeo.computeVertexNormals()
    bulbMat.emissiveIntensity = night * 3
    lamp.intensity = night * 160
    gold.emissiveIntensity = night * 0.8
  }

  return { root, sign, update }
}
