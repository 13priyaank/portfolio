import { projects } from '../data/profile'
import { SectionHead } from '../components/SectionHead'

const TILTS = ['-1.6', '1.2', '-0.6', '1.8', '-1.2', '0.8']

export function Projects() {
  return (
    <section id="projects" className="leg leg-wide" aria-labelledby="projects-title">
      <div className="card card-head" data-card="-0.6">
        <SectionHead
          exit="EXIT 03"
          label="Projects"
          title="Postcards from things I’ve built."
          italic="built."
          id="projects-title"
        />
        <p className="body">Six stops across healthcare, real-time systems, AI and 3D.</p>
      </div>

      <div className="postcards">
        {projects.map((p, i) => (
          <article key={p.name} className="card project" data-card={TILTS[i]} data-sfx>
            <div className="project-top">
              <span className="postmark" aria-hidden="true">
                {p.index}
              </span>
              <span className="project-kind">{p.kind}</span>
            </div>
            <h3 className="project-name">{p.name}</h3>
            <p className="project-purpose">{p.purpose}</p>
            <ul className="project-list">
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
        ))}
      </div>
    </section>
  )
}
