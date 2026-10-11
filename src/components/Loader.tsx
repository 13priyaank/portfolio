import { useEffect, useRef } from 'react'
import { gsap } from '../lib/motion'

type Props = { ready: boolean; reduced: boolean; onDone: () => void }

export function Loader({ ready, reduced, onDone }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLSpanElement>(null)

  // slow, honest-feeling progress that finishes when we're really ready
  useEffect(() => {
    if (reduced || !bar.current) return
    const t = gsap.to(bar.current, { scaleX: 0.85, duration: 2.2, ease: 'power2.out' })
    return () => {
      t.kill()
    }
  }, [reduced])

  useEffect(() => {
    if (!ready || !root.current) return
    if (reduced) {
      onDone()
      return
    }
    const tl = gsap.timeline({ onComplete: onDone })
    tl.to(bar.current, { scaleX: 1, duration: 0.35, ease: 'power2.out' })
      .to(root.current.querySelector('.loader-inner'), { opacity: 0, y: -12, duration: 0.4, ease: 'power2.in' }, '+=0.1')
      .to(root.current, { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, '-=0.1')
    return () => {
      tl.kill()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, reduced])

  if (reduced) return null
  return (
    <div ref={root} className="loader" role="status" aria-live="polite">
      <div className="loader-inner">
        <p className="display text-4xl sm:text-5xl">
          Priyank <span className="em">Wadiwala</span>
        </p>
        <p className="mono-label mt-5">Loading portfolio</p>
        <div className="mt-6 h-px w-48 bg-line-strong">
          <span ref={bar} className="block h-px origin-left scale-x-0 bg-accent" />
        </div>
      </div>
    </div>
  )
}
