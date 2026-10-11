import { education, certifications, achievements } from '../data/profile'
import { SectionHead } from '../components/SectionHead'

export function Education() {
  return (
    <section id="education" className="section" aria-labelledby="education-title">
      <div className="shell">
        <SectionHead id="education" index="05" label="Education & achievements" title="The *credentials*, kept brief." className="max-w-4xl" />

        <div className="mt-16 grid grid-cols-1 border-t border-line lg:grid-cols-3">
          <div data-reveal className="edu-col">
            <h3 className="mono-label mb-8">Education</h3>
            <ul className="space-y-8">
              {education.map((e) => (
                <li key={e.title}>
                  <p className="display text-2xl leading-tight">{e.title}</p>
                  <p className="mt-2 text-mute">{e.place}</p>
                  <p className="mono-label mt-1">
                    {e.period}
                    {e.score ? ` · ${e.score}` : ''}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div data-reveal className="edu-col">
            <h3 className="mono-label mb-8">Certifications</h3>
            <ul className="space-y-8">
              {certifications.map((c) => (
                <li key={c.title}>
                  <p className="display text-2xl leading-tight">{c.title}</p>
                  {c.detail && <p className="mt-2 text-sm leading-relaxed text-mute">{c.detail}</p>}
                </li>
              ))}
            </ul>
          </div>

          <div data-reveal className="edu-col">
            <h3 className="mono-label mb-8">Achievements</h3>
            <ul className="space-y-5 text-mute">
              {achievements.map((a) => (
                <li key={a} className="flex gap-3 leading-relaxed">
                  <span className="mt-[0.7em] h-px w-3 shrink-0 bg-accent" aria-hidden="true" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
