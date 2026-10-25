import { profile } from '../data/profile'
import { scrollToId } from '../lib/motion'

const chars = (word: string) =>
  [...word].map((c, i) => (
    <span className="ch" key={i}>
      {c}
    </span>
  ))

export function Hero() {
  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <div className="hero-inner">
        <p className="hero-kicker mono" data-hero>
          <span className="live-dot" aria-hidden="true" />
          Full-stack engineer · Vadodara, India
        </p>

        <h1 id="hero-title" className="hero-title" aria-label={profile.name}>
          <span className="row" aria-hidden="true">
            {chars('Priyank')}
          </span>
          <span className="row row-outline" aria-hidden="true">
            {chars('Wadiwala')}
          </span>
        </h1>

        <p className="hero-sub" data-hero>
          I build the product layer between <span className="grad">people, data and AI</span>: Java and FastAPI services, Next.js
          front ends, and the Docker pipelines that ship them.
        </p>

        <div className="hero-actions" data-hero>
          <a
            href="#projects"
            className="btn btn-glow"
            onClick={(e) => {
              e.preventDefault()
              scrollToId('projects')
            }}
          >
            Explore my work <span aria-hidden="true">→</span>
          </a>
          <a href={`mailto:${profile.email}`} className="btn btn-ghost">
            Get in touch
          </a>
        </div>
      </div>

      <div className="scroll-cue mono" data-hero aria-hidden="true">
        <span className="mouse">
          <i />
        </span>
        Scroll to morph the universe
      </div>
    </section>
  )
}
