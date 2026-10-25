import { Fragment } from 'react'

type Props = { index: string; label: string; title: string; id: string; accent?: string }

/** Numbered label, then a title whose words rise out of a mask on scroll. */
export function SectionHead({ index, label, title, id, accent }: Props) {
  return (
    <div className="section-head">
      <p className="label mono">
        <span className="label-index">{index}</span>
        <span className="label-line" aria-hidden="true" />
        {label}
      </p>
      <h2 id={id} className="section-title" data-split aria-label={title}>
        {title.split(' ').map((w, i) => (
          // the space must sit outside the inline-block mask or it collapses
          <Fragment key={i}>
            <span className={`w${accent && w.includes(accent) ? ' grad' : ''}`} aria-hidden="true">
              <span>{w}</span>
            </span>{' '}
          </Fragment>
        ))}
      </h2>
    </div>
  )
}
