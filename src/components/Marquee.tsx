import { useEffect, useRef } from 'react'
import { gsap } from '../lib/motion'
import { prefersReducedMotion } from '../lib/env'

const ROWS: string[][] = [
  ['Java', 'Spring Boot', 'Docker', 'PostgreSQL', 'Redis', 'Alembic', 'Git & GitHub', 'Nginx', 'JUnit'],
  ['FastAPI', 'Next.js', 'Node.js', 'TypeScript', 'RAG', 'LangGraph', 'Three.js', 'REST', 'Python'],
]

/**
 * Two rows of tech names that drift on their own, speed up with scroll
 * velocity, flip direction when you scroll the other way and lean (skew) into the motion.
 */
export function Marquee() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el || prefersReducedMotion()) return
    const tracks = Array.from(el.querySelectorAll<HTMLElement>('[data-track]'))
    const state = tracks.map((t, i) => ({ t, x: 0, dir: i % 2 ? 1 : -1, w: 0 }))
    const measure = () => state.forEach((s) => (s.w = s.t.scrollWidth / 2))
    measure()
    const ro = new ResizeObserver(measure)
    tracks.forEach((t) => ro.observe(t))

    let visible = false
    const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting), { rootMargin: '200px' })
    io.observe(el)

    let lastY = window.scrollY
    let vel = 0
    let boost = 0
    let sign = 1
    const tick = (_: number, dtMs: number) => {
      const dt = Math.min(dtMs, 50) / 1000
      const y = window.scrollY
      const v = dt > 0 ? (y - lastY) / dt : 0
      lastY = y
      vel += (v - vel) * 0.12
      boost += (Math.min(Math.abs(vel) / 900, 4) - boost) * 0.1
      if (Math.abs(vel) > 40) sign = vel > 0 ? 1 : -1
      if (!visible) return
      state.forEach((s) => {
        s.x += s.dir * sign * (55 + boost * 420) * dt
        if (s.x <= -s.w) s.x += s.w
        if (s.x >= 0) s.x -= s.w
        s.t.style.transform = `translate3d(${s.x}px,0,0) skewX(${Math.max(-12, Math.min(12, -vel * 0.006))}deg)`
      })
    }
    gsap.ticker.add(tick)
    return () => {
      gsap.ticker.remove(tick)
      ro.disconnect()
      io.disconnect()
    }
  }, [])

  return (
    <div ref={root} className="marquee" aria-hidden="true">
      {ROWS.map((row, r) => (
        <div key={r} className={`marquee-row ${r % 2 ? 'is-alt' : ''}`}>
          <div data-track className="marquee-track">
            {[...row, ...row, ...row, ...row].map((w, i) => (
              <span key={i} className="marquee-item">
                {w}
                <i className="marquee-dot" />
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
