import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from 'three'
import { SHAPES } from './shapes'
import { stage } from './stage'

const vertex = /* glsl */ `
  attribute vec3 p0;
  attribute vec3 p1;
  attribute vec3 p2;
  attribute vec3 p3;
  attribute vec3 p4;
  attribute vec3 p5;
  attribute float aRand;

  uniform float uShape;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixel;
  uniform float uIntro;
  uniform float uPulse;
  uniform vec2 uPointer;
  uniform float uPointerOn;
  uniform float uAspect;

  varying float vMix;
  varying float vAlpha;
  varying float vHot;

  vec3 shapeAt(float i) {
    if (i < 0.5) return p0;
    if (i < 1.5) return p1;
    if (i < 2.5) return p2;
    if (i < 3.5) return p3;
    if (i < 4.5) return p4;
    return p5;
  }

  void main() {
    float s = clamp(uShape, 0.0, 5.0);
    float a = floor(s);
    float f = s - a;
    // every particle leaves a little later than the last: the morph ripples
    float t = smoothstep(0.0, 1.0, clamp((f - aRand * 0.35) / 0.65, 0.0, 1.0));
    vec3 pos = mix(shapeAt(a), shapeAt(min(a + 1.0, 5.0)), t);

    // mid-morph the cloud bursts outward along each particle's own direction
    vec3 dir = normalize(position);
    float burst = sin(t * 3.14159);
    pos += dir * burst * (0.5 + aRand * 0.9);

    // intro: particles fly in from far away
    pos = mix(dir * (9.0 + aRand * 6.0), pos, smoothstep(0.0, 1.0, clamp(uIntro * 1.4 - aRand * 0.4, 0.0, 1.0)));

    // idle breathing
    pos += 0.035 * vec3(
      sin(uTime * 0.9 + aRand * 40.0),
      cos(uTime * 0.7 + aRand * 31.0),
      sin(uTime * 0.6 + aRand * 23.0)
    );

    // click shockwave: a ring that travels outward
    float d = length(pos);
    float ring = uPulse * 4.5;
    pos += normalize(pos + 1e-4) * exp(-pow(d - ring, 2.0) * 3.0) * 0.7 * (1.0 - uPulse);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vec4 clip = projectionMatrix * mv;

    // pointer repulsion in screen space
    vec2 ndc = clip.xy / clip.w;
    vec2 dd = (ndc - uPointer) * vec2(uAspect, 1.0);
    float infl = smoothstep(0.32, 0.0, length(dd)) * uPointerOn;
    mv.xy += normalize(dd + 1e-5) * infl * 0.55;
    gl_Position = projectionMatrix * mv;

    gl_PointSize = uSize * uPixel * (0.45 + aRand * 0.95) / -mv.z;

    vMix = clamp(pos.y * 0.22 + 0.5 + (aRand - 0.5) * 0.5, 0.0, 1.0);
    vHot = step(0.965, aRand) + infl * 0.8 + burst * 0.25;
    vAlpha = 0.55 + 0.45 * sin(uTime * 1.6 + aRand * 60.0);
  }
`

const fragment = /* glsl */ `
  uniform vec3 uC1;
  uniform vec3 uC2;
  uniform vec3 uC3;
  uniform float uOpacity;
  varying float vMix;
  varying float vAlpha;
  varying float vHot;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = pow(smoothstep(0.5, 0.0, d), 1.7);
    vec3 col = mix(uC1, uC2, vMix);
    col = mix(col, uC3, clamp(vHot, 0.0, 1.0));
    gl_FragColor = vec4(col, a * vAlpha * uOpacity);
  }
`

/** Where the cloud sits for each shape, so it never sits under the copy. */
const LAYOUT_WIDE = [
  { x: 1.85, y: 0, s: 1, o: 1 },
  { x: -1.9, y: 0, s: 0.95, o: 0.9 },
  { x: 2.0, y: 0, s: 0.9, o: 0.85 },
  { x: 0, y: 0, s: 1.05, o: 0.45 },
  { x: -1.9, y: 0, s: 0.95, o: 0.9 },
  { x: 0, y: -0.1, s: 1.15, o: 1 },
]
const LAYOUT_NARROW = [
  { x: 0, y: 1.55, s: 0.56, o: 1 },
  { x: 0, y: 0, s: 0.8, o: 0.4 },
  { x: 0, y: 0, s: 0.8, o: 0.4 },
  { x: 0, y: 0, s: 0.85, o: 0.35 },
  { x: 0, y: 0, s: 0.8, o: 0.4 },
  { x: 0, y: 0.6, s: 0.85, o: 0.75 },
]

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export class ParticleField {
  private renderer: WebGLRenderer
  private scene = new Scene()
  private camera = new PerspectiveCamera(45, 1, 0.1, 100)
  private points: Points
  private stars: Points
  private material: ShaderMaterial
  private raf = 0
  private start = performance.now()
  private last = performance.now()
  private shape = 0
  private pulseT = 1
  private pointer = { x: 0, y: 0, on: 0 }
  private rot = { x: 0, y: 0 }
  private narrow = false
  private reduced: boolean
  private onResize = () => this.resize()

  /** `instant` skips the fly-in (used to render the static og.png card). */
  constructor(canvas: HTMLCanvasElement, opts: { reduced: boolean; instant?: boolean }) {
    this.reduced = opts.reduced
    this.renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' })
    this.renderer.setClearColor(0x000000, 0)
    this.camera.position.set(0, 0, 7.5)

    const mobile = matchMedia('(max-width: 768px)').matches || (navigator.hardwareConcurrency ?? 8) <= 4
    const n = mobile ? 9000 : 20000

    const geo = new BufferGeometry()
    const dirs = new Float32Array(n * 3)
    const rnd = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      // random unit vector: the burst / fly-in direction
      const u = Math.random() * 2 - 1
      const th = Math.random() * Math.PI * 2
      const r = Math.sqrt(1 - u * u)
      dirs[i * 3] = Math.cos(th) * r
      dirs[i * 3 + 1] = u
      dirs[i * 3 + 2] = Math.sin(th) * r
      rnd[i] = Math.random()
    }
    geo.setAttribute('position', new BufferAttribute(dirs, 3))
    geo.setAttribute('aRand', new BufferAttribute(rnd, 1))
    SHAPES.forEach((make, i) => geo.setAttribute(`p${i}`, new BufferAttribute(make(n), 3)))

    this.material = new ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uShape: { value: 0 },
        uTime: { value: 0 },
        uSize: { value: mobile ? 34 : 30 },
        uPixel: { value: 1 },
        uIntro: { value: opts.instant ? 1 : 0 },
        uPulse: { value: 1 },
        uPointer: { value: [0, 0] },
        uPointerOn: { value: 0 },
        uAspect: { value: 1 },
        uOpacity: { value: 1 },
        uC1: { value: new Color('#7c5cff') },
        uC2: { value: new Color('#22d3ee') },
        uC3: { value: new Color('#f5d0fe') },
      },
    })
    this.points = new Points(geo, this.material)
    this.points.frustumCulled = false
    this.scene.add(this.points)

    this.stars = makeStars(mobile ? 700 : 1600)
    this.scene.add(this.stars)

    stage.pulse = () => {
      this.pulseT = 0
    }

    this.resize()
    window.addEventListener('resize', this.onResize)
    this.loop()
  }

  private resize() {
    const w = window.innerWidth
    const h = window.innerHeight
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75)
    this.renderer.setPixelRatio(dpr)
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.narrow = w < 900
    this.material.uniforms.uPixel.value = dpr * Math.min(1.25, Math.max(0.75, h / 900))
    this.material.uniforms.uAspect.value = w / h
  }

  private loop = () => {
    this.raf = requestAnimationFrame(this.loop)
    const now = performance.now()
    const time = (now - this.start) / 1000
    // frame-rate independent easing: k is the per-frame factor at 60fps
    const dt = Math.min(0.1, (now - this.last) / 1000)
    this.last = now
    const ease = (k: number) => 1 - Math.pow(1 - k, dt * 60)
    const u = this.material.uniforms

    // ease toward the scroll target; slower for reduced motion so jumps don't flash
    this.shape = lerp(this.shape, stage.target, ease(this.reduced ? 0.2 : 0.06))
    if (Math.abs(this.shape - stage.target) < 0.0005) this.shape = stage.target
    u.uShape.value = this.shape
    u.uTime.value = this.reduced ? 0 : time
    u.uIntro.value = lerp(u.uIntro.value, stage.intro, ease(0.035))

    this.pulseT = Math.min(1, this.pulseT + dt * 0.72)
    u.uPulse.value = this.pulseT

    const p = stage.pointer
    this.pointer.x = lerp(this.pointer.x, p.x, ease(0.12))
    this.pointer.y = lerp(this.pointer.y, p.y, ease(0.12))
    this.pointer.on = lerp(this.pointer.on, p.active && !this.narrow ? 1 : 0, ease(0.08))
    u.uPointer.value = [this.pointer.x, this.pointer.y]
    u.uPointerOn.value = this.pointer.on

    // layout for the current (fractional) shape
    const L = this.narrow ? LAYOUT_NARROW : LAYOUT_WIDE
    const i = Math.floor(this.shape)
    const f = this.shape - i
    const A = L[Math.min(i, 5)]
    const B = L[Math.min(i + 1, 5)]
    const k = f * f * (3 - 2 * f)
    const widen = Math.min(1.25, this.camera.aspect / 1.7)
    this.points.position.x = lerp(A.x, B.x, k) * (this.narrow ? 1 : widen)
    this.points.position.y = lerp(A.y, B.y, k)
    this.points.scale.setScalar(lerp(A.s, B.s, k))
    u.uOpacity.value = lerp(A.o, B.o, k)

    // slow spin plus a tilt toward the pointer
    this.rot.x = lerp(this.rot.x, this.pointer.y * 0.25, ease(0.05))
    this.rot.y = lerp(this.rot.y, this.pointer.x * 0.35, ease(0.05))
    const spin = this.reduced ? 0 : time * 0.08
    this.points.rotation.set(this.rot.x + 0.15, spin + this.rot.y, 0)
    this.stars.rotation.y = spin * 0.25
    this.stars.rotation.x = spin * 0.1

    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    cancelAnimationFrame(this.raf)
    window.removeEventListener('resize', this.onResize)
    this.points.geometry.dispose()
    this.material.dispose()
    this.stars.geometry.dispose()
    ;(this.stars.material as ShaderMaterial).dispose()
    this.renderer.dispose()
  }
}

/** a sparse, dim backdrop of distant stars */
function makeStars(n: number) {
  const pos = new Float32Array(n * 3)
  const rnd = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const u = Math.random() * 2 - 1
    const th = Math.random() * Math.PI * 2
    const r = 14 + Math.random() * 22
    const s = Math.sqrt(1 - u * u)
    pos[i * 3] = Math.cos(th) * s * r
    pos[i * 3 + 1] = u * r
    pos[i * 3 + 2] = Math.sin(th) * s * r - 8
    rnd[i] = Math.random()
  }
  const geo = new BufferGeometry()
  geo.setAttribute('position', new BufferAttribute(pos, 3))
  geo.setAttribute('aRand', new BufferAttribute(rnd, 1))
  const mat = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute float aRand;
      varying float vA;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (1.0 + aRand * 2.2) * (30.0 / -mv.z);
        vA = 0.25 + aRand * 0.6;
      }
    `,
    fragmentShader: /* glsl */ `
      varying float vA;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        gl_FragColor = vec4(0.78, 0.82, 1.0, smoothstep(0.5, 0.0, d) * vA);
      }
    `,
  })
  const pts = new Points(geo, mat)
  pts.frustumCulled = false
  return pts
}
