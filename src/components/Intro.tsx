import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/motion'
import { sound } from '../lib/sound'

type Props = { ready: boolean; onEnter: (withSound: boolean) => void; onDone: () => void }

/**
 * Loading gate. Counts up while the particle scene boots, then asks how to
 * enter. The click doubles as the user gesture browsers need before audio.
 */
export function Intro({ ready, onEnter, onDone }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const [pct, setPct] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const done = pct >= 100

  // ease toward 90 on our own, finish once the scene says it's ready
  useEffect(() => {
    const id = window.setInterval(() => {
      setPct((p) => {
        const cap = ready ? 100 : 90
        return p >= cap ? cap : Math.min(cap, p + Math.max(1, Math.round((cap - p) * (ready ? 0.18 : 0.06))))
      })
    }, 40)
    return () => clearInterval(id)
  }, [ready])

  useEffect(() => {
    if (done) root.current?.querySelector<HTMLButtonElement>('.intro-btn')?.focus({ preventScroll: true })
  }, [done])

  const enter = (withSound: boolean) => {
    if (leaving) return
    setLeaving(true)
    onEnter(withSound)
    if (!withSound) sound.setEnabled(false)
    gsap
      .timeline({ onComplete: onDone })
      .to('.intro-inner', { y: -30, opacity: 0, duration: 0.6, ease: 'power2.in' })
      .to(root.current, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' }, '-=0.2')
  }

  return (
    <div ref={root} className="intro" role="dialog" aria-modal="true" aria-label="Welcome">
      <div className="intro-inner">
        <p className="mono intro-kicker">Priyank Wadiwala · Portfolio 2026</p>

        <div className="intro-count" aria-hidden="true">
          {String(pct).padStart(3, '0')}
          <span>%</span>
        </div>
        <div className="intro-bar" aria-hidden="true">
          <span style={{ transform: `scaleX(${pct / 100})` }} />
        </div>
        <p className="mono intro-status" role="status">
          {done ? 'Universe assembled.' : 'Assembling 20,000 particles…'}
        </p>

        <div className={`intro-actions${done ? ' is-on' : ''}`}>
          <button type="button" className="intro-btn" disabled={!done} onClick={() => enter(true)}>
            <span className="eq" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
            Enter with sound
          </button>
          <button type="button" className="intro-btn ghost" disabled={!done} onClick={() => enter(false)}>
            Enter silently
          </button>
        </div>
        <p className="intro-hint">Best with headphones. Move your mouse and click anywhere once inside.</p>
      </div>
    </div>
  )
}
