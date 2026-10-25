import { skills } from '../data/profile'
import { SectionHead } from '../components/SectionHead'

export function Stack() {
  return (
    <section id="stack" className="section side-right" aria-labelledby="stack-title">
      <div className="col">
        <SectionHead index="04" label="Stack" title="The toolbox in orbit." accent="orbit" id="stack-title" />

        <div className="stack-grid" data-reveal-group>
          {skills.map((g, i) => (
            <div key={g.title} className="glass stack-card" data-reveal data-sfx>
              <div className="stack-head">
                <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                <h3>{g.title}</h3>
              </div>
              <p className="mono stack-note">{g.note}</p>
              <ul className="chips">
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
