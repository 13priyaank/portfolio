import { achievements, experience } from '../data/profile'
import { SectionHead } from '../components/SectionHead'

export function Work() {
  return (
    <section id="work" className="leg" aria-labelledby="work-title">
      <div className="card card-head" data-card="0.8">
        <SectionHead exit="EXIT 02" label="Experience" title="Where I’ve clocked miles." italic="miles." id="work-title" />
      </div>

      {experience.map((job, i) => (
        <article key={job.company} className="card ticket" data-card={i % 2 ? '1' : '-0.8'}>
          <div className="ticket-stub">
            <span className="stub-label">{i === 0 ? 'Current' : 'Previous'}</span>
            <span className="stub-period">{job.period}</span>
            <span className="stub-no">No. 0{experience.length - i}</span>
          </div>
          <div className="ticket-main">
            <h3>{job.role}</h3>
            <p className="ticket-co">
              <strong>{job.company}</strong> · {job.place}
            </p>
            <ul className="ticket-points">
              {job.points.map((p) => (
                <li key={p.slice(0, 32)}>{p}</li>
              ))}
            </ul>
            {job.metric && (
              <figure className="metric" aria-label="Delivery time went from about 10 days to about 2 days after automation">
                <figcaption>Delivery time, before vs after automation</figcaption>
                <div className="metric-row">
                  <span>Before</span>
                  <span className="bar">
                    <span data-bar style={{ width: '100%' }} />
                  </span>
                  <span>~10 days</span>
                </div>
                <div className="metric-row is-after">
                  <span>After</span>
                  <span className="bar">
                    <span data-bar style={{ width: '20%' }} />
                  </span>
                  <span>~2 days</span>
                </div>
              </figure>
            )}
          </div>
        </article>
      ))}

      <article className="card card-small" data-card="-1.4">
        <h3 className="card-label">Souvenirs I’m proud of</h3>
        <ol className="wins">
          {achievements.map((a) => (
            <li key={a.slice(0, 20)}>{a}</li>
          ))}
        </ol>
      </article>
    </section>
  )
}
