import { useState } from 'react'
import { profile } from '../data/profile'
import { SplitText } from '../components/SplitText'
import { Terminal } from '../components/Terminal'
import { sfx } from '../lib/sound'

export function Contact() {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    sfx.tick()
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      /* clipboard unavailable: the mailto link still works */
    }
  }

  return (
    <section id="contact" className="section contact" aria-labelledby="contact-title">
      <div className="shell flex min-h-[88svh] flex-col justify-end">
        <p data-reveal className="mono-label mb-6 flex items-center gap-3">
          <span className="text-accent">06</span>
          <span className="h-px w-8 bg-line-strong" aria-hidden="true" />
          <span>Contact</span>
        </p>
        <SplitText as="h2" text="Have something worth *building*? Let’s talk." className="display max-w-5xl text-[clamp(2.8rem,8vw,7.5rem)]" />
        <span id="contact-title" className="sr-only">Contact</span>

        <div data-reveal className="mt-12 flex flex-wrap items-center gap-x-5 gap-y-3">
          <a href={`mailto:${profile.email}`} className="email-link" onClick={() => sfx.tick()}>
            {profile.email}
          </a>
          <button type="button" className="btn btn-ghost btn-sm" onClick={copy}>
            {copied ? 'Copied' : 'Copy'}
          </button>
          <span className="sr-only" role="status" aria-live="polite">
            {copied ? 'Email address copied to clipboard' : ''}
          </span>
        </div>

        <div data-reveal className="mt-8 flex flex-wrap gap-3">
          <a href={`mailto:${profile.email}`} className="btn btn-solid" onClick={() => sfx.tick()}>
            Email me
          </a>
          <a href={profile.linkedin} className="btn btn-ghost" target="_blank" rel="noopener noreferrer" onClick={() => sfx.tick()}>
            LinkedIn
          </a>
          <a href={profile.github} className="btn btn-ghost" target="_blank" rel="noopener noreferrer" onClick={() => sfx.tick()}>
            GitHub
          </a>
          <a href={profile.resume} download className="btn btn-ghost" onClick={() => sfx.tick()}>
            Download résumé
          </a>
        </div>

        <div className="mt-20 max-w-3xl">
          <p data-reveal className="mono-label mb-4">Or ask the terminal</p>
          <Terminal />
        </div>

        <footer className="mt-24 flex flex-wrap items-center justify-between gap-4 border-t border-line pb-24 pt-6 sm:pb-10">
          <div className="flex items-center gap-3">
            <img src="/images/priyank-avatar.webp" alt="" width={36} height={36} loading="lazy" className="h-9 w-9 rounded-full object-cover object-[50%_20%]" />
            <p className="mono-label">© 2026 {profile.name} · {profile.location}</p>
          </div>
          <a href={profile.phoneHref} className="mono-label hover:!text-fg">{profile.phone}</a>
        </footer>
      </div>
    </section>
  )
}
