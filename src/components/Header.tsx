import { useEffect, useState } from 'react'
import { nav, profile } from '../data/profile'
import { getLenis, scrollToId } from '../lib/motion'
import { sound } from '../lib/sound'

export function Header() {
  const [open, setOpen] = useState(false)
  const [soundOn, setSoundOn] = useState(sound.enabled)

  useEffect(() => sound.subscribe(setSoundOn), [])

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
    // wait a frame so the menu's scroll lock is released first
    requestAnimationFrame(() => scrollToId(id))
  }

  return (
    <>
      <header className={`site-header${open ? ' is-open' : ''}`}>
        <a href="#top" className="brand" onClick={go('top')} aria-label={`${profile.name}, back to top`}>
          <span className="brand-orb" aria-hidden="true" />
          <span className="brand-text">
            Priyank<b>.</b>
          </span>
        </a>

        <nav className="nav-desktop" aria-label="Primary">
          {nav.map((n, i) => (
            <a key={n.id} href={`#${n.id}`} onClick={go(n.id)}>
              <span className="mono">0{i + 1}</span>
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
          >
            <span className="eq" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
            <span className="sound-label">{soundOn ? 'Sound on' : 'Sound off'}</span>
          </button>
          <a href={profile.resume} className="btn btn-glow header-cta" download>
            Résumé
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

      {/* a sibling of the header: its backdrop-filter would trap this fixed sheet */}
      <nav id="mobile-nav" className={`nav-mobile${open ? ' is-open' : ''}`} aria-label="Mobile" hidden={!open}>
        <ol>
          {nav.map((n, i) => (
            <li key={n.id} style={{ transitionDelay: `${0.05 + i * 0.05}s` }}>
              <a href={`#${n.id}`} onClick={go(n.id)}>
                <span className="mono">0{i + 1}</span>
                {n.label}
              </a>
            </li>
          ))}
        </ol>
        <div className="nav-mobile-foot">
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
          <a href={profile.resume} className="btn btn-glow" download>
            Download résumé
          </a>
        </div>
      </nav>
    </>
  )
}
