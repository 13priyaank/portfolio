import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/motion'

type Props = { ready: boolean; onStart: (withSound: boolean) => void; onDone: () => void }

/**
 * The ignition screen. A fuel gauge fills while the 3D road loads, then the
 * visitor starts the engine. That click is also the gesture browsers need for audio.
 */
export function Intro({ ready, onStart, onDone }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const [fuel, setFuel] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const full = fuel >= 100

  useEffect(() => {
    const id = window.setInterval(() => {
      setFuel((f) => {
        const cap = ready ? 100 : 88
        return f >= cap ? cap : Math.min(cap, f + Math.max(1, Math.round((cap - f) * (ready ? 0.2 : 0.07))))
      })
    }, 40)
    return () => clearInterval(id)
  }, [ready])

  useEffect(() => {
    if (full) root.current?.querySelector<HTMLButtonElement>('.ignition')?.focus({ preventScroll: true })
  }, [full])

  const start = (withSound: boolean) => {
    if (leaving) return
    setLeaving(true)
    onStart(withSound)
    gsap
      .timeline({ onComplete: onDone })
      .to('.ignition', { scale: 0.9, duration: 0.12, yoyo: true, repeat: 1 })
      .to('.intro-card', { y: 40, rotation: -6, opacity: 0, duration: 0.6, ease: 'power2.in' }, '+=0.15')
      .to(root.current, { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, '-=0.2')
  }

  return (
    <div ref={root} className="intro" role="dialog" aria-modal="true" aria-label="Start the road trip">
      <div className="intro-card">
        <p className="intro-ticket">Admit one · Road trip through a portfolio</p>
        <h1 className="intro-title">
          Ready for a <em>drive?</em>
        </h1>
        <p className="intro-sub">Scroll to drive the car through my work. Click the open road to honk.</p>

        <div className="fuel" aria-hidden="true">
          <span className="fuel-e">E</span>
          <span className="fuel-track">
            <span className="fuel-fill" style={{ transform: `scaleX(${fuel / 100})` }} />
          </span>
          <span className="fuel-f">F</span>
        </div>
        <p className="intro-status" role="status">
          {full ? 'Tank’s full. Let’s go.' : `Fuelling up… ${fuel}%`}
        </p>

        <div className={`intro-actions${full ? ' is-on' : ''}`}>
          <button type="button" className="ignition" disabled={!full} onClick={() => start(true)}>
            <span className="ign-ring" aria-hidden="true" />
            <span className="ign-text">
              Start
              <br />
              engine
            </span>
            <span className="sr-only">with sound</span>
          </button>
          <button type="button" className="ride-silent" disabled={!full} onClick={() => start(false)}>
            Ride silently →
          </button>
        </div>
      </div>
    </div>
  )
}
