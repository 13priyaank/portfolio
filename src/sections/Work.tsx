import { achievements, experience } from '../data/profile'
import { SectionHead } from '../components/SectionHead'

export function Work() {
  return (
    <section id="work" className="section" aria-labelledby="work-title">
      <div className="wrap">
        <SectionHead index="02" label="Experience" title="Where I’ve shipped" count={experience.length} id="work-title" />

        <ol className="jobs">
          {experience.map((job, i) => (
            <li key={job.company} className="job" data-reveal>
              <div className="job-when mono">
                <span>{job.period}</span>
                {i === 0 && <span className="now">Now</span>}
              </div>

              <div className="job-main">
                <h3 className="job-role">
                  {job.role} <span className="at">at</span> {job.company}
                </h3>
                <p className="job-place mono">{job.place}</p>
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
                        <span style={{ width: '100%' }} />
                      </span>
                      <span className="mono">10 days</span>
                    </div>
                    <div className="metric-row is-after">
                      <span className="mono">After</span>
                      <span className="bar">
                        <span style={{ width: '20%' }} />
                      </span>
                      <span className="mono">2 days</span>
                    </div>
                    <figcaption>Metadata-driven automation took the manual steps out of every release.</figcaption>
                  </figure>
                )}
              </div>
            </li>
          ))}
        </ol>

        <div className="wins" data-reveal>
          <h3 className="mono small-title">Things I’m proud of</h3>
          <ul>
            {achievements.map((a, i) => (
              <li key={a.slice(0, 24)}>
                <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                {a}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
