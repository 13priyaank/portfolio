import { useEffect, useRef } from 'react'
import { gsap } from '../lib/motion'
import { isCoarsePointer, prefersReducedMotion } from '../lib/env'

const INTERACTIVE = 'a, button, input, summary, [data-cursor]'

/**
 * A soft ring that trails the pointer, swells over anything clickable and
 * ripples on click. The native cursor stays: this is decoration only, so it is
 * skipped on touch devices and for reduced motion.
 */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null)
  const dot = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const r = ring.current
    const d = dot.current
    const l = label.current
    if (!r || !d || !l || isCoarsePointer() || prefersReducedMotion()) return

    const rx = gsap.quickTo(r, 'x', { duration: 0.45, ease: 'power3.out' })
    const ry = gsap.quickTo(r, 'y', { duration: 0.45, ease: 'power3.out' })
    const dx = gsap.quickTo(d, 'x', { duration: 0.08, ease: 'none' })
    const dy = gsap.quickTo(d, 'y', { duration: 0.08, ease: 'none' })
    let shown = false

    const move = (e: PointerEvent) => {
      if (!shown) {
        shown = true
        gsap.set([r, d], { x: e.clientX, y: e.clientY })
        document.documentElement.classList.add('has-cursor')
      }
      rx(e.clientX)
      ry(e.clientY)
      dx(e.clientX)
      dy(e.clientY)
    }

    const over = (e: PointerEvent) => {
      const t = (e.target as HTMLElement | null)?.closest<HTMLElement>(INTERACTIVE)
      const text = t?.dataset.cursor ?? ''
      l.textContent = text
      r.classList.toggle('is-hot', !!t)
      r.classList.toggle('has-label', !!text)
    }

    const down = (e: PointerEvent) => {
      const ripple = document.createElement('span')
      ripple.className = 'cursor-ripple'
      ripple.style.left = `${e.clientX}px`
      ripple.style.top = `${e.clientY}px`
      document.body.appendChild(ripple)
      gsap.fromTo(
        ripple,
        { scale: 0.2, opacity: 0.7 },
        { scale: 2.6, opacity: 0, duration: 0.8, ease: 'expo.out', onComplete: () => ripple.remove() },
      )
      r.classList.add('is-down')
    }
    const up = () => r.classList.remove('is-down')
    const leave = () => document.documentElement.classList.remove('has-cursor')
    const enter = () => shown && document.documentElement.classList.add('has-cursor')

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerover', over, { passive: true })
    window.addEventListener('pointerdown', down, { passive: true })
    window.addEventListener('pointerup', up, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    document.documentElement.addEventListener('pointerenter', enter)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      document.documentElement.removeEventListener('pointerleave', leave)
      document.documentElement.removeEventListener('pointerenter', enter)
      document.documentElement.classList.remove('has-cursor')
    }
  }, [])

  return (
    <div aria-hidden="true">
      <div ref={ring} className="cursor-ring">
        <span ref={label} className="cursor-label" />
      </div>
      <div ref={dot} className="cursor-dot" />
    </div>
  )
}
