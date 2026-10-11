import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Header } from './components/Header'
import { Loader } from './components/Loader'
import { SoundToggle } from './components/SoundToggle'
import { OrbFallback } from './three/OrbFallback'
import { Hero } from './sections/Hero'
import { About } from './sections/About'
import { Skills } from './sections/Skills'
import { Experience } from './sections/Experience'
import { Projects } from './sections/Projects'
import { Education } from './sections/Education'
import { Contact } from './sections/Contact'
import { Cursor } from './components/Cursor'
import { Marquee } from './components/Marquee'
import { startInteractions } from './lib/interactions'
import { getLenis, gsap, ScrollTrigger, startSmoothScroll } from './lib/motion'
import { useReducedMotion } from './lib/env'
import { notifyStage, poses, stage } from './lib/stage'

// three.js + R3F are a separate chunk, fetched after the page shell is on screen
const Scene = lazy(() => import('./three/Scene'))

const POSE_SECTIONS: [string, keyof typeof poses][] = [
  ['top', 'hero'],
  ['about', 'about'],
  ['skills', 'skills'],
  ['experience', 'experience'],
  ['projects', 'projects'],
  ['education', 'education'],
  ['contact', 'contact'],
]

export default function App() {
  const reduced = useReducedMotion()
  const main = useRef<HTMLElement>(null)
  const [scene, setScene] = useState<'pending' | 'ready' | 'failed'>('pending')
  const [minTime, setMinTime] = useState(false)
  const [fonts, setFonts] = useState(false)
  const [done, setDone] = useState(false)
  const goRef = useRef(false)

  const onReady = useCallback(() => setScene((s) => (s === 'failed' ? s : 'ready')), [])
  const onFail = useCallback(() => setScene('failed'), [])

  // loading gate: fonts + a short minimum + scene (or a timeout so we never hang)
  useEffect(() => {
    const a = window.setTimeout(() => setMinTime(true), reduced ? 0 : 900)
    const b = window.setTimeout(() => setScene((s) => (s === 'pending' ? 'failed' : s)), 4500)
    document.fonts.ready.then(() => setFonts(true)).catch(() => setFonts(true))
    return () => {
      clearTimeout(a)
      clearTimeout(b)
    }
  }, [reduced])

  const ready = minTime && fonts && scene !== 'pending'

  // smooth scrolling (disabled entirely for reduced motion)
  useEffect(() => {
    if (reduced) return
    const stop = startSmoothScroll()
    return stop
  }, [reduced])

  useEffect(() => {
    const root = document.documentElement
    if (!done && !reduced) {
      root.classList.add('is-loading')
      getLenis()?.stop()
    } else {
      root.classList.remove('is-loading')
      getLenis()?.start()
    }
  }, [done, reduced])

  // scroll-linked reveals, parallax and timeline progress (GSAP only)
  useLayoutEffect(() => {
    if (reduced || !main.current) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          y: 34,
          opacity: 0,
          duration: 1.1,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        })
      })
      gsap.utils.toArray<HTMLElement>('[data-words]').forEach((h) => {
        gsap.from(h.querySelectorAll('.w > span'), {
          yPercent: 115,
          duration: 1.2,
          stagger: 0.06,
          ease: 'expo.out',
          scrollTrigger: { trigger: h, start: 'top 88%', once: true },
        })
      })
      gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
        gsap.fromTo(
          el,
          { y: 0 },
          {
            y: parseFloat(el.dataset.parallax || '-30'),
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
          },
        )
      })
      gsap.utils.toArray<HTMLElement>('[data-timeline]').forEach((el) => {
        gsap.fromTo(
          el,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            transformOrigin: 'top',
            scrollTrigger: { trigger: el.parentElement!.parentElement, start: 'top 60%', end: 'bottom 60%', scrub: 0.4 },
          },
        )
      })
      gsap.utils.toArray<HTMLElement>('[data-dot]').forEach((el) => {
        gsap.from(el, {
          scale: 0,
          duration: 0.6,
          ease: 'back.out(2)',
          scrollTrigger: { trigger: el, start: 'top 75%', once: true },
        })
      })
    }, main)
    return () => ctx.revert()
  }, [reduced])

  // 3D object travels between "poses" as each section takes over the screen
  useEffect(() => {
    const apply = (key: keyof typeof poses) => {
      const { spread, ...rest } = poses[key]
      if (reduced) {
        Object.assign(stage.pose, rest, goRef.current ? { spread } : {})
        notifyStage()
        return
      }
      gsap.to(stage.pose, {
        ...rest,
        ...(goRef.current && key !== 'hero' ? { spread } : {}),
        duration: 1.8,
        ease: 'power3.inOut',
        overwrite: 'auto',
      })
    }
    const triggers = POSE_SECTIONS.map(([id, key]) =>
      ScrollTrigger.create({
        trigger: `#${id}`,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => self.isActive && apply(key),
      }),
    )
    return () => triggers.forEach((t) => t.kill())
  }, [reduced])

  // magnetic buttons, orb energy on hover, click shockwave
  useEffect(() => {
    if (reduced) return
    return startInteractions()
  }, [reduced])

  // thin scroll-progress line along the top
  useLayoutEffect(() => {
    if (reduced) return
    const tween = gsap.fromTo(
      '.scroll-progress > span',
      { scaleX: 0 },
      { scaleX: 1, ease: 'none', scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: 0.3 } },
    )
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [reduced])

  // layout settles after fonts/images: recompute trigger positions
  useEffect(() => {
    if (fonts) ScrollTrigger.refresh()
  }, [fonts, done])

  const onLoaderDone = useCallback(() => {
    goRef.current = true
    setDone(true)
  }, [])

  // reduced motion skips the loader entirely
  useEffect(() => {
    if (reduced && ready && !done) onLoaderDone()
  }, [reduced, ready, done, onLoaderDone])

  return (
    <>
      <a href="#about" className="skip-link" onClick={(e) => { e.preventDefault(); document.getElementById('about')?.scrollIntoView() }}>
        Skip to content
      </a>

      <div className="scene-layer" aria-hidden="true">
        {scene === 'failed' ? (
          <OrbFallback />
        ) : (
          <Suspense fallback={null}>
            <Scene reduced={reduced} onReady={onReady} onFail={onFail} />
          </Suspense>
        )}
      </div>

      <Header reduced={reduced} />
      <div className="scroll-progress" aria-hidden="true"><span /></div>
      {!reduced && <Cursor />}

      <main ref={main} id="main">
        <Hero go={done} reduced={reduced} />
        <Marquee />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Education />
        <Contact />
      </main>

      <SoundToggle />
      {!done && <Loader ready={ready} reduced={reduced} onDone={onLoaderDone} />}
    </>
  )
}
