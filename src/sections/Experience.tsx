import { useRef } from 'react'
import { experience } from '../data/profile'
import { SectionHead } from '../components/SectionHead'

export function Experience() {
  const line = useRef<HTMLDivElement>(null)
  return (
    <section id="experience" className="section" aria-labelledby="experience-title">
      <div className="shell">
        <SectionHead id="experience" index="03" label="Experience" title="From walkthrough tooling to *healthcare* software." className="max-w-4xl" />

        <div className="timeline relative mt-20">
          <div className="timeline-rail" aria-hidden="true">
            <div ref={line} className="timeline-fill" data-timeline />
          </div>

          <ol className="space-y-24">
            {experience.map((job, i) => (
              <li key={job.company} className="relative grid grid-cols-12 gap-x-0 gap-y-6 md:gap-x-8">
                <span className="timeline-dot" aria-hidden="true" data-dot />
                <div className="col-span-12 md:col-span-4">
                  <p data-reveal className="mono-label !text-accent">{job.period}</p>
                  <p data-reveal className="mono-label mt-2">{job.place}</p>
                  {i === 0 && (
                    <p data-reveal className="mono-label mt-6 inline-flex items-center gap-2 !text-fg">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent motion-reduce:animate-none" aria-hidden="true" />
                      Current role
                    </p>
                  )}
                </div>
                <div className="col-span-12 md:col-span-8">
                  <h3 data-reveal className="display text-[clamp(2rem,4vw,3.25rem)]">{job.company}</h3>
                  <p data-reveal className="mt-1 text-lg text-fg">{job.role}</p>

                  <ul className="mt-8 space-y-4 text-mute">
                    {job.points.map((p) => (
                      <li key={p} data-reveal className="flex gap-4 leading-relaxed">
                        <span className="mt-[0.7em] h-px w-4 shrink-0 bg-line-strong" aria-hidden="true" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>

                  {job.metric && (
                    <div data-reveal className="mt-10 inline-flex items-baseline gap-5 border-t border-line pt-6">
                      <span className="display text-6xl text-accent">{job.metric.value}</span>
                      <span className="mono-label max-w-[14rem] !normal-case !tracking-normal">{job.metric.label}</span>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
