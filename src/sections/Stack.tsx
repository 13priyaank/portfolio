import { skills } from '../data/profile'
import { SectionHead } from '../components/SectionHead'

export function Stack() {
  return (
    <section id="stack" className="section" aria-labelledby="stack-title">
      <div className="wrap">
        <SectionHead index="04" label="Stack" title="The toolbox" id="stack-title" />

        <div className="stack">
          {skills.map((g) => (
            <div key={g.title} className="stack-row" data-reveal>
              <div className="stack-label">
                <h3>{g.title}</h3>
                <p className="mono">{g.note}</p>
              </div>
              <ul className="stack-items">
                {g.items.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
