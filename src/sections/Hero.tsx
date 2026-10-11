import { useEffect, useLayoutEffect, useRef } from 'react'
import { profile } from '../data/profile'
import { SplitText } from '../components/SplitText'
import { gsap } from '../lib/motion'
import { stage } from '../lib/stage'
import { notifyStage } from '../lib/stage'
import { scrollToId } from '../lib/motion'
import { sfx } from '../lib/sound'
import { isCoarsePointer } from '../lib/env'

type Props = { go: boolean; reduced: boolean }

export function Hero({ go, reduced }: Props) {
  const root = useRef<HTMLElement>(null)

  // hide intro elements before first paint (only when motion is allowed)
  useLayoutEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      gsap.set('[data-intro-words] .w > span', { yPercent: 115 })
      gsap.set('[data-intro]', { opacity: 0, y: 24 })
      gsap.set('.hero-frame', { clipPath: 'inset(100% 0% 0% 0%)' })
      gsap.set('.hero-photo', { scale: 1.3 })
      gsap.set('.hero-outline', { opacity: 0 })
      gsap.set(document.querySelector('[data-intro-header]'), { opacity: 0 })
    }, root)
    return () => ctx.revert()
  }, [reduced])

  // cinematic entrance once the loader has gone
  useEffect(() => {
    if (!go) return
    if (reduced) {
      stage.pose.spread = 0
      notifyStage()
      return
    }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
      tl.to(stage.pose, { spread: 0, duration: 2.6, ease: 'power3.inOut' }, 0)
        .to('.hero-frame', { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' }, 0.15)
        .to('.hero-photo', { scale: 1, duration: 2, ease: 'expo.out' }, 0.15)
        .to('.hero-outline', { opacity: 1, duration: 1.2, ease: 'power2.out' }, 0.9)
        .to('[data-intro-words] .w > span', { yPercent: 0, duration: 1.3, stagger: 0.09 }, 0.35)
        .to('[data-intro]', { opacity: 1, y: 0, duration: 1.1, stagger: 0.1 }, 0.8)
        .to(document.querySelector('[data-intro-header]'), { opacity: 1, duration: 1, ease: 'power2.out' }, 1.2)
    }, root)
    return () => ctx.revert()
  }, [go, reduced])

  // pointer parallax at different depths
  useEffect(() => {
    const el = root.current
    if (!el || reduced || isCoarsePointer()) return
    const layers = Array.from(el.querySelectorAll<HTMLElement>('[data-depth]'))
    const setters = layers.map((l) => ({
      d: parseFloat(l.dataset.depth || '0'),
      x: gsap.quickTo(l, 'x', { duration: 1.1, ease: 'power3.out' }),
      y: gsap.quickTo(l, 'y', { duration: 1.1, ease: 'power3.out' }),
    }))
    const move = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5
      const ny = e.clientY / window.innerHeight - 0.5
      setters.forEach((s) => {
        s.x(nx * s.d)
        s.y(ny * s.d)
      })
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [reduced])

  return (
    <section id="top" ref={root} className="hero" aria-label="Introduction">
      <div className="shell grid min-h-[100svh] grid-cols-12 items-center gap-x-0 pb-20 lg:gap-x-6 pt-28 lg:pt-24">
        <div className="relative z-10 col-span-12 lg:col-span-7">
          <p data-intro className="mono-label mb-7 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
            {profile.title} <span className="text-line-strong">/</span> {profile.location}
          </p>

          <SplitText
            as="h1"
            mode="intro"
            text={`${profile.first} *${profile.last}*`}
            className="display hero-name text-[clamp(3.4rem,10vw,9.5rem)]"
          />

          <p data-intro className="mt-9 max-w-xl text-[clamp(1.25rem,2vw,1.65rem)] leading-snug text-fg [text-wrap:balance]">
            {profile.headline}
          </p>
          <p data-intro className="mt-5 max-w-lg text-base leading-relaxed text-mute">
            {profile.intro}
          </p>

          <div data-intro className="mt-10 flex flex-wrap items-center gap-3">
            <a
              href="#projects"
              className="btn btn-solid"
              onClick={(e) => {
                e.preventDefault()
                sfx.whoosh()
                scrollToId('projects', reduced)
              }}
              onMouseEnter={() => sfx.soft()}
            >
              Explore My Work
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M7 1v12M2 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" /></svg>
            </a>
            <a
              href="#contact"
              className="btn btn-ghost"
              onClick={(e) => {
                e.preventDefault()
                sfx.whoosh()
                scrollToId('contact', reduced)
              }}
              onMouseEnter={() => sfx.soft()}
            >
              Contact Me
            </a>
          </div>
        </div>

        <div className="relative col-span-12 mt-14 flex justify-center lg:col-span-5 lg:mt-0 lg:justify-end">
          <div className="hero-portrait" data-depth="-14">
            <div className="hero-outline" aria-hidden="true" data-depth="22" />
            <div className="hero-frame">
              <img
                className="hero-photo"
                src="/images/priyank-portrait.webp"
                srcSet="/images/priyank-portrait-sm.webp 640w, /images/priyank-portrait.webp 1100w"
                sizes="(min-width: 1024px) 34vw, 78vw"
                width={1100}
                height={1100}
                alt="Portrait of Priyank Wadiwala, smiling, in clear-framed glasses and a cream textured shirt"
                fetchPriority="high"
              />
            </div>
            <p data-intro className="mono-label absolute -bottom-14 right-0 hidden lg:block">
              Based in Gujarat, India
            </p>
          </div>
        </div>
      </div>

      <div data-intro className="scroll-cue" aria-hidden="true">
        <span>Scroll</span>
        <i />
      </div>
    </section>
  )
}
