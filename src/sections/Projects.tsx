import { useRef } from 'react'
import { projects } from '../data/profile'
import { SectionHead } from '../components/SectionHead'

/** Card that tilts toward the pointer and carries a glow under it. */
function ProjectCard({ p }: { p: (typeof projects)[number] }) {
  const ref = useRef<HTMLElement>(null)

  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    ref.current.style.setProperty('--mx', `${x * 100}%`)
    ref.current.style.setProperty('--my', `${y * 100}%`)
    ref.current.style.setProperty('--rx', `${(0.5 - y) * 8}deg`)
    ref.current.style.setProperty('--ry', `${(x - 0.5) * 10}deg`)
  }
  const leave = () => {
    ref.current?.style.setProperty('--rx', '0deg')
    ref.current?.style.setProperty('--ry', '0deg')
  }

  return (
    <article ref={ref} className="glass p-card" onPointerMove={move} onPointerLeave={leave} data-sfx data-reveal>
      <div className="p-top">
        <span className="p-index">{p.index}</span>
        <span className="mono p-kind">{p.kind}</span>
      </div>
      <h3 className="p-name">{p.name}</h3>
      <p className="p-purpose">{p.purpose}</p>
      <ul className="p-list">
        {p.contributions.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
      <ul className="chips" aria-label="Tech used">
        {p.stack.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
    </article>
  )
}

export function Projects() {
  return (
    <section id="projects" className="projects" aria-labelledby="projects-title">
      <div className="p-pin">
        <div className="p-track" data-reveal-group>
          <div className="p-intro">
            <SectionHead index="03" label="Selected projects" title="Things I’ve built." accent="built" id="projects-title" />
            <p className="body p-hint">
              Six projects across healthcare, real-time systems, AI and 3D.
              <span className="mono p-keep"> Keep scrolling →</span>
            </p>
          </div>
          {projects.map((p) => (
            <ProjectCard key={p.name} p={p} />
          ))}
        </div>
        <div className="p-progress" aria-hidden="true">
          <span />
        </div>
      </div>
    </section>
  )
}
