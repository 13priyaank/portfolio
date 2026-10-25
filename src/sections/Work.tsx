import { achievements, experience } from '../data/profile'
import { SectionHead } from '../components/SectionHead'

export function Work() {
  return (
    <section id="work" className="section side-left" aria-labelledby="work-title">
      <div className="col">
        <SectionHead index="02" label="Experience" title="Where I’ve shipped." accent="shipped" id="work-title" />

        <ol className="jobs">
          <span className="spine" aria-hidden="true">
            <span className="spine-fill" />
          </span>
          {experience.map((job, i) => (
            <li key={job.company} className="job" data-reveal-group>
              <span className={`node${i === 0 ? ' is-now' : ''}`} aria-hidden="true" />
              <article className="glass job-card" data-reveal>
                <header className="job-head">
                  <span className="mono job-period">
                    {job.period}
                    {i === 0 && <span className="now-pill">Now</span>}
                  </span>
                  <h3>{job.role}</h3>
                  <p className="job-co">
                    <span className="grad">{job.company}</span> · {job.place}
                  </p>
                </header>
                <ul className="job-points">
                  {job.points.map((p) => (
                    <li key={p.slice(0, 32)}>{p}</li>
                  ))}
                </ul>

                {job.metric && (
                  <figure className="metric" aria-label="Delivery time went from about 10 days to about 2 days after automation">
                    <div className="metric-row">
                      <span className="mono">Before</span>
                      <span className="bar">
                        <span data-bar style={{ width: '100%' }} />
                      </span>
                      <span className="mono">~10 days</span>
                    </div>
                    <div className="metric-row is-after">
                      <span className="mono">After</span>
                      <span className="bar">
                        <span data-bar style={{ width: '20%' }} />
                      </span>
                      <span className="mono">~2 days</span>
                    </div>
                  </figure>
                )}
              </article>
            </li>
          ))}
        </ol>

        <div className="wins" data-reveal-group>
          {achievements.map((a, i) => (
            <div className="glass win" key={a.slice(0, 20)} data-reveal data-sfx>
              <span className="mono">{String(i + 1).padStart(2, '0')}</span>
              <p>{a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
