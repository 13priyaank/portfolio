import { useEffect, useRef } from 'react'
import { EXITS, stage } from '../three/stage'

const NAMES = ['About', 'Experience', 'Projects', 'Toolbox', 'Say hello']

/**
 * Dashboard pinned to the bottom of the screen: speedometer, odometer,
 * next exit and a trip strip. Updated straight from the animation frame,
 * so it never re-renders React while you scroll.
 */
export function Dashboard() {
  const needle = useRef<SVGGElement>(null)
  const kmh = useRef<HTMLSpanElement>(null)
  const odo = useRef<HTMLSpanElement>(null)
  const next = useRef<HTMLSpanElement>(null)
  const dist = useRef<HTMLSpanElement>(null)
  const carIcon = useRef<HTMLSpanElement>(null)
  const ticks = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let raf = 0
    let lastText = ''
    let lastMarks = ''
    const frame = () => {
      raf = requestAnimationFrame(frame)
      // exit markers along the trip strip; milestones move when the layout is measured
      const marks = stage.milestones.join()
      if (marks !== lastMarks && ticks.current) {
        lastMarks = marks
        ticks.current.innerHTML = ''
        stage.milestones.forEach((m, k) => {
          const t = document.createElement('i')
          t.style.left = `${m * 100}%`
          t.title = EXITS[k].main
          ticks.current!.appendChild(t)
        })
      }
      const s = stage.speed
      needle.current?.setAttribute('transform', `rotate(${-120 + (s / 240) * 240} 60 60)`)
      if (kmh.current) kmh.current.textContent = String(Math.round(s)).padStart(3, '0')
      if (odo.current) odo.current.textContent = stage.odometer.toFixed(1).padStart(5, '0')
      const i = stage.milestones.findIndex((m) => stage.progress < m)
      const label = i === -1 ? 'Arrived' : NAMES[i]
      if (label !== lastText && next.current) {
        next.current.textContent = label
        lastText = label
      }
      if (dist.current) {
        const km = i === -1 ? 0 : Math.max(0, (stage.milestones[i] - stage.progress) * 420)
        dist.current.textContent = i === -1 ? 'you made it' : `${km.toFixed(1)} km`
      }
      if (carIcon.current) carIcon.current.style.left = `${stage.progress * 100}%`
    }
    frame()
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <aside className="dash" aria-label="Trip dashboard" aria-hidden="true">
      <div className="gauge">
        <svg viewBox="0 4 120 88" width="88" height="64">
          <path
            d="M18.4 84 A48 48 0 1 1 101.6 84"
            fill="none"
            stroke="currentColor"
            strokeOpacity=".18"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M18.4 84 A48 48 0 1 1 101.6 84"
            fill="none"
            stroke="var(--terracotta)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="4 7"
          />
          <g ref={needle} transform="rotate(-120 60 60)">
            <line x1="60" y1="60" x2="60" y2="18" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
          </g>
          <circle cx="60" cy="60" r="6" fill="currentColor" />
        </svg>
        <div className="gauge-read">
          <span ref={kmh}>000</span>
          <small>km/h</small>
        </div>
      </div>

      <div className="dash-cell dash-odo">
        <small>Odometer</small>
        <span>
          <span ref={odo} className="odo-num">
            000.0
          </span>{' '}
          km
        </span>
      </div>

      <div className="dash-cell dash-next">
        <small>Next exit</small>
        <span ref={next}>About</span>
        <em ref={dist}>—</em>
      </div>

      <div className="trip">
        <span className="trip-line">
          <span ref={ticks} className="trip-ticks" />
          <span ref={carIcon} className="trip-car">
            <svg viewBox="0 0 24 14" width="22" height="13">
              <path d="M3 9V6l3-4h9l4 4h2v3z" fill="var(--teal)" />
              <circle cx="7" cy="10.5" r="2.3" fill="var(--ink)" />
              <circle cx="17" cy="10.5" r="2.3" fill="var(--ink)" />
            </svg>
          </span>
        </span>
      </div>
    </aside>
  )
}
