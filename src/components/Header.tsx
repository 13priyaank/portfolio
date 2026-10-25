import { useEffect, useState } from 'react'
import { nav, profile } from '../data/profile'

export function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', open)
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    // close the sheet if the viewport grows past the mobile breakpoint
    const mq = window.matchMedia('(min-width: 860px)')
    const onMq = () => mq.matches && setOpen(false)
    window.addEventListener('keydown', onKey)
    mq.addEventListener('change', onMq)
    return () => {
      window.removeEventListener('keydown', onKey)
      mq.removeEventListener('change', onMq)
    }
  }, [open])

  return (
    <>
      <header className={`site-header${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
        <div className="wrap header-row">
          <a href="#top" className="brand" aria-label={`${profile.name}, back to top`} onClick={() => setOpen(false)}>
            <span className="brand-mark" aria-hidden="true">
              pw
            </span>
            <span className="brand-name">{profile.name}</span>
          </a>

          <nav className="nav-desktop" aria-label="Primary">
            {nav.map((n) => (
              <a key={n.id} href={`#${n.id}`}>
                {n.label}
              </a>
            ))}
          </nav>

          <a href={profile.resume} className="btn btn-small header-cta" download>
            Résumé <span aria-hidden="true">↓</span>
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

      {/* sibling of the header: its backdrop-filter would otherwise trap this fixed sheet */}
      <nav id="mobile-nav" className="nav-mobile" aria-label="Mobile" hidden={!open}>
        <ol>
          {nav.map((n, i) => (
            <li key={n.id}>
              <a href={`#${n.id}`} onClick={() => setOpen(false)}>
                <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                {n.label}
              </a>
            </li>
          ))}
        </ol>
        <div className="nav-mobile-foot">
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
          <a href={profile.resume} className="btn" download>
            Download résumé <span aria-hidden="true">↓</span>
          </a>
        </div>
      </nav>
    </>
  )
}
