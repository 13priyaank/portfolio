import { gsap } from './motion'
import { isCoarsePointer, prefersReducedMotion } from './env'
import { firePulse, stage } from './stage'
import { sfx } from './sound'

const MAGNETIC = '.btn, .brand, .menu-btn'
const ENERGIZE = '.project-card, .skill-cell, .btn, .tech-sphere, .project-row, .terminal'

type Pull = { x: number; y: number }

/**
 * Document-level interaction layer (one set of listeners, no per-element hooks):
 *  - buttons lean toward the pointer
 *  - the 3D orb "energises" while you hover cards and controls
 *  - a click anywhere sends a shockwave through the orb
 * Returns a cleanup function. Does nothing for touch or reduced motion.
 */
export function startInteractions(): () => void {
  if (isCoarsePointer() || prefersReducedMotion()) return () => {}

  const pulls = new WeakMap<HTMLElement, Pull>()
  let current: HTMLElement | null = null

  const release = (el: HTMLElement) => {
    const p = pulls.get(el)
    if (!p) return
    gsap.to(p, {
      x: 0,
      y: 0,
      duration: 0.9,
      ease: 'elastic.out(1, 0.4)',
      overwrite: true,
      onUpdate: () => (el.style.translate = `${p.x}px ${p.y}px`),
      onComplete: () => el.style.removeProperty('translate'),
    })
  }

  const move = (e: PointerEvent) => {
    const el = (e.target as HTMLElement | null)?.closest<HTMLElement>(MAGNETIC) ?? null
    if (el !== current) {
      if (current) release(current)
      current = el
    }
    if (!el) return
    let p = pulls.get(el)
    if (!p) {
      p = { x: 0, y: 0 }
      pulls.set(el, p)
    }
    const r = el.getBoundingClientRect()
    const tx = (e.clientX - (r.left + r.width / 2)) * 0.28
    const ty = (e.clientY - (r.top + r.height / 2)) * 0.4
    const target = p
    gsap.to(target, {
      x: tx,
      y: ty,
      duration: 0.35,
      ease: 'power3.out',
      overwrite: true,
      onUpdate: () => (el.style.translate = `${target.x}px ${target.y}px`),
    })
  }

  const over = (e: PointerEvent) => {
    const hot = !!(e.target as HTMLElement | null)?.closest(ENERGIZE)
    gsap.to(stage, { energy: hot ? 1 : 0, duration: 0.7, ease: 'power2.out', overwrite: 'auto' })
  }

  let last = 0
  const click = () => {
    const now = performance.now()
    if (now - last < 350) return
    last = now
    firePulse()
    sfx.soft()
  }

  window.addEventListener('pointermove', move, { passive: true })
  window.addEventListener('pointerover', over, { passive: true })
  window.addEventListener('pointerdown', click, { passive: true })
  return () => {
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerover', over)
    window.removeEventListener('pointerdown', click)
    if (current) release(current)
  }
}
