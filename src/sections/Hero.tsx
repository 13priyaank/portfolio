import { profile } from '../data/profile'
import { scrollToId } from '../lib/motion'

export function Hero() {
  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="hero-kicker" data-hero>
          <span className="pin" aria-hidden="true" />
          Starting from Vadodara, India
        </p>
        <h1 id="hero-title" className="hero-title" aria-label={profile.name}>
          <span className="w" aria-hidden="true">
            <span>Priyank</span>
          </span>{' '}
          <span className="w it" aria-hidden="true">
            <span>Wadiwala</span>
          </span>
        </h1>
        <p className="hero-sub" data-hero>
          Full-stack engineer. I build the product layer between people, data and AI: Java and FastAPI services, Next.js front
          ends, and the Docker pipelines that ship them.
        </p>
        <div className="hero-actions" data-hero>
          <a
            href="#projects"
            className="btn btn-ink"
            onClick={(e) => {
              e.preventDefault()
              scrollToId('projects')
            }}
          >
            Skip to the projects
          </a>
          <a href={`mailto:${profile.email}`} className="btn btn-paper">
            Email me
          </a>
        </div>
        <div className="hero-stickers" aria-hidden="true">
          <span className="sticker sticker-teal" data-sticker>
            Now @ OnePrism
          </span>
          <span className="sticker sticker-mustard" data-sticker>
            Healthcare + AI
          </span>
          <span className="sticker sticker-terra" data-sticker>
            Java · FastAPI · Next.js
          </span>
        </div>
      </div>

      <p className="scroll-hint" data-hero aria-hidden="true">
        <span className="hint-wheel" />
        Scroll to drive
      </p>
    </section>
  )
}
