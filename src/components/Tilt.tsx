import { useEffect, useRef, type ReactNode } from 'react'
import { gsap } from '../lib/motion'
import { isCoarsePointer, prefersReducedMotion } from '../lib/env'

type Props = { children: ReactNode; className?: string; max?: number }

/** Pointer-driven 3D tilt with a soft glare. Children can sit at different Z depths. */
export function Tilt({ children, className = '', max = 7 }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || isCoarsePointer() || prefersReducedMotion()) return
    gsap.set(el, { transformPerspective: 1000, transformStyle: 'preserve-3d' })
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3.out' })
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3.out' })
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width
      const py = (e.clientY - r.top) / r.height
      ry((px - 0.5) * max * 2)
      rx(-(py - 0.5) * max * 2)
      el.style.setProperty('--mx', `${px * 100}%`)
      el.style.setProperty('--my', `${py * 100}%`)
    }
    const leave = () => {
      rx(0)
      ry(0)
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [max])

  return (
    <div ref={ref} className={`tilt ${className}`}>
      {children}
    </div>
  )
}
