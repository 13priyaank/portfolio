import { useState } from 'react'
import { profile } from '../data/profile'
import { useLocalTime } from '../lib/useLocalTime'

export function Contact() {
  const [copied, setCopied] = useState(false)
  const time = useLocalTime()

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable: the mailto link still works */
    }
  }

  return (
    <section id="contact" className="contact" aria-labelledby="contact-title">
      <div className="wrap">
        <p className="eyebrow eyebrow-dark">
          <span>05</span>
          <span>Contact</span>
        </p>
        <h2 id="contact-title" className="contact-title" data-reveal>
          Got something worth building? <span className="hl">Let’s talk.</span>
        </h2>

        <div className="contact-email" data-reveal>
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
          <button type="button" className="btn btn-small btn-invert" onClick={copy}>
            {copied ? 'Copied ✓' : 'Copy'}
          </button>
          <span className="sr-only" role="status" aria-live="polite">
            {copied ? 'Email address copied to clipboard' : ''}
          </span>
        </div>

        <ul className="contact-links" data-reveal>
          <li>
            <a href={profile.linkedin} target="_blank" rel="noreferrer">
              <span className="mono">LinkedIn</span>
              <span>/in/priyank-wadiwala ↗</span>
            </a>
          </li>
          <li>
            <a href={profile.github} target="_blank" rel="noreferrer">
              <span className="mono">GitHub</span>
              <span>@13priyaank ↗</span>
            </a>
          </li>
          <li>
            <a href={profile.phoneHref}>
              <span className="mono">Phone</span>
              <span>{profile.phone}</span>
            </a>
          </li>
          <li>
            <a href={profile.resume} download>
              <span className="mono">Résumé</span>
              <span>PDF download ↓</span>
            </a>
          </li>
        </ul>

        <footer className="footer mono">
          <span>© 2026 {profile.name}</span>
          <span>
            {profile.location.split(' / ')[0]} · {time} IST
          </span>
          <a href="#top">Back to top ↑</a>
        </footer>
      </div>
    </section>
  )
}
