import { useEffect, useRef, useState } from 'react'
import { about, education, experience, profile, projects, skills } from '../data/profile'
import { firePulse } from '../lib/stage'
import { sfx } from '../lib/sound'

type Line = { kind: 'in' | 'out' | 'accent'; text: string }

const HELP = [
  'Commands:',
  '  about        who I am',
  '  skills       what I work with',
  '  experience   where I have worked',
  '  projects     things I have built',
  '  education    degrees',
  '  contact      how to reach me',
  '  resume       download my résumé',
  '  email        open your mail app',
  '  clear        wipe the screen',
  'Try a few Docker or Git commands, or: sudo hire priyank',
]

const SUGGESTIONS = ['help', 'skills', 'projects', 'docker compose up', 'sudo hire priyank']

function run(cmd: string): { out: Line[]; clear?: boolean; action?: () => void } {
  const raw = cmd.trim()
  const c = raw.toLowerCase().replace(/\s+/g, ' ')
  const o = (text: string[], kind: Line['kind'] = 'out') => text.map((t) => ({ kind, text: t }))

  if (!c) return { out: [] }
  if (c === 'help' || c === '?') return { out: o(HELP) }
  if (c === 'clear') return { out: [], clear: true }
  if (c === 'whoami') return { out: o([`${profile.name}: ${profile.title}`, profile.stackLine]) }
  if (c === 'about') return { out: o([profile.intro, '', ...about.paragraphs.slice(0, 2)]) }
  if (c === 'skills') return { out: o(skills.map((g) => `${g.title}: ${g.items.join(', ')}`)) }
  if (c === 'experience')
    return {
      out: o(experience.flatMap((j) => [`${j.role} @ ${j.company}  (${j.period})`, ...j.points.slice(0, 2).map((p) => `  - ${p}`), ''])),
    }
  if (c === 'projects') return { out: o(projects.map((p) => `${p.index}  ${p.name} (${p.kind})`)) }
  if (c === 'education') return { out: o(education.map((e) => `${e.title}, ${e.place}  (${e.period})${e.score ? ' · ' + e.score : ''}`)) }
  if (c === 'contact') return { out: o([`email     ${profile.email}`, `phone     ${profile.phone}`, `linkedin  ${profile.linkedin}`, `github    ${profile.github}`]) }
  if (c === 'resume' || c === 'cv')
    return {
      out: o(['Downloading résumé...']),
      action: () => {
        const a = document.createElement('a')
        a.href = profile.resume
        a.download = ''
        a.click()
      },
    }
  if (c === 'email') return { out: o([`Opening mail to ${profile.email}...`]), action: () => (window.location.href = `mailto:${profile.email}`) }
  if (c === 'github') return { out: o(['Opening GitHub...']), action: () => window.open(profile.github, '_blank', 'noopener,noreferrer') }
  if (c === 'linkedin') return { out: o(['Opening LinkedIn...']), action: () => window.open(profile.linkedin, '_blank', 'noopener,noreferrer') }

  // easter eggs, kept honest: they only echo what the résumé already says
  if (c === 'docker compose up' || c === 'docker-compose up')
    return {
      out: o([
        '[+] Running 3/3',
        ' ✔ Container postgres   Started',
        ' ✔ Container redis      Started',
        ' ✔ Container bidpitch   Started   (Spring Boot, bids settling inside the deadline)',
      ]),
    }
  if (c === 'docker ps')
    return { out: o(['CONTAINER   IMAGE        STATUS', 'bidpitch    spring-boot  Up, tests green', 'postgres    postgres     Up', 'redis       redis        Up']) }
  if (c === 'git log' || c === 'git log --oneline')
    return {
      out: o([
        'a3f9c21 automate: metadata-driven delivery, 10 days -> 2 days',
        '7be04d8 db: versioned Alembic migrations, repeatable across environments',
        '51cd9a0 fix: trace the bug from the click to the database',
      ]),
    }
  if (c === 'git status') return { out: o(['On branch main', 'Your branch is up to date. Nothing to commit, working tree clean.']) }
  if (c === 'ls') return { out: o(['about  skills  experience  projects  education  contact  resume.pdf']) }
  if (c === 'pwd') return { out: o(['/home/priyank/portfolio']) }
  if (c === 'sudo hire priyank' || c === 'sudo hire')
    return {
      out: [
        { kind: 'out', text: '[sudo] password for recruiter: ********' },
        { kind: 'accent', text: 'Access granted. Offer letter pending your signature.' },
        { kind: 'out', text: `Send it to ${profile.email}` },
      ],
      action: () => {
        firePulse()
        sfx.chime()
      },
    }
  if (c.startsWith('sudo ')) return { out: o(['Nice try. This portfolio is read-only. Try: sudo hire priyank']) }
  if (c === 'exit') return { out: o(['There is no escape. Try "contact".']) }
  return { out: o([`command not found: ${raw}. Type "help".`]) }
}

/** A tiny fake shell that answers from the real profile data. Fully keyboard-operable. */
export function Terminal() {
  const [lines, setLines] = useState<Line[]>([
    { kind: 'accent', text: 'priyank@portfolio ~ welcome. Type "help", or tap a suggestion.' },
  ])
  const [value, setValue] = useState('')
  const history = useRef<string[]>([])
  const cursor = useRef(-1)
  const log = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // scroll only the log, never the page
    if (log.current) log.current.scrollTop = log.current.scrollHeight
  }, [lines])

  const exec = (cmd: string) => {
    const res = run(cmd)
    history.current.push(cmd)
    cursor.current = history.current.length
    sfx.tick()
    setLines((prev) => [
      ...(res.clear ? [] : prev),
      ...(res.clear || !cmd.trim() ? [] : [{ kind: 'in' as const, text: cmd }]),
      ...res.out,
    ])
    res.action?.()
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    exec(value)
    setValue('')
  }

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const h = history.current
    if (e.key === 'ArrowUp' && h.length) {
      e.preventDefault()
      cursor.current = Math.max(0, cursor.current - 1)
      setValue(h[cursor.current] ?? '')
    } else if (e.key === 'ArrowDown' && h.length) {
      e.preventDefault()
      cursor.current = Math.min(h.length, cursor.current + 1)
      setValue(h[cursor.current] ?? '')
    }
  }

  return (
    <div data-reveal className="terminal" onClick={() => input.current?.focus({ preventScroll: true })}>
      <div className="terminal-bar" aria-hidden="true">
        <i /> <i /> <i />
        <span className="mono-label ml-3">priyank@portfolio: ~</span>
      </div>
      <div ref={log} className="terminal-log" role="log" aria-live="polite" aria-label="Terminal output">
        {lines.map((l, i) => (
          <p key={i} className={`t-${l.kind}`}>
            {l.kind === 'in' && <span className="t-prompt">$ </span>}
            {l.text || ' '}
          </p>
        ))}
      </div>
      <form onSubmit={submit} className="terminal-form">
        <label htmlFor="term-input" className="t-prompt">$</label>
        <input
          id="term-input"
          ref={input}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKey}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label="Terminal command"
          placeholder="type a command"
        />
      </form>
      <div className="terminal-chips">
        {SUGGESTIONS.map((s) => (
          <button key={s} type="button" className="chip" onClick={(e) => { e.stopPropagation(); exec(s) }}>
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
