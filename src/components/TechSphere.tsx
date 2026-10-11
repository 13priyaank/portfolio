import { useEffect, useMemo, useRef } from 'react'
import { skills } from '../data/profile'
import { prefersReducedMotion } from '../lib/env'
import { sfx } from '../lib/sound'

/** A pick of the strongest skills from each group, deduped, so the cloud stays readable. */
function pickWords(): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  const per = [4, 4, 5, 4, 3, 2, 3, 4, 2]
  skills.forEach((g, gi) => {
    g.items.filter((w) => w.length <= 14).slice(0, per[gi] ?? 4).forEach((w) => {
      if (!seen.has(w)) {
        seen.add(w)
        out.push(w)
      }
    })
  })
  return out
}

/**
 * A draggable 3D word cloud. Pure DOM + transforms (no second WebGL context):
 * each word sits on a Fibonacci sphere that is rotated in JS every frame.
 * Drag to spin, release to coast, hover a word to pull it into focus.
 * Decorative: the full skill list below is the accessible version.
 */
export function TechSphere() {
  const box = useRef<HTMLDivElement>(null)
  const words = useMemo(pickWords, [])
  const points = useMemo(() => {
    const n = words.length
    const ga = Math.PI * (3 - Math.sqrt(5))
    return words.map((_, i) => {
      const y = 1 - ((i + 0.5) / n) * 2
      const r = Math.sqrt(1 - y * y)
      return [Math.cos(ga * i) * r, y, Math.sin(ga * i) * r] as const
    })
  }, [words])

  useEffect(() => {
    const el = box.current
    if (!el) return
    const nodes = Array.from(el.querySelectorAll<HTMLElement>('[data-word]'))
    const reduced = prefersReducedMotion()
    let R = 200
    let ax = -0.25
    let ay = 0
    let vx = 0
    let vy = reduced ? 0 : 0.004
    let dragging = false
    let hover = false
    let lx = 0
    let ly = 0
    let visible = true
    let raf = 0

    const size = () => {
      R = Math.min(el.clientWidth, el.clientHeight) * 0.44
    }
    const render = () => {
      const cx = Math.cos(ax)
      const sx = Math.sin(ax)
      const cy = Math.cos(ay)
      const sy = Math.sin(ay)
      nodes.forEach((n, i) => {
        const [px, py, pz] = points[i]
        // rotate around Y, then X
        const x1 = px * cy + pz * sy
        const z1 = -px * sy + pz * cy
        const y2 = py * cx - z1 * sx
        const z2 = py * sx + z1 * cx
        const depth = (z2 + 1) / 2 // 0 back .. 1 front
        const scale = 0.55 + depth * 0.7
        n.style.transform = `translate3d(${x1 * R}px, ${y2 * R}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`
        n.style.opacity = (0.18 + depth * 0.82).toFixed(3)
        n.style.zIndex = String(Math.round(depth * 100))
        n.classList.toggle('is-front', depth > 0.82)
      })
    }
    const loop = () => {
      raf = requestAnimationFrame(loop)
      if (!visible) return
      if (!dragging) {
        vx *= 0.95
        vy += ((hover ? 0.0015 : 0.004) - vy) * 0.03
        if (Math.abs(vy) < 0.0005) vy = 0.0005
      }
      ax += vx
      ay += vy
      ax = Math.max(-1.2, Math.min(1.2, ax))
      render()
    }

    const down = (e: PointerEvent) => {
      dragging = true
      lx = e.clientX
      ly = e.clientY
      el.setPointerCapture(e.pointerId)
      el.classList.add('is-drag')
      sfx.tick()
    }
    const move = (e: PointerEvent) => {
      if (!dragging) return
      const dx = e.clientX - lx
      const dy = e.clientY - ly
      lx = e.clientX
      ly = e.clientY
      vy = dx * 0.006
      vx = -dy * 0.006
      ay += vy
      ax = Math.max(-1.2, Math.min(1.2, ax + vx))
      if (reduced) render()
    }
    const up = (e: PointerEvent) => {
      dragging = false
      el.classList.remove('is-drag')
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
    }
    const enter = () => (hover = true)
    const leave = () => (hover = false)

    size()
    render()
    const ro = new ResizeObserver(() => {
      size()
      render()
    })
    ro.observe(el)
    const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting))
    io.observe(el)
    if (!reduced) raf = requestAnimationFrame(loop)

    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    el.addEventListener('pointerenter', enter)
    el.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
      el.removeEventListener('pointerenter', enter)
      el.removeEventListener('pointerleave', leave)
    }
  }, [points])

  return (
    <div data-reveal className="tech-sphere-wrap">
      <div ref={box} className="tech-sphere" data-cursor="Drag" aria-hidden="true">
        {words.map((w) => (
          <span key={w} data-word className="sphere-word">
            {w}
          </span>
        ))}
      </div>
      <p className="mono-label mt-4 text-center">Drag to spin the stack</p>
    </div>
  )
}
