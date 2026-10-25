import { projects } from '../data/profile'
import { SectionHead } from '../components/SectionHead'

export function Projects() {
  return (
    <section id="projects" className="section" aria-labelledby="projects-title">
      <div className="wrap">
        <SectionHead index="03" label="Selected projects" title="Things I’ve built" count={projects.length} id="projects-title" />

        <div className="projects" data-reveal>
          {projects.map((p, i) => (
            <details key={p.name} className="project" open={i === 0}>
              <summary>
                <span className="p-index mono">{p.index}</span>
                <span className="p-name">{p.name}</span>
                <span className="p-kind mono">{p.kind}</span>
                <span className="p-toggle" aria-hidden="true" />
              </summary>

              <div className="p-body">
                <p className="p-purpose">{p.purpose}</p>
                <div>
                  <h4 className="mono small-title">What I did</h4>
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
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
