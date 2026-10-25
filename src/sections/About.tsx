import { about, certifications, education } from '../data/profile'
import { SectionHead } from '../components/SectionHead'

export function About() {
  const [lead, ...rest] = about.paragraphs

  return (
    <section id="about" className="section side-right" aria-labelledby="about-title">
      <div className="col">
        <SectionHead index="01" label="About" title="From pixels down to Postgres." accent="Postgres" id="about-title" />

        <div data-reveal-group>
          <p className="lead" data-reveal>
            {lead}
          </p>
          {rest.map((p) => (
            <p className="body" key={p.slice(0, 20)} data-reveal>
              {p}
            </p>
          ))}
        </div>

        <div className="stat-row" data-reveal-group>
          <div className="glass stat" data-reveal data-sfx>
            <span className="stat-num">
              <span data-count="2024" data-from="2000">
                2024
              </span>
            </span>
            <span className="mono">Building for the web since</span>
          </div>
          <div className="glass stat" data-reveal data-sfx>
            <span className="stat-num">
              10→
              <span className="grad" data-count="2" data-from="10">
                2
              </span>
            </span>
            <span className="mono">Days to deliver, after automation</span>
          </div>
          <div className="glass stat" data-reveal data-sfx>
            <span className="stat-num">
              <span data-count="6" data-from="0">
                6
              </span>
            </span>
            <span className="mono">Projects across health, AI and 3D</span>
          </div>
        </div>

        <div className="edu" data-reveal-group>
          {education.map((e) => (
            <div className="glass edu-card" key={e.title} data-reveal data-sfx>
              <span className="mono">{e.period}</span>
              <strong>{e.title}</strong>
              <span>{e.place}</span>
              <span className="pill">{e.score}</span>
            </div>
          ))}
          {certifications.map((c) => (
            <div className="glass edu-card" key={c.title} data-reveal data-sfx>
              <span className="mono">Certification</span>
              <strong>{c.title}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
