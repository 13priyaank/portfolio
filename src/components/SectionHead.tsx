import { Fragment } from 'react'

type Props = { exit: string; label: string; title: string; italic?: string; id: string }

/** A small highway exit sign, then a serif title whose words rise into place. */
export function SectionHead({ exit, label, title, italic, id }: Props) {
  return (
    <div className="section-head">
      <p className="exit-sign" data-pop>
        <span className="exit-tab">{exit}</span>
        <span className="exit-main">{label}</span>
        <span className="exit-arrow" aria-hidden="true">
          ↗
        </span>
      </p>
      <h2 id={id} className="section-title" data-split aria-label={title}>
        {title.split(' ').map((w, i) => (
          // the space sits outside the inline-block mask or it collapses
          <Fragment key={i}>
            <span className={`w${italic && w.includes(italic) ? ' it' : ''}`} aria-hidden="true">
              <span>{w}</span>
            </span>{' '}
          </Fragment>
        ))}
      </h2>
    </div>
  )
}
