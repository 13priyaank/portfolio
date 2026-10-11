import { skills } from '../data/profile'
import { SectionHead } from '../components/SectionHead'
import { TechSphere } from '../components/TechSphere'

function spot(e: React.PointerEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
}

export function Skills() {
  return (
    <section id="skills" className="section" aria-labelledby="skills-title">
      <div className="shell">
        <SectionHead id="skills" index="02" label="Technical skills" title="The tools I reach for, *grouped* by the job they do." className="max-w-4xl" />
        <p data-reveal className="mt-6 max-w-lg text-mute">
          No percentages. Each group is something I have shipped with, across product work and personal projects.
        </p>

        <TechSphere />

        <div className="skill-grid mt-16">
          {skills.map((g, i) => (
            <article key={g.title} data-reveal className="skill-cell" onPointerMove={spot}>
              <div className="flex items-baseline justify-between">
                <h3 className="display text-3xl">{g.title}</h3>
                <span className="mono-label">0{i + 1}</span>
              </div>
              <p className="mt-2 text-sm text-mute">{g.note}</p>
              <ul className="mt-6 flex flex-wrap gap-2" aria-label={`${g.title} technologies`}>
                {g.items.map((t) => (
                  <li key={t} className="chip">
                    {t}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
