import { useEffect, useState } from 'react'

const FORMS = [
  { name: 'Sphere', note: 'hello, world' },
  { name: 'Double helix', note: 'healthcare + AI' },
  { name: 'Lattice', note: 'services & data' },
  { name: 'Torus knot', note: 'things I’ve built' },
  { name: 'Ringed planet', note: 'the toolbox' },
  { name: 'Spiral galaxy', note: 'say hello' },
]

/** Small readout naming the shape the particles are currently holding. */
export function FormHud() {
  const [form, setForm] = useState(0)

  useEffect(() => {
    const on = (e: Event) => setForm((e as CustomEvent<number>).detail)
    window.addEventListener('form-change', on)
    return () => window.removeEventListener('form-change', on)
  }, [])

  const f = FORMS[form] ?? FORMS[0]
  return (
    <div className="form-hud mono" aria-hidden="true">
      <span className="hud-index">
        {String(form + 1).padStart(2, '0')}
        <i>/06</i>
      </span>
      <span className="hud-text" key={form}>
        <b>{f.name}</b>
        <span>{f.note}</span>
      </span>
    </div>
  )
}
