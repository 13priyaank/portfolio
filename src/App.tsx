import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Intro } from './components/Intro'
import { Header } from './components/Header'
import { FormHud } from './components/FormHud'
import { Hero } from './sections/Hero'
import { About } from './sections/About'
import { Work } from './sections/Work'
import { Projects } from './sections/Projects'
import { Stack } from './sections/Stack'
import { Contact } from './sections/Contact'
import { gsap, prefersReducedMotion, ScrollTrigger, startSmoothScroll, getLenis } from './lib/motion'
import { sound } from './lib/sound'
import { stage } from './three/stage'
import type { ParticleField } from './three/ParticleField'

/** Sections in order; each one owns a particle form (see three/shapes.ts). */
const SECTIONS = ['top', 'about', 'work', 'projects', 'stack', 'contact']

export default function App() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const main = useRef<HTMLElement>(null)
  const [reduced] = useState(prefersReducedMotion)
  const [scene, setScene] = useState<'loading' | 'ready' | 'failed'>('loading')
  const [entered, setEntered] = useState(false)
  const [introGone, setIntroGone] = useState(false)

  // WebGL scene: its own chunk, started as soon as the shell is up
  useEffect(() => {
    let field: ParticleField | undefined
    let cancelled = false
    import('./three/ParticleField')
      .then(({ ParticleField }) => {
        if (cancelled || !canvas.current) return
        field = new ParticleField(canvas.current, { reduced })
        setScene('ready')
      })
      .catch(() => setScene('failed'))
    return () => {
      cancelled = true
      field?.dispose()
    }
  }, [reduced])

  // pointer drives repulsion + tilt; a click anywhere sends a shockwave
  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      stage.pointer.x = (e.clientX / innerWidth) * 2 - 1
      stage.pointer.y = -(e.clientY / innerHeight) * 2 + 1
      stage.pointer.active = true
    }
    const leave = () => (stage.pointer.active = false)
    const down = (e: PointerEvent) => {
      const t = e.target as HTMLElement
      if (t.closest('a, button, summary')) sound.click()
      else if (!t.closest('.intro')) {
        stage.pulse()
        sound.click()
      }
    }
    let lastHover: Element | null = null
    const over = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest('a, button, [data-sfx]')
      if (el && el !== lastHover) sound.hover()
      lastHover = el
    }
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerleave', leave)
    window.addEventListener('pointerdown', down)
    document.addEventListener('mouseover', over)
    return () => {
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', leave)
      window.removeEventListener('pointerdown', down)
      document.removeEventListener('mouseover', over)
    }
  }, [])

  // smooth scroll, locked until the intro is dismissed
  useEffect(() => {
    if (reduced) return
    return startSmoothScroll()
  }, [reduced])

  useEffect(() => {
    document.documentElement.classList.toggle('is-locked', !entered)
    if (entered) getLenis()?.start()
    else getLenis()?.stop()
  }, [entered])

  // scroll choreography
  useLayoutEffect(() => {
    if (!main.current) return
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      // projects: pinned horizontal gallery on wide screens
      mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
        const track = document.querySelector<HTMLElement>('.p-track')
        const wrap = document.querySelector<HTMLElement>('.p-pin')
        if (!track || !wrap) return
        const dist = () => track.scrollWidth - window.innerWidth + 64
        gsap.to(track, {
          x: () => -dist(),
          ease: 'none',
          scrollTrigger: {
            trigger: wrap,
            start: 'top top',
            end: () => `+=${dist()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const bar = document.querySelector<HTMLElement>('.p-progress > span')
              if (bar) bar.style.transform = `scaleX(${self.progress})`
            },
          },
        })
      })

      // one trigger per section boundary; their summed progress is the particle form
      const morphs = SECTIONS.slice(1).map((id) => ScrollTrigger.create({ trigger: `#${id}`, start: 'top 85%', end: 'top 15%' }))
      let lastForm = 0
      const tick = () => {
        const t = morphs.reduce((sum, m) => sum + m.progress, 0)
        stage.target = t
        const form = Math.round(t)
        if (form !== lastForm) {
          sound.whoosh(form > lastForm)
          sound.section(form)
          window.dispatchEvent(new CustomEvent('form-change', { detail: form }))
          lastForm = form
        }
      }
      gsap.ticker.add(tick)

      if (reduced) return () => gsap.ticker.remove(tick)

      // headings: words rise out of a mask
      gsap.utils.toArray<HTMLElement>('[data-split]').forEach((h) => {
        gsap.from(h.querySelectorAll('.w > span'), {
          yPercent: 115,
          rotate: 4,
          duration: 1.1,
          stagger: 0.06,
          ease: 'expo.out',
          scrollTrigger: { trigger: h, start: 'top 85%', once: true },
        })
      })

      // generic reveal, staggered within a group
      gsap.utils.toArray<HTMLElement>('[data-reveal-group]').forEach((g) => {
        gsap.from(g.querySelectorAll('[data-reveal]'), {
          y: 40,
          opacity: 0,
          duration: 1,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: { trigger: g, start: 'top 82%', once: true },
        })
      })

      // experience: glowing spine draws as you scroll
      gsap.fromTo(
        '.spine-fill',
        { scaleY: 0 },
        { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.jobs', start: 'top 65%', end: 'bottom 60%', scrub: 0.5 } },
      )

      // metric bars + counters fill on view
      gsap.utils.toArray<HTMLElement>('[data-bar]').forEach((b) => {
        gsap.from(b, {
          scaleX: 0,
          duration: 1.6,
          ease: 'expo.out',
          scrollTrigger: { trigger: b, start: 'top 90%', once: true },
        })
      })
      gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
        const end = Number(el.dataset.count)
        const obj = { v: el.dataset.from ? Number(el.dataset.from) : 0 }
        gsap.to(obj, {
          v: end,
          duration: 2,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          onUpdate: () => (el.textContent = String(Math.round(obj.v))),
        })
      })

      // hero drifts up and fades as you leave it
      gsap.to('.hero-inner', {
        yPercent: -18,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: '#top', start: 'top top', end: 'bottom 20%', scrub: true },
      })

      // big contact line scales in
      gsap.from('.contact-title', {
        scale: 0.85,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: '#contact', start: 'top 90%', end: 'top 30%', scrub: true },
      })

      // top progress bar
      gsap.fromTo(
        '.scroll-progress > span',
        { scaleX: 0 },
        { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } },
      )

      return () => gsap.ticker.remove(tick)
    })

    // fonts change layout: recompute trigger positions once they land
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    return () => ctx.revert()
  }, [reduced])

  // hero entrance once the intro is gone
  useLayoutEffect(() => {
    if (!entered) return
    ScrollTrigger.refresh()
    if (reduced) return
    const tl = gsap.timeline({ delay: 0.15 })
    tl.from('.hero .ch', { yPercent: 120, opacity: 0, rotate: 8, duration: 1.2, stagger: 0.035, ease: 'expo.out' })
      .from('.hero [data-hero]', { y: 30, opacity: 0, duration: 1, stagger: 0.1, ease: 'power3.out' }, '-=0.8')
      .from('.site-header, .form-hud', { y: -20, opacity: 0, duration: 0.8, ease: 'power2.out' }, '-=0.9')
    return () => {
      tl.kill()
    }
  }, [entered, reduced])

  const onEnter = useCallback((withSound: boolean) => {
    if (withSound) {
      sound.setEnabled(true)
      sound.chime()
    }
    stage.intro = 1
    window.setTimeout(() => stage.pulse(), 700)
    setEntered(true)
  }, [])

  return (
    <>
      <canvas ref={canvas} className="webgl" aria-hidden="true" />
      {scene === 'failed' && <div className="webgl-fallback" aria-hidden="true" />}
      <div className="vignette" aria-hidden="true" />
      <div className="scroll-progress" aria-hidden="true">
        <span />
      </div>

      <Header />
      <FormHud />

      <main ref={main} id="main">
        <Hero />
        <About />
        <Work />
        <Projects />
        <Stack />
        <Contact />
      </main>

      {!introGone && <Intro ready={scene !== 'loading'} onEnter={onEnter} onDone={() => setIntroGone(true)} />}
    </>
  )
}
