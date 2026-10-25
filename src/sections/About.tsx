import { about, certifications, education } from '../data/profile'
import { SectionHead } from '../components/SectionHead'

export function About() {
  const [lead, ...rest] = about.paragraphs

  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <div className="wrap">
        <SectionHead index="01" label="About" title="From the browser down to the database." id="about-title" />

        <div className="about-grid">
          <div className="about-copy">
            <p className="about-lead" data-reveal>
              {lead}
            </p>
            {rest.map((p) => (
              <p key={p.slice(0, 24)} data-reveal>
                {p}
              </p>
            ))}
          </div>

          <aside className="about-side" aria-label="Quick facts">
            <dl className="stats" data-reveal>
              {about.highlights.map((h) => (
                <div key={h.label}>
                  <dt className="mono">{h.label}</dt>
                  <dd>{h.value}</dd>
                </div>
              ))}
            </dl>

            <div className="edu" data-reveal>
              <h3 className="mono small-title">Education</h3>
              <ul>
                {education.map((e) => (
                  <li key={e.title}>
                    <strong>{e.title}</strong>
                    <span>
                      {e.place} · {e.period}
                    </span>
                    <span className="tag">{e.score}</span>
                  </li>
                ))}
              </ul>
              <h3 className="mono small-title">Certification</h3>
              <ul>
                {certifications.map((c) => (
                  <li key={c.title}>
                    <strong>{c.title}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
