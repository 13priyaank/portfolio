import {
  ACESFilmicToneMapping,
  BackSide,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DodecahedronGeometry,
  Fog,
  Group,
  HemisphereLight,
  IcosahedronGeometry,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshLambertMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  Quaternion,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
} from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { makeCar, type Car } from './car'
import { makeDestination } from './destination'
import { makeArch, makeSign, repaint } from './signs'
import { EXITS, stage } from './stage'
import { LOT_Z, lotFrame, newSky, rng, ROAD_HALF, ROAD_LEN, roadX, roadYaw, skyAt, terrainH } from './world'

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const smooth = (t: number) => t * t * (3 - 2 * t)

/** Camera position (car-local: +x right, +y up, +z behind) and look-at offset for each section. */
const SHOTS = [
  { pos: [9.5, 2.6, 10], look: [-1.6, 1.2, -2] }, // hero: three-quarter beauty shot
  { pos: [3.6, 3.3, 11], look: [0, 1.3, -9] }, // about: classic chase cam
  { pos: [-4.5, 2.4, 9.5], look: [0, 1.2, -7] }, // work: low over the left shoulder
  { pos: [0, 9, 16], look: [0, 0.5, -12] }, // projects: high, showing the road ahead
  { pos: [6, 1.6, 6.5], look: [0, 1.2, -6] }, // stack: low, fast-feeling
  { pos: [-3.2, 5.6, 14], look: [2.2, 1.4, -4] }, // contact: high over the shoulder, car, sign, flag and trophy in frame
]

const SKY_VERT = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_Position.z = gl_Position.w; // always at the far plane
  }
`
const SKY_FRAG = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uHorizon;
  uniform vec3 uSunDir;
  uniform vec3 uSunColor;
  uniform float uNight;
  varying vec3 vDir;
  void main() {
    float h = vDir.y;
    vec3 col = mix(uHorizon, uTop, pow(clamp(h, 0.0, 1.0), 0.55));
    col = mix(col, uHorizon * 0.7, smoothstep(0.0, -0.2, h));
    float s = max(dot(vDir, uSunDir), 0.0);
    // sun (or moon) disc plus a broad glow
    col += uSunColor * (smoothstep(0.9993, 0.9996, s) * 1.6 + pow(s, 12.0) * 0.35 * (1.0 - uNight * 0.6));
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

export class RoadTrip {
  private renderer: WebGLRenderer
  private scene = new Scene()
  private camera: PerspectiveCamera
  private car: Car
  private sun = new DirectionalLight('#ffffff', 2)
  private hemi = new HemisphereLight('#ffffff', '#e3b47c', 1)
  private skyMat: ShaderMaterial
  private starMat: ShaderMaterial
  private signs: Group[] = []
  /** the finish arch and the reserved-bay sign: repainted and lit like the road signs */
  private extraSigns: Group[] = []
  private arch!: Group
  private dest!: ReturnType<typeof makeDestination>
  private pose = { x: 0, z: 0, yaw: 0 }
  private dust: InstancedMesh
  private dustLife: { p: Vector3; v: Vector3; age: number }[] = []
  private skyState = newSky()
  private raf = 0
  private last = performance.now()
  private start = performance.now()
  /** start wherever the page already is (a reload halfway down shouldn't replay the whole drive) */
  private carP = stage.progress
  private prevPos = new Vector3()
  private speed = 0
  private yawPrev = 0
  private honkT = 0
  private narrow = false
  private mobile: boolean
  private shot = { pos: new Vector3(), look: new Vector3() }
  private tmp = { a: new Vector3(), b: new Vector3(), m: new Matrix4(), q: new Quaternion(), s: new Vector3(), o: new Object3D() }
  private onResize = () => this.resize()
  private reduced: boolean

  constructor(canvas: HTMLCanvasElement, opts: { reduced: boolean }) {
    this.reduced = opts.reduced
    this.mobile = matchMedia('(max-width: 768px)').matches || (navigator.hardwareConcurrency ?? 8) <= 4
    this.renderer = new WebGLRenderer({ canvas, antialias: !this.mobile, powerPreference: 'high-performance' })
    this.renderer.toneMapping = ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.05
    this.camera = new PerspectiveCamera(50, 1, 0.1, 1500)
    this.scene.fog = new Fog('#fde4c3', 70, this.mobile ? 380 : 520)

    this.scene.add(this.sun, this.sun.target, this.hemi)

    // sky dome + stars
    this.skyMat = new ShaderMaterial({
      vertexShader: SKY_VERT,
      fragmentShader: SKY_FRAG,
      side: BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        uTop: { value: new Color() },
        uHorizon: { value: new Color() },
        uSunDir: { value: new Vector3(0, 0.3, -1).normalize() },
        uSunColor: { value: new Color() },
        uNight: { value: 0 },
      },
    })
    const sky = new Mesh(new SphereGeometry(1000, 32, 16), this.skyMat)
    sky.renderOrder = -1
    sky.frustumCulled = false
    this.scene.add(sky)
    this.starMat = this.makeStars()

    this.buildTerrain()
    this.buildRoad()
    this.buildScenery()
    this.buildSigns()
    this.dest = makeDestination()
    this.scene.add(this.dest.root)
    this.extraSigns.push(this.dest.sign)

    this.car = makeCar()
    this.scene.add(this.car.root)

    // dust kicked up behind the wheels
    this.dust = new InstancedMesh(
      new IcosahedronGeometry(0.35, 0),
      new MeshLambertMaterial({ color: '#e7cfa5', flatShading: true }),
      40,
    )
    this.dust.frustumCulled = false
    for (let i = 0; i < 40; i++) this.dustLife.push({ p: new Vector3(), v: new Vector3(), age: 1 })
    this.scene.add(this.dust)

    stage.honk = () => {
      this.honkT = 1
    }

    // the sign text uses the display font; repaint once it has loaded
    document.fonts?.ready.then(() => [...this.signs, ...this.extraSigns].forEach((s) => repaint(s, s.userData.spec)))

    this.resize()
    window.addEventListener('resize', this.onResize)
    this.loop()
  }

  /* ---------------------------------------------------------- world */

  private buildTerrain() {
    const W = 380
    const L = ROAD_LEN + 520
    const geo = new PlaneGeometry(W, L, this.mobile ? 48 : 80, this.mobile ? 200 : 330)
    geo.rotateX(-Math.PI / 2)
    geo.translate(0, 0, -ROAD_LEN / 2)
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const z = pos.getZ(i)
      // keep the terrain centred on the winding road
      const x = pos.getX(i) + roadX(z) * 0.8
      pos.setX(i, x)
      pos.setY(i, terrainH(x, z))
    }
    const flat = geo.toNonIndexed()
    const p = flat.attributes.position
    const colors = new Float32Array(p.count * 3)
    const sand = new Color('#e9c38d')
    const dune = new Color('#e0a86c')
    const rock = new Color('#c8744a')
    const mesa = new Color('#9c4a34')
    const c = new Color()
    const r = rng(7)
    // one colour per triangle, from its average height, with a little noise
    for (let i = 0; i < p.count; i += 3) {
      const h = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3
      if (h < 2) c.copy(sand).lerp(dune, Math.max(0, h) / 2)
      else if (h < 9) c.copy(dune).lerp(rock, (h - 2) / 7)
      else c.copy(rock).lerp(mesa, Math.min(1, (h - 9) / 14))
      c.offsetHSL(0, 0, (r() - 0.5) * 0.04)
      for (let k = 0; k < 3; k++) c.toArray(colors, (i + k) * 3)
    }
    flat.setAttribute('color', new BufferAttribute(colors, 3))
    flat.computeVertexNormals()
    const mesh = new Mesh(flat, new MeshLambertMaterial({ vertexColors: true, flatShading: true }))
    this.scene.add(mesh)
  }

  /** A flat ribbon that follows the road curve, `offset` metres right of centre. */
  private strip(offset: number, width: number, y: number, z0: number, z1: number, step = 2) {
    const n = Math.ceil((z0 - z1) / step)
    const verts = new Float32Array((n + 1) * 6)
    const idx: number[] = []
    for (let i = 0; i <= n; i++) {
      const z = z0 - i * step
      const yaw = roadYaw(z)
      // right-hand vector of the travel direction
      const rx = Math.cos(yaw)
      const rz = -Math.sin(yaw)
      const cx = roadX(z) + rx * offset
      const cz = z + rz * offset
      verts.set([cx - rx * width, y, cz - rz * width, cx + rx * width, y, cz + rz * width], i * 6)
      if (i < n) {
        const a = i * 2
        idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3)
      }
    }
    const geo = new BufferGeometry()
    geo.setAttribute('position', new BufferAttribute(verts, 3))
    geo.setIndex(idx)
    geo.computeVertexNormals()
    return geo
  }

  private buildRoad() {
    const z0 = 80
    const z1 = -ROAD_LEN - 220
    const asphalt = new Mesh(this.strip(0, ROAD_HALF, 0.06, z0, z1), new MeshLambertMaterial({ color: '#3b3634' }))
    const shoulder = new Mesh(this.strip(0, ROAD_HALF + 1.4, 0.03, z0, z1, 3), new MeshLambertMaterial({ color: '#cdb08a' }))
    const lineMat = new MeshLambertMaterial({ color: '#f6ecdc' })
    const edgeL = new Mesh(this.strip(-ROAD_HALF + 0.35, 0.09, 0.08, z0, z1), lineMat)
    const edgeR = new Mesh(this.strip(ROAD_HALF - 0.35, 0.09, 0.08, z0, z1), lineMat)
    this.scene.add(shoulder, asphalt, edgeL, edgeR)

    // dashed mustard centre line
    const count = Math.ceil((z0 - z1) / 7)
    const dashes = new InstancedMesh(new BoxGeometry(0.2, 0.02, 2.8), new MeshLambertMaterial({ color: '#f2b33d' }), count)
    const o = this.tmp.o
    for (let i = 0; i < count; i++) {
      const z = z0 - i * 7
      o.position.set(roadX(z), 0.08, z)
      o.rotation.set(0, roadYaw(z), 0)
      o.updateMatrix()
      dashes.setMatrixAt(i, o.matrix)
    }
    this.scene.add(dashes)
  }

  private buildScenery() {
    const r = rng(42)
    const o = this.tmp.o
    const zMin = -ROAD_LEN - 200
    const spot = lotFrame().spot
    const place = (minD: number, maxD: number) => {
      for (;;) {
        const z = 60 - r() * (60 - zMin)
        const side = r() < 0.5 ? -1 : 1
        const x = roadX(z) + side * (minD + r() * (maxD - minD))
        // nothing grows in the parking lot
        if (Math.hypot(x - spot.x, z - spot.z) > 24) return { x, z, y: terrainH(x, z) }
      }
    }

    // saguaro cacti: a trunk and two arms merged into one geometry
    const trunk = new CylinderGeometry(0.42, 0.5, 5, 7)
    trunk.translate(0, 2.5, 0)
    const armL = new CylinderGeometry(0.3, 0.3, 1.6, 6)
    armL.translate(-0.95, 3.0, 0)
    const elbowL = new CylinderGeometry(0.3, 0.3, 1.1, 6)
    elbowL.rotateZ(Math.PI / 2)
    elbowL.translate(-0.55, 2.25, 0)
    const armR = new CylinderGeometry(0.28, 0.28, 1.2, 6)
    armR.translate(0.9, 3.6, 0)
    const elbowR = new CylinderGeometry(0.28, 0.28, 0.9, 6)
    elbowR.rotateZ(Math.PI / 2)
    elbowR.translate(0.5, 3.05, 0)
    const cactusGeo = mergeGeometries([trunk, armL, elbowL, armR, elbowR])!
    const nC = this.mobile ? 90 : 170
    const cacti = new InstancedMesh(cactusGeo, new MeshLambertMaterial({ color: '#5d8a4a', flatShading: true }), nC)
    for (let i = 0; i < nC; i++) {
      const { x, y, z } = place(9, 80)
      o.position.set(x, y - 0.2, z)
      o.rotation.set(0, r() * Math.PI * 2, 0)
      o.scale.setScalar(0.7 + r() * 0.8)
      o.updateMatrix()
      cacti.setMatrixAt(i, o.matrix)
    }

    // boulders
    const nR = this.mobile ? 120 : 240
    const rocks = new InstancedMesh(
      new DodecahedronGeometry(1, 0),
      new MeshLambertMaterial({ color: '#b9693f', flatShading: true }),
      nR,
    )
    for (let i = 0; i < nR; i++) {
      const { x, y, z } = place(8, 120)
      const s = 0.4 + r() * r() * 3.2
      o.position.set(x, y + s * 0.2, z)
      o.rotation.set(r() * 3, r() * 3, r() * 3)
      o.scale.set(s * (0.8 + r() * 0.6), s * (0.5 + r() * 0.4), s * (0.8 + r() * 0.6))
      o.updateMatrix()
      rocks.setMatrixAt(i, o.matrix)
    }

    // telephone poles down the left verge
    // poles start a little way down the road so none stands in front of the hero copy
    const step = 30
    const nP = Math.ceil((ROAD_LEN + 140) / step)
    const poleGeo = mergeGeometries([
      new BoxGeometry(0.28, 8, 0.28).translate(0, 4, 0),
      new BoxGeometry(2.6, 0.18, 0.18).translate(0, 7.3, 0),
    ])!
    const poles = new InstancedMesh(poleGeo, new MeshLambertMaterial({ color: '#6b4a35', flatShading: true }), nP)
    for (let i = 0; i < nP; i++) {
      const z = -60 - i * step
      const yaw = roadYaw(z)
      o.position.set(roadX(z) - Math.cos(yaw) * 10, 0, z + Math.sin(yaw) * 10)
      o.rotation.set(0, yaw, 0)
      o.scale.setScalar(1)
      o.updateMatrix()
      poles.setMatrixAt(i, o.matrix)
    }
    this.scene.add(cacti, rocks, poles)
  }

  private buildSigns() {
    const specs = [
      { kind: 'welcome' as const, top: 'MILE 0', main: 'PRIYANK WADIWALA' },
      ...EXITS.slice(0, 4).map((e) => ({ kind: 'exit' as const, ...e })),
    ]
    for (const spec of specs) {
      const s = makeSign(spec)
      s.userData.spec = spec
      this.signs.push(s)
      this.scene.add(s)
    }
    // the last stop is a finish arch across the road rather than a roadside sign
    this.arch = makeArch({ kind: 'finish', top: 'DESTINATION', main: EXITS[4].main })
    this.extraSigns.push(this.arch)
    this.scene.add(this.arch)
    this.placeSigns()
  }

  /** Put each sign just before the point where its section takes over the screen. */
  placeSigns() {
    const zs = [-24, ...stage.milestones.slice(0, 4).map((m) => -m * ROAD_LEN - 14)]
    this.signs.forEach((s, i) => {
      const z = zs[i]
      const yaw = roadYaw(z)
      s.position.set(roadX(z) + Math.cos(yaw) * 9.5, 0, z - Math.sin(yaw) * 9.5)
      s.rotation.y = yaw
    })
    // arch just past the point where the contact section begins, but never beyond the lot turn-off
    const za = Math.max(-stage.milestones[4] * ROAD_LEN - 10, LOT_Z + 22)
    this.arch.position.set(roadX(za), 0, za)
    this.arch.rotation.y = roadYaw(za)
  }

  private makeStars() {
    const n = 900
    const pos = new Float32Array(n * 3)
    const r = rng(3)
    for (let i = 0; i < n; i++) {
      const u = 0.08 + r() * 0.92
      const th = r() * Math.PI * 2
      const s = Math.sqrt(1 - u * u)
      pos.set([Math.cos(th) * s * 900, u * 900, Math.sin(th) * s * 900], i * 3)
    }
    const geo = new BufferGeometry()
    geo.setAttribute('position', new BufferAttribute(pos, 3))
    const mat = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      fog: false,
      uniforms: { uNight: { value: 0 } },
      vertexShader: /* glsl */ `
        varying float vB;
        void main() {
          vB = fract(sin(dot(position.xy, vec2(12.9898, 78.233))) * 43758.5453);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_Position.z = gl_Position.w * 0.9999;
          gl_PointSize = 1.2 + vB * 2.2;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uNight;
        varying float vB;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          gl_FragColor = vec4(vec3(1.0, 0.97, 0.9), smoothstep(0.5, 0.0, d) * uNight * (0.4 + vB * 0.6));
        }
      `,
    })
    const pts = new Points(geo, mat)
    pts.frustumCulled = false
    this.scene.add(pts)
    return mat
  }

  /* ---------------------------------------------------------- frame */

  private resize() {
    const w = window.innerWidth
    const h = window.innerHeight
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.mobile ? 1.5 : 1.75))
    this.renderer.setSize(w, h, false)
    this.narrow = w < 900
    this.camera.aspect = w / h
    this.camera.fov = this.narrow ? 62 : 48
    // content sits on the left on wide screens: shift the view so the car sits right of centre;
    // on phones push it down so the hero copy has the sky
    if (this.narrow) this.camera.setViewOffset(w, h, 0, -h * 0.16, w, h)
    else this.camera.setViewOffset(w, h, -w * 0.24, 0, w, h)
    this.camera.updateProjectionMatrix()
  }

  /** Camera framing for the current scroll position, blended between section shots. */
  private shotAt(p: number) {
    const keys = [0, ...stage.milestones]
    let i = 0
    while (i < keys.length - 1 && p >= keys[i + 1]) i++
    const a = SHOTS[i]
    const b = SHOTS[Math.min(i + 1, SHOTS.length - 1)]
    // hold each shot, then blend over the last 35% of the stretch before the next section
    const span = (keys[i + 1] ?? 1) - keys[i]
    const t = i + 1 < keys.length ? smooth(Math.min(1, Math.max(0, ((p - keys[i]) / span - 0.65) / 0.35))) : 0
    this.shot.pos.set(lerp(a.pos[0], b.pos[0], t), lerp(a.pos[1], b.pos[1], t), lerp(a.pos[2], b.pos[2], t))
    this.shot.look.set(lerp(a.look[0], b.look[0], t), lerp(a.look[1], b.look[1], t), lerp(a.look[2], b.look[2], t))
    return this.shot
  }

  /** Right-hand lane position at z. */
  private lane(z: number) {
    const yaw = roadYaw(z)
    return { x: roadX(z) + Math.cos(yaw) * 1.9, z: z - Math.sin(yaw) * 1.9, yaw }
  }

  /**
   * Where the car is for a trip fraction p: in the lane until the contact section,
   * then it carries on to the turn-off and curves into the reserved bay, slowing to a stop.
   */
  private carPose(p: number) {
    const out = this.pose
    const m = Math.min(stage.milestones[4], 0.985)
    if (p <= m) {
      const l = this.lane(-p * ROAD_LEN)
      out.x = l.x
      out.z = l.z
      out.yaw = l.yaw
      return out
    }
    const L = lotFrame()
    const zTurn = LOT_Z + 12
    const z0 = -m * ROAD_LEN
    const straight = Math.max(0, z0 - zTurn)
    const curve = 24
    // ease out: arrive at speed, roll to a stop in the bay
    const t = Math.min(1, (p - m) / (1 - m))
    const s = (1 - (1 - t) * (1 - t)) * (straight + curve)
    if (s < straight) {
      const l = this.lane(z0 - s)
      out.x = l.x
      out.z = l.z
      out.yaw = l.yaw
      return out
    }
    // cubic bezier: lane at the turn-off → on along the road → lined up with the bay → parked
    const u = (s - straight) / curve
    const a = this.lane(zTurn)
    const b = this.lane(LOT_Z + 2)
    const c = { x: L.road.x + L.right.x * (17 - 8), z: L.road.z + L.right.z * (17 - 8) }
    const d = L.spot
    const iu = 1 - u
    const k0 = iu * iu * iu
    const k1 = 3 * iu * iu * u
    const k2 = 3 * iu * u * u
    const k3 = u * u * u
    out.x = k0 * a.x + k1 * b.x + k2 * c.x + k3 * d.x
    out.z = k0 * a.z + k1 * b.z + k2 * c.z + k3 * d.z
    // heading from the curve's tangent
    const tx = 3 * iu * iu * (b.x - a.x) + 6 * iu * u * (c.x - b.x) + 3 * u * u * (d.x - c.x)
    const tz = 3 * iu * iu * (b.z - a.z) + 6 * iu * u * (c.z - b.z) + 3 * u * u * (d.z - c.z)
    out.yaw = u >= 1 ? L.parkedYaw : Math.atan2(-tx, -tz)
    return out
  }

  private loop = () => {
    this.raf = requestAnimationFrame(this.loop)
    const now = performance.now()
    const dt = Math.min(0.1, (now - this.last) / 1000)
    this.last = now
    const time = (now - this.start) / 1000
    const ease = (k: number) => 1 - Math.pow(1 - k, dt * 60)

    // the car eases toward where the scroll says it should be
    this.carP = lerp(this.carP, stage.progress, ease(this.reduced ? 0.25 : 0.07))
    const pose = this.carPose(this.carP)
    const car = this.car
    car.root.position.set(pose.x, 0, pose.z)
    // first frame: nothing to measure against yet
    if (!this.camReady) this.prevPos.copy(car.root.position)
    const dist = car.root.position.distanceTo(this.prevPos)
    this.prevPos.copy(car.root.position)
    const mps = dt > 0 ? dist / dt : 0
    this.speed = lerp(this.speed, Math.min(240, mps * 2.2), ease(0.08))
    stage.speed = this.speed
    stage.odometer = this.carP * 420

    const yaw = pose.yaw
    const rx = Math.cos(yaw)
    const rz = -Math.sin(yaw)
    car.root.rotation.y = yaw
    const yawRate = dt > 0 ? (yaw - this.yawPrev) / dt : 0
    this.yawPrev = yaw
    const sp = this.speed / 240
    this.honkT = Math.max(0, this.honkT - dt * 2.2)
    const idle = this.reduced ? 0 : 1
    car.body.position.y = (Math.sin(time * 26) * 0.012 * (0.3 + sp) + Math.sin(this.honkT * Math.PI) * 0.18) * idle
    car.body.rotation.z = Math.max(-0.06, Math.min(0.06, -yawRate * 0.25))
    car.body.rotation.x = Math.sin(time * 13) * 0.004 * idle
    for (const w of car.wheels) w.rotation.x -= dist / 0.44

    // dust behind the rear wheels when moving
    this.updateDust(dt, sp, rx, rz, yaw)

    // time of day
    const s = skyAt(this.carP, this.skyState)
    stage.night = s.night
    this.skyMat.uniforms.uTop.value.copy(s.top)
    this.skyMat.uniforms.uHorizon.value.copy(s.horizon)
    this.skyMat.uniforms.uSunColor.value.copy(s.sun)
    this.skyMat.uniforms.uNight.value = s.night
    this.starMat.uniforms.uNight.value = s.night
    const el = (s.sunElev * Math.PI) / 180
    const az = 0.35
    const dir = this.skyMat.uniforms.uSunDir.value as Vector3
    dir.set(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el)).normalize()
    this.sun.color.copy(s.sun)
    this.sun.intensity = s.sunInt
    this.sun.position.copy(car.root.position).addScaledVector(dir, 200)
    this.sun.target.position.copy(car.root.position)
    this.hemi.color.copy(s.top).lerp(s.horizon, 0.5)
    this.hemi.groundColor.copy(s.ground)
    this.hemi.intensity = s.hemiInt
    ;(this.scene.fog as Fog).color.copy(s.horizon)

    const flash = this.honkT > 0 ? (Math.sin(this.honkT * 30) > 0 ? 3 : 0) : 0
    car.lights.emissiveIntensity = 0.4 + s.night * 3.2 + flash
    car.tail.emissiveIntensity = 0.5 + s.night * 2.5
    car.beam.intensity = s.night * 180 + flash * 30
    for (const sign of [...this.signs, ...this.extraSigns]) {
      const face = sign.userData.face
      face.emissiveIntensity = s.night * 0.45
    }
    this.dest.update(time, s.night)

    // camera: section framing, softened, plus a little pointer parallax
    const shot = this.shotAt(this.carP)
    const px = this.narrow ? 0 : stage.pointer.x
    const py = this.narrow ? 0 : stage.pointer.y
    const camLocal = this.tmp.a.set(shot.pos.x + px * 1.2, shot.pos.y + py * 0.6, shot.pos.z)
    const lookLocal = this.tmp.b.copy(shot.look)
    camLocal.applyAxisAngle(Y, yaw).add(car.root.position)
    lookLocal.applyAxisAngle(Y, yaw).add(car.root.position)
    // keep the camera above the dunes
    camLocal.y = Math.max(camLocal.y, terrainH(camLocal.x, camLocal.z) + 1.2)
    if (!this.camReady) {
      this.camera.position.copy(camLocal)
      this.lookAt.copy(lookLocal)
      this.camReady = true
    }
    this.camera.position.lerp(camLocal, ease(0.08))
    this.lookAt.lerp(lookLocal, ease(0.1))
    this.camera.lookAt(this.lookAt)

    this.renderer.render(this.scene, this.camera)
  }

  private camReady = false
  private lookAt = new Vector3()

  private updateDust(dt: number, sp: number, rx: number, rz: number, yaw: number) {
    const back = this.tmp.s.set(Math.sin(yaw), 0, Math.cos(yaw))
    if (sp > 0.06 && !this.reduced) {
      const p = this.dustLife.find((d) => d.age >= 1)
      if (p) {
        const side = Math.random() < 0.5 ? -1 : 1
        p.p.copy(this.car.root.position).addScaledVector(back, 2.2)
        p.p.x += rx * side * 0.95
        p.p.z += rz * side * 0.95
        p.p.y = 0.3
        p.v.set((Math.random() - 0.5) * 1.5, 0.8 + Math.random(), 0).addScaledVector(back, 2 + sp * 6)
        p.age = 0
      }
    }
    const m = this.tmp.m
    this.dustLife.forEach((d, i) => {
      d.age = Math.min(1, d.age + dt * 1.1)
      d.p.addScaledVector(d.v, dt)
      const sc = d.age >= 1 ? 0 : Math.sin(d.age * Math.PI) * (0.6 + d.age * 1.4)
      m.compose(d.p, this.tmp.q.identity(), this.tmp.a.setScalar(sc))
      this.dust.setMatrixAt(i, m)
    })
    this.dust.instanceMatrix.needsUpdate = true
  }

  dispose() {
    cancelAnimationFrame(this.raf)
    window.removeEventListener('resize', this.onResize)
    this.scene.traverse((o) => {
      if (o instanceof Mesh || o instanceof Points || o instanceof InstancedMesh) {
        o.geometry.dispose()
        const mats = Array.isArray(o.material) ? o.material : [o.material]
        mats.forEach((m) => m.dispose())
      }
    })
    this.renderer.dispose()
  }
}

const Y = new Vector3(0, 1, 0)
