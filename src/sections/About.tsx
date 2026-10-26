import { about, certifications, education } from '../data/profile'
import { SectionHead } from '../components/SectionHead'

export function About() {
  const [lead, ...rest] = about.paragraphs

  return (
    <section id="about" className="leg" aria-labelledby="about-title">
      <article className="card postcard" data-card="-1">
        <span className="stamp" aria-hidden="true">
          <span>01</span>
          <small>About</small>
        </span>
        <SectionHead exit="EXIT 01" label="About" title="From pixels down to Postgres." italic="Postgres" id="about-title" />
        <p className="lead">{lead}</p>
        {rest.map((p) => (
          <p className="body" key={p.slice(0, 20)}>
            {p}
          </p>
        ))}

        <div className="stickers-row">
          <div className="badge badge-teal" data-pop="0" data-sfx>
            <strong>
              <span data-count="2024" data-from="2000">
                2024
              </span>
            </strong>
            <span>building for the web since</span>
          </div>
          <div className="badge badge-terra" data-pop="0.1" data-sfx>
            <strong>
              10→
              <span data-count="2" data-from="10">
                2
              </span>
            </strong>
            <span>days to deliver after automation</span>
          </div>
          <div className="badge badge-mustard" data-pop="0.2" data-sfx>
            <strong>
              <span data-count="6" data-from="0">
                6
              </span>
            </strong>
            <span>projects across health, AI & 3D</span>
          </div>
        </div>
      </article>

      <article className="card card-small" data-card="1.2" aria-label="Education and certification">
        <h3 className="card-label">Rest stops along the way</h3>
        <ul className="stops">
          {education.map((e) => (
            <li key={e.title}>
              <span className="stop-dot" aria-hidden="true" />
              <div>
                <strong>{e.title}</strong>
                <span>
                  {e.place} · {e.period}
                </span>
              </div>
              <span className="score">{e.score}</span>
            </li>
          ))}
          {certifications.map((c) => (
            <li key={c.title}>
              <span className="stop-dot" aria-hidden="true" />
              <div>
                <strong>{c.title}</strong>
                <span>Certification</span>
              </div>
            </li>
          ))}
        </ul>
      </article>
    </section>
  )
}
