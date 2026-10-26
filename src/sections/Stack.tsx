import { skills } from '../data/profile'
import { SectionHead } from '../components/SectionHead'

const COLORS = ['teal', 'terra', 'mustard', 'paper']

export function Stack() {
  return (
    <section id="stack" className="leg leg-wide" aria-labelledby="stack-title">
      <div className="card card-head" data-card="1">
        <SectionHead exit="EXIT 04" label="Toolbox" title="What’s packed in the boot." italic="boot." id="stack-title" />
      </div>

      <div className="tags">
        {skills.map((g, i) => (
          // outline + shadow live on the article; the clipped tag shape is the inner body
          <article key={g.title} className={`tag tag-${COLORS[i % COLORS.length]}`} data-card={i % 2 ? '1.5' : '-1.5'} data-sfx>
            <div className="tag-body">
              <span className="tag-hole" aria-hidden="true" />
              <h3>{g.title}</h3>
              <p className="tag-note">{g.note}</p>
              <ul>
                {g.items.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
