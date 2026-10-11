import { useEffect, useState } from 'react'
import { nav, profile } from '../data/profile'
import { scrollToId, ScrollTrigger } from '../lib/motion'
import { sfx } from '../lib/sound'

export function Header({ reduced }: { reduced: boolean }) {
  const [active, setActive] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const triggers = nav.map((n) =>
      ScrollTrigger.create({
        trigger: `#${n.id}`,
        start: 'top 50%',
        end: 'bottom 50%',
        onToggle: (self) => {
          if (self.isActive) setActive(n.id)
        },
      }),
    )
    const top = ScrollTrigger.create({
      trigger: 'body',
      start: 'top top',
      end: '+=300',
      onLeaveBack: () => setActive(''),
    })
    return () => {
      triggers.forEach((t) => t.kill())
      top.kill()
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', open)
    if (!open) return
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [open])

  const go = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    sfx.whoosh()
    setOpen(false)
    // wait a frame so the menu overlay releases scroll lock first
    requestAnimationFrame(() => scrollToId(id, reduced))
  }

  return (
    <header className="site-header" data-intro-header>
      <a href="#top" className="brand" onClick={(e) => { e.preventDefault(); sfx.tick(); setOpen(false); window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }) }} aria-label="Priyank Wadiwala, back to top">
        <span className="display text-2xl leading-none">
          P<span className="em">W</span>
        </span>
        <span className="mono-label hidden sm:inline">{profile.title}</span>
      </a>

      <nav aria-label="Primary" className="hidden lg:block">
        <ul className="flex items-center gap-8">
          {nav.map((n) => (
            <li key={n.id}>
              <a
                href={`#${n.id}`}
                className={`nav-link ${active === n.id ? 'is-active' : ''}`}
                aria-current={active === n.id ? 'true' : undefined}
                onClick={(e) => go(e, n.id)}
              >
                {n.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex items-center gap-3">
        <a href={profile.resume} download className="btn btn-ghost btn-sm hidden sm:inline-flex" onClick={() => sfx.tick()}>
          Résumé
        </a>
        <button
          type="button"
          className="menu-btn lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => { sfx.tick(); setOpen((v) => !v) }}
        >
          <span className="mono-label !text-fg">{open ? 'Close' : 'Menu'}</span>
        </button>
      </div>

      <div id="mobile-menu" className={`mobile-menu ${open ? 'is-open' : ''}`} hidden={!open}>
        <ul>
          {nav.map((n, i) => (
            <li key={n.id}>
              <a href={`#${n.id}`} onClick={(e) => go(e, n.id)}>
                <span className="mono-label">0{i + 1}</span>
                <span className="display text-5xl">{n.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  )
}
