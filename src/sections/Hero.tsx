import { profile } from '../data/profile'
import { useLocalTime } from '../lib/useLocalTime'

export function Hero() {
  const time = useLocalTime()

  return (
    <section id="top" className="hero" aria-labelledby="hero-name">
      <div className="wrap">
        <div className="hero-meta mono">
          <span>Portfolio / 2026</span>
          <span>
            Vadodara, IN <span className="dot" aria-hidden="true" /> {time} IST
          </span>
        </div>

        <div className="hero-name-block">
          <h1 id="hero-name" className="hero-name">
            <span className="line">{profile.first}</span>
            <span className="line line-2">{profile.last}</span>
          </h1>

          <figure className="snapshot">
            <img
              src="/images/priyank-portrait-sm.webp"
              alt="Priyank smiling outdoors, wearing clear-framed glasses"
              width={640}
              height={640}
              fetchPriority="high"
            />
            <figcaption className="mono">that’s me ↑</figcaption>
          </figure>
        </div>

        <div className="hero-body">
          <p className="hero-lede">
            I build the product layer between <mark className="hl">people, data and AI.</mark>
          </p>

          <div className="hero-side">
            <p>{profile.intro}</p>
            <div className="hero-actions">
              <a href={`mailto:${profile.email}`} className="btn btn-solid">
                Email me <span aria-hidden="true">→</span>
              </a>
              <a href="#projects" className="btn">
                See projects
              </a>
            </div>
          </div>
        </div>

        <dl className="hero-facts">
          <div>
            <dt className="mono">Role</dt>
            <dd>{profile.title}</dd>
          </div>
          <div>
            <dt className="mono">Currently</dt>
            <dd>OnePrism LLP, healthcare + AI</dd>
          </div>
          <div>
            <dt className="mono">Works in</dt>
            <dd>Java, FastAPI, Next.js, Docker</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
