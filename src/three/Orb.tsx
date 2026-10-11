import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { stage } from '../lib/stage'
import { isNarrow } from '../lib/env'

const ACCENT = new THREE.Color('#e8b04a')
const BASE = new THREE.Color('#cfcbc2')

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uSpread;
  uniform float uSize;
  uniform float uPx;
  uniform vec3 uMouse;
  uniform float uPulseT;
  uniform vec3 uPulseO;
  attribute vec3 aRand;
  attribute float aSeed;
  varying float vFade;
  varying float vHot;
  varying float vPush;
  void main() {
    vec3 n = normalize(position);
    vec3 p = position;
    // slow organic breathing
    float w = sin(p.x * 2.1 + uTime * 0.5) + sin(p.y * 2.7 - uTime * 0.4) + sin(p.z * 2.3 + uTime * 0.3);
    p += n * w * 0.03;
    // cursor pushes nearby points outward
    float d = distance(p, uMouse);
    float push = smoothstep(0.7, 0.0, d);
    p += n * push * 0.2;
    // click shockwave: a ring travels over the sphere from where you clicked
    float pd = distance(n, normalize(uPulseO));
    float wave = exp(-pow((pd - uPulseT * 2.4) * 3.2, 2.0)) * exp(-uPulseT * 1.2);
    p += n * wave * 0.38;
    push = max(push, wave);
    // scatter (used by the intro "assemble")
    float s = uSpread * uSpread;
    p += aRand * 3.2 * s;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.55 + aSeed * 0.9) * (1.0 + push * 1.1) * uPx * (5.0 / -mv.z);
    vFade = clamp(1.0 - (-mv.z - 3.6) / 3.0, 0.15, 1.0);
    vHot = step(0.965, aSeed);
    vPush = push;
  }
`

const fragment = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uAccent;
  uniform float uDim;
  uniform float uEnergy;
  varying float vFade;
  varying float vHot;
  varying float vPush;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    if (r > 0.5) discard;
    float a = smoothstep(0.5, 0.08, r);
    vec3 col = mix(uBase, uAccent, clamp(vHot + vPush * 0.9 + uEnergy * 0.3, 0.0, 1.0));
    gl_FragColor = vec4(col, a * vFade * uDim * 0.9);
  }
`

function fibonacciSphere(n: number) {
  const pos = new Float32Array(n * 3)
  const rand = new Float32Array(n * 3)
  const seed = new Float32Array(n)
  const ga = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const t = ga * i
    pos.set([Math.cos(t) * r, y, Math.sin(t) * r], i * 3)
    rand.set([Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1], i * 3)
    seed[i] = Math.random()
  }
  return { pos, rand, seed }
}

export function Orb({ reduced = false }: { reduced?: boolean }) {
  const root = useRef<THREE.Group>(null!)
  const tilt = useRef<THREE.Group>(null!)
  const spin = useRef<THREE.Group>(null!)
  const ring = useRef<THREE.Mesh>(null!)
  const wire = useRef<THREE.LineSegments>(null!)
  const matRef = useRef<THREE.ShaderMaterial>(null!)
  const { viewport, gl } = useThree()
  const narrow = isNarrow()
  const count = narrow ? 1800 : 3600

  const { geometry, uniforms } = useMemo(() => {
    const { pos, rand, seed } = fibonacciSphere(count)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aRand', new THREE.BufferAttribute(rand, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    const u = {
      uTime: { value: 0 },
      uSpread: { value: 1 },
      uSize: { value: narrow ? 2.8 : 2.4 },
      uPx: { value: 1 },
      uMouse: { value: new THREE.Vector3(9, 9, 9) },
      uPulseT: { value: 99 },
      uPulseO: { value: new THREE.Vector3(0, 0, 1) },
      uEnergy: { value: 0 },
      uBase: { value: BASE },
      uAccent: { value: ACCENT },
      uDim: { value: 1 },
    }
    return { geometry: g, uniforms: u }
  }, [count, narrow])

  const wireGeo = useMemo(() => new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(0.985, 2)), [])
  const tmp = useMemo(() => new THREE.Vector3(), [])
  const slow = useRef({ t: 0, n: 0, done: false })
  const first = useRef(false)

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    const { pose, mouse } = stage
    const wide = narrow ? 0.28 : 1

    // Adaptive quality: if the device can't hold ~40fps, drop the pixel ratio once.
    const s = slow.current
    if (!s.done) {
      s.t += dtRaw
      s.n++
      if (s.n === 90) {
        if (s.t / s.n > 0.026) state.setDpr(1)
        s.done = true
      }
    }

    // placement: pose is tweened by GSAP, we just smooth the last bit
    const tx = pose.x * (viewport.width / 2) * wide
    const ty = pose.y * (viewport.height / 2) + (narrow ? viewport.height * 0.12 : 0)
    const k = narrow ? 0.8 : 1
    if (reduced || !first.current) {
      first.current = true
      root.current.position.set(tx, ty, 0)
      root.current.scale.setScalar(pose.s * k)
    } else {
      root.current.position.x = THREE.MathUtils.damp(root.current.position.x, tx, 5, dt)
      root.current.position.y = THREE.MathUtils.damp(root.current.position.y, ty, 5, dt)
      root.current.scale.setScalar(THREE.MathUtils.damp(root.current.scale.x, pose.s * k, 5, dt))
    }

    // cursor-reactive tilt
    if (!reduced) {
      tilt.current.rotation.x = THREE.MathUtils.damp(tilt.current.rotation.x, -mouse.y * 0.35, 3, dt)
      tilt.current.rotation.y = THREE.MathUtils.damp(tilt.current.rotation.y, mouse.x * 0.45, 3, dt)
      spin.current.rotation.y += dt * (pose.spin + stage.energy * 0.7)
      ring.current.rotation.z += dt * 0.05
    }

    // cursor position in the sphere's local space (for the point push)
    tmp.set(mouse.x * viewport.width * 0.5, mouse.y * viewport.height * 0.5, 1.1)
    spin.current.worldToLocal(tmp)
    if (!reduced) matRef.current.uniforms.uMouse.value.copy(tmp)

    // write through the live material so we always hit the uniforms three.js actually uses
    const u = matRef.current.uniforms
    u.uTime.value += dt
    if (stage.pulse.fresh) {
      stage.pulse.fresh = false
      u.uPulseO.value.copy(tmp)
      u.uPulseT.value = 0
    } else if (u.uPulseT.value < 50) {
      u.uPulseT.value += dt
    }
    u.uEnergy.value = stage.energy
    u.uSpread.value = pose.spread
    u.uDim.value = pose.dim * (narrow ? 0.5 : 1)
    u.uPx.value = gl.getPixelRatio()
    ;(wire.current.material as THREE.LineBasicMaterial).opacity = pose.wire * 0.16 * Math.min(1, pose.dim * 1.6) * (narrow ? 0.6 : 1) * (1 - pose.spread)
    ;(ring.current.material as THREE.MeshBasicMaterial).opacity = (1 - pose.spread) * Math.min(0.5, pose.dim * 0.6)
  })

  return (
    <group ref={root}>
      <group ref={tilt}>
        <group ref={spin}>
          <points geometry={geometry} frustumCulled={false}>
            <shaderMaterial
              ref={matRef}
              uniforms={uniforms}
              vertexShader={vertex}
              fragmentShader={fragment}
              transparent
              depthWrite={false}
            />
          </points>
          <lineSegments ref={wire} geometry={wireGeo}>
            <lineBasicMaterial color="#e9e6df" transparent opacity={0} depthWrite={false} />
          </lineSegments>
        </group>
        <mesh ref={ring} rotation={[1.15, 0.2, 0]}>
          <torusGeometry args={[1.55, 0.0045, 6, 220]} />
          <meshBasicMaterial color="#e8b04a" transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
    </group>
  )
}
