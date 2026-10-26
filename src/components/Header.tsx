import { useEffect, useState } from 'react'
import { nav, profile } from '../data/profile'
import { getLenis, scrollToId } from '../lib/motion'
import { sound } from '../lib/sound'

export function Header() {
  const [open, setOpen] = useState(false)
  const [soundOn, setSoundOn] = useState(sound.enabled)
  const [exit, setExit] = useState(-1)

  useEffect(() => sound.subscribe(setSoundOn), [])
  useEffect(() => {
    const on = (e: Event) => setExit((e as CustomEvent<number>).detail)
    window.addEventListener('exit-change', on)
    return () => window.removeEventListener('exit-change', on)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', open)
    if (open) getLenis()?.stop()
    else if (!document.documentElement.classList.contains('is-locked')) getLenis()?.start()
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const mq = window.matchMedia('(min-width: 900px)')
    const onMq = () => mq.matches && setOpen(false)
    window.addEventListener('keydown', onKey)
    mq.addEventListener('change', onMq)
    return () => {
      window.removeEventListener('keydown', onKey)
      mq.removeEventListener('change', onMq)
    }
  }, [open])

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    setOpen(false)
    requestAnimationFrame(() => scrollToId(id))
  }

  return (
    <>
      <header className={`site-header${open ? ' is-open' : ''}`}>
        <a href="#top" className="shield" onClick={go('top')} aria-label={`${profile.name}, back to the start`}>
          <span className="shield-top" aria-hidden="true">
            Route
          </span>
          <span className="shield-num" aria-hidden="true">
            PW
          </span>
        </a>

        <nav className="nav-desktop" aria-label="Primary">
          {nav.map((n, i) => (
            <a key={n.id} href={`#${n.id}`} onClick={go(n.id)} className={exit === i ? 'is-here' : undefined}>
              <span className="exit-no">{i + 1}</span>
              {n.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <button
            type="button"
            className={`sound-btn${soundOn ? ' is-on' : ''}`}
            onClick={() => sound.toggle()}
            aria-pressed={soundOn}
            aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
              {soundOn ? (
                <path
                  d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
              ) : (
                <path d="M16.5 9.5l5 5M21.5 9.5l-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
            <span className="sound-label">{soundOn ? 'Engine on' : 'Muted'}</span>
          </button>
          <a href={profile.resume} className="btn btn-ink header-cta" download>
            Résumé ↓
          </a>
          <button
            type="button"
            className="menu-btn"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
            <span className="menu-icon" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* a sibling of the header so its fixed position isn't trapped by header styles */}
      <nav id="mobile-nav" className="nav-mobile" aria-label="Mobile" hidden={!open}>
        <ol>
          {nav.map((n, i) => (
            <li key={n.id}>
              <a href={`#${n.id}`} onClick={go(n.id)}>
                <span className="exit-no">EXIT {i + 1}</span>
                {n.label}
              </a>
            </li>
          ))}
        </ol>
        <div className="nav-mobile-foot">
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
          <a href={profile.resume} className="btn btn-ink" download>
            Download résumé ↓
          </a>
        </div>
      </nav>
    </>
  )
}
