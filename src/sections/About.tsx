import { about } from '../data/profile'
import { SectionHead } from '../components/SectionHead'

export function About() {
  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <div className="shell grid grid-cols-12 items-start gap-x-0 gap-y-16 md:gap-x-8">
        <div className="col-span-12 md:col-span-5 lg:col-span-4">
          <div data-reveal>
            <div className="about-frame" data-parallax="-40">
            <img
              src="/images/priyank-avatar.webp"
              width={640}
              height={854}
              loading="lazy"
              alt="Illustrated portrait of Priyank Wadiwala with yellow glasses and a circuit-pattern shirt"
            />
            </div>
          </div>
          <p data-reveal className="mono-label mt-5">Illustrated self-portrait</p>
        </div>

        <div className="col-span-12 md:col-span-7 lg:col-span-7 lg:col-start-6">
          <SectionHead id="about" index="01" label="About" title="Backend depth, *frontend* instinct." />
          <div className="mt-10 space-y-5 text-[1.0625rem] leading-relaxed text-mute md:max-w-xl">
            {about.paragraphs.map((p, i) => (
              <p key={i} data-reveal className={i === 0 ? 'text-fg' : undefined}>
                {p}
              </p>
            ))}
          </div>

          <dl className="mt-14 grid grid-cols-1 gap-y-6 border-t border-line pt-8 sm:grid-cols-3 sm:gap-x-8">
            {about.highlights.map((h) => (
              <div key={h.label} data-reveal>
                <dd className="display text-4xl text-fg">{h.value}</dd>
                <dt className="mono-label mt-2 !normal-case !tracking-normal">{h.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
