import { useState } from 'react'
import { profile } from '../data/profile'
import { scrollToId } from '../lib/motion'
import { sound } from '../lib/sound'
import { stage } from '../three/stage'

export function Contact() {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    stage.honk()
    sound.honk()
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      /* clipboard unavailable: the mailto link still works */
    }
  }

  return (
    <section id="contact" className="leg leg-end" aria-labelledby="contact-title">
      <article className="card postcard contact-card" data-card="-0.8">
        <span className="stamp stamp-terra" aria-hidden="true">
          <span>✶</span>
          <small>Arrived</small>
        </span>
        <p className="exit-sign exit-blue" data-pop>
          <span className="exit-tab">Last stop</span>
          <span className="exit-main">Say hello</span>
        </p>
        <h2 id="contact-title" className="contact-title">
          You made it to the end of the road. <em>Let’s plan the next trip.</em>
        </h2>
        <p className="body">Have a project, a role or just a question? The fastest reply is by email.</p>

        <div className="contact-cta">
          <a className="contact-email" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
          <button type="button" className="btn btn-ink" onClick={copy}>
            {copied ? 'Copied ✓ (beep beep)' : 'Copy email'}
          </button>
          <span className="sr-only" role="status" aria-live="polite">
            {copied ? 'Email address copied to clipboard' : ''}
          </span>
        </div>

        <ul className="contact-links">
          <li>
            <a href={profile.linkedin} target="_blank" rel="noreferrer">
              <span>LinkedIn</span>
              <span aria-hidden="true">↗</span>
            </a>
          </li>
          <li>
            <a href={profile.github} target="_blank" rel="noreferrer">
              <span>GitHub</span>
              <span aria-hidden="true">↗</span>
            </a>
          </li>
          <li>
            <a href={profile.phoneHref}>
              <span>{profile.phone}</span>
              <span aria-hidden="true">☏</span>
            </a>
          </li>
          <li>
            <a href={profile.resume} download>
              <span>Résumé (PDF)</span>
              <span aria-hidden="true">↓</span>
            </a>
          </li>
        </ul>
      </article>

      <footer className="footer">
        <span>© 2026 {profile.name}</span>
        <span>Car, road and sounds made in code with three.js, GSAP and Web Audio</span>
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault()
            scrollToId('top')
          }}
        >
          Drive back to the start ↑
        </a>
      </footer>
    </section>
  )
}
