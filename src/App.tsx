import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Intro } from './components/Intro'
import { Header } from './components/Header'
import { Dashboard } from './components/Dashboard'
import { Hero } from './sections/Hero'
import { About } from './sections/About'
import { Work } from './sections/Work'
import { Projects } from './sections/Projects'
import { Stack } from './sections/Stack'
import { Contact } from './sections/Contact'
import { getLenis, gsap, prefersReducedMotion, ScrollTrigger, startSmoothScroll } from './lib/motion'
import { sound } from './lib/sound'
import { stage } from './three/stage'
import type { RoadTrip } from './three/RoadTrip'

/** Sections after the hero, in driving order; each has an exit sign on the road. */
const STOPS = ['about', 'work', 'projects', 'stack', 'contact']

export default function App() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const trip = useRef<RoadTrip | null>(null)
  const [reduced] = useState(prefersReducedMotion)
  const [scene, setScene] = useState<'loading' | 'ready' | 'failed'>('loading')
  const [started, setStarted] = useState(false)
  const [introGone, setIntroGone] = useState(false)

  // WebGL road trip: its own chunk, booted while the intro is up
  useEffect(() => {
    let cancelled = false
    import('./three/RoadTrip')
      .then(({ RoadTrip }) => {
        if (cancelled || !canvas.current) return
        trip.current = new RoadTrip(canvas.current, { reduced })
        setScene('ready')
      })
      .catch(() => setScene('failed'))
    return () => {
      cancelled = true
      trip.current?.dispose()
      trip.current = null
    }
  }, [reduced])

  // pointer parallax, horn on clicking the open road, indicator ticks on hover
  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      stage.pointer.x = (e.clientX / innerWidth) * 2 - 1
      stage.pointer.y = -(e.clientY / innerHeight) * 2 + 1
    }
    const down = (e: PointerEvent) => {
      const t = e.target as HTMLElement
      // only the scenery honks; cards, links and the dashboard don't
      if (t.closest('a, button, summary, .card, .site-header, .dash, .intro, .nav-mobile')) return
      stage.honk()
      sound.honk()
    }
    let lastHover: Element | null = null
    const over = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest('a, button, [data-sfx]')
      if (el && el !== lastHover) sound.tick()
      lastHover = el
    }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', down)
    document.addEventListener('mouseover', over)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
      document.removeEventListener('mouseover', over)
    }
  }, [])

  useEffect(() => {
    if (reduced) return
    return startSmoothScroll()
  }, [reduced])

  useEffect(() => {
    document.documentElement.classList.toggle('is-locked', !started)
    if (started) getLenis()?.start()
    else getLenis()?.stop()
  }, [started])

  // scroll → car position, exits, engine note, and the card choreography
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => (stage.progress = self.progress),
      })

      // where each section begins along the road, so signs line up with the copy
      const measure = () => {
        const max = ScrollTrigger.maxScroll(window) || 1
        stage.milestones = STOPS.map((id) => {
          const el = document.getElementById(id)
          if (!el) return 1
          const top = el.getBoundingClientRect().top + window.scrollY
          return Math.min(1, Math.max(0.02, (top - innerHeight * 0.55) / max))
        })
        trip.current?.placeSigns()
      }
      ScrollTrigger.addEventListener('refresh', measure)
      measure()

      let lastExit = -1
      const tick = () => {
        sound.setSpeed(stage.speed)
        const passed = stage.milestones.filter((m) => stage.progress >= m).length - 1
        if (passed !== lastExit) {
          if (lastExit !== -2) sound.chime(passed > lastExit)
          lastExit = passed
          window.dispatchEvent(new CustomEvent('exit-change', { detail: passed }))
        }
      }
      lastExit = -2
      gsap.ticker.add(tick)

      if (!reduced) {
        // cards land on the table like postcards being dealt
        gsap.utils.toArray<HTMLElement>('[data-card]').forEach((el) => {
          const tilt = Number(el.dataset.card) || 0
          gsap.set(el, { rotation: tilt })
          gsap.from(el, {
            y: 110,
            opacity: 0,
            rotation: tilt + (tilt >= 0 ? 7 : -7),
            duration: 1.1,
            ease: 'back.out(1.4)',
            scrollTrigger: { trigger: el, start: 'top 92%', once: true },
          })
        })
        gsap.utils.toArray<HTMLElement>('[data-pop]').forEach((el) => {
          gsap.from(el, {
            scale: 0,
            rotation: -40,
            duration: 0.8,
            ease: 'back.out(2.2)',
            delay: Number(el.dataset.pop) || 0,
            scrollTrigger: { trigger: el, start: 'top 92%', once: true },
          })
        })
        gsap.utils.toArray<HTMLElement>('[data-split]').forEach((h) => {
          gsap.from(h.querySelectorAll('.w > span'), {
            yPercent: 110,
            duration: 1,
            stagger: 0.05,
            ease: 'expo.out',
            scrollTrigger: { trigger: h, start: 'top 90%', once: true },
          })
        })
        gsap.utils.toArray<HTMLElement>('[data-bar]').forEach((b) => {
          gsap.from(b, {
            scaleX: 0,
            duration: 1.6,
            ease: 'expo.out',
            scrollTrigger: { trigger: b, start: 'top 92%', once: true },
          })
        })
        gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
          const obj = { v: Number(el.dataset.from ?? 0) }
          gsap.to(obj, {
            v: Number(el.dataset.count),
            duration: 1.8,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 92%', once: true },
            onUpdate: () => (el.textContent = String(Math.round(obj.v))),
          })
        })
        // hero copy drifts off as the car pulls away
        gsap.to('.hero-copy, .scroll-hint', {
          y: -80,
          opacity: 0,
          ease: 'none',
          scrollTrigger: { trigger: '#top', start: 'top top', end: 'bottom 30%', scrub: true },
        })
      }

      return () => {
        gsap.ticker.remove(tick)
        ScrollTrigger.removeEventListener('refresh', measure)
      }
    })
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    return () => ctx.revert()
  }, [reduced])

  // hero entrance once the engine is started
  useLayoutEffect(() => {
    if (!started) return
    ScrollTrigger.refresh()
    if (reduced) return
    const tl = gsap.timeline({ delay: 0.2 })
    tl.from('.hero .w > span', { yPercent: 110, duration: 1.1, stagger: 0.06, ease: 'expo.out' })
      .from('.hero [data-hero]', { y: 24, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' }, '-=0.7')
      .from('.hero [data-sticker]', { scale: 0, rotation: -30, duration: 0.7, stagger: 0.08, ease: 'back.out(2)' }, '-=0.6')
      .from('.site-header, .dash', { y: (i) => (i ? 40 : -40), opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.8')
    return () => {
      tl.kill()
    }
  }, [started, reduced])

  const onStart = useCallback((withSound: boolean) => {
    if (withSound) {
      sound.setEnabled(true)
      sound.ignition()
    }
    window.setTimeout(() => stage.honk(), withSound ? 900 : 200)
    setStarted(true)
  }, [])

  return (
    <>
      <canvas ref={canvas} className="webgl" aria-hidden="true" />
      {scene === 'failed' && <div className="webgl-fallback" aria-hidden="true" />}

      <Header />
      <main id="main">
        <Hero />
        <About />
        <Work />
        <Projects />
        <Stack />
        <Contact />
      </main>
      <Dashboard />

      {!introGone && <Intro ready={scene !== 'loading'} onStart={onStart} onDone={() => setIntroGone(true)} />}
    </>
  )
}
