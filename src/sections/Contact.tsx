import { useRef, useState } from 'react'
import { profile } from '../data/profile'
import { scrollToId } from '../lib/motion'
import { stage } from '../three/stage'

export function Contact() {
  const [copied, setCopied] = useState(false)
  const magnet = useRef<HTMLButtonElement>(null)

  const copy = async () => {
    stage.pulse()
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      /* clipboard unavailable: the mailto link still works */
    }
  }

  // the button leans toward the pointer
  const pull = (e: React.PointerEvent) => {
    const el = magnet.current
    if (!el || e.pointerType !== 'mouse') return
    const r = el.getBoundingClientRect()
    el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`
  }
  const release = () => magnet.current && (magnet.current.style.transform = '')

  return (
    <section id="contact" className="contact" aria-labelledby="contact-title">
      <p className="label mono">
        <span className="label-index">05</span>
        <span className="label-line" aria-hidden="true" />
        Contact
      </p>
      <h2 id="contact-title" className="contact-title">
        Let’s build
        <br />
        <span className="grad">something real.</span>
      </h2>
      <p className="contact-sub">Have a project, a role or just a question? The fastest reply is by email.</p>

      <div className="contact-cta" onPointerMove={pull} onPointerLeave={release}>
        <a className="contact-email" href={`mailto:${profile.email}`}>
          {profile.email}
        </a>
        <button ref={magnet} type="button" className="btn btn-glow" onClick={copy}>
          {copied ? 'Copied ✓' : 'Copy email'}
        </button>
        <span className="sr-only" role="status" aria-live="polite">
          {copied ? 'Email address copied to clipboard' : ''}
        </span>
      </div>

      <ul className="socials">
        <li>
          <a href={profile.linkedin} target="_blank" rel="noreferrer" className="glass">
            LinkedIn <span aria-hidden="true">↗</span>
          </a>
        </li>
        <li>
          <a href={profile.github} target="_blank" rel="noreferrer" className="glass">
            GitHub <span aria-hidden="true">↗</span>
          </a>
        </li>
        <li>
          <a href={profile.phoneHref} className="glass">
            {profile.phone}
          </a>
        </li>
        <li>
          <a href={profile.resume} download className="glass">
            Résumé <span aria-hidden="true">↓</span>
          </a>
        </li>
      </ul>

      <footer className="footer mono">
        <span>© 2026 {profile.name}</span>
        <span>Built with Three.js, GSAP and Web Audio</span>
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault()
            scrollToId('top')
          }}
        >
          Back to top ↑
        </a>
      </footer>
    </section>
  )
}
