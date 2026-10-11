import { projects, profile } from '../data/profile'
import { SectionHead } from '../components/SectionHead'
import { Tilt } from '../components/Tilt'
import { sfx } from '../lib/sound'

export function Projects() {
  const featured = projects.slice(0, 2)
  const rest = projects.slice(2)

  return (
    <section id="projects" className="section" aria-labelledby="projects-title">
      <div className="shell">
        <SectionHead id="projects" index="04" label="Featured projects" title="Things I have *built*, and what I did on them." className="max-w-4xl" />

        <div className="mt-20 grid gap-8 lg:grid-cols-2 [perspective:1400px]">
          {featured.map((p) => (
            <div key={p.name} data-reveal>
              <Tilt className="project-card" max={6}>
                <div className="d1 flex items-start justify-between">
                  <span className="mono-label !text-accent">{p.index}</span>
                  <span className="mono-label text-right">{p.kind}</span>
                </div>
                <h3 className="display d3 mt-16 text-[clamp(2.4rem,4.4vw,4rem)]">{p.name}</h3>
                <p className="d2 mt-5 max-w-md leading-relaxed text-fg/90">{p.purpose}</p>
                <ul className="d1 mt-8 space-y-2.5 text-sm text-mute">
                  {p.contributions.map((c) => (
                    <li key={c} className="flex gap-3">
                      <span className="mt-[0.6em] h-px w-3 shrink-0 bg-accent" aria-hidden="true" />
                      {c}
                    </li>
                  ))}
                </ul>
                <ul className="d3 mt-auto flex pt-10 flex-wrap gap-2" aria-label="Technologies used">
                  {p.stack.map((s) => (
                    <li key={s} className="chip chip-solid">{s}</li>
                  ))}
                </ul>
              </Tilt>
            </div>
          ))}
        </div>

        <ol className="mt-16 border-t border-line">
          {rest.map((p) => (
            <li key={p.name} data-reveal className="project-row">
              <div className="col-span-12 md:col-span-4">
                <span className="mono-label !text-accent">{p.index}</span>
                <h3 className="display mt-3 text-[clamp(1.9rem,3vw,2.75rem)]">{p.name}</h3>
                <p className="mono-label mt-2">{p.kind}</p>
              </div>
              <div className="col-span-12 md:col-span-5">
                <p className="leading-relaxed text-fg/90">{p.purpose}</p>
                <ul className="mt-5 space-y-2 text-sm text-mute">
                  {p.contributions.map((c) => (
                    <li key={c} className="flex gap-3">
                      <span className="mt-[0.6em] h-px w-3 shrink-0 bg-line-strong" aria-hidden="true" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
              <ul className="col-span-12 flex flex-wrap content-start gap-2 md:col-span-3" aria-label="Technologies used">
                {p.stack.map((s) => (
                  <li key={s} className="chip">{s}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>

        <p data-reveal className="mt-14 text-mute">
          More code and experiments live on{' '}
          <a className="link" href={profile.github} target="_blank" rel="noopener noreferrer" onClick={() => sfx.tick()}>
            GitHub
          </a>
          .
        </p>
      </div>
    </section>
  )
}
