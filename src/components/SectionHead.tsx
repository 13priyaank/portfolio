type Props = { index: string; label: string; title: string; count?: number; id: string }

/** Hairline rule, numbered mono label, then the section title. */
export function SectionHead({ index, label, title, count, id }: Props) {
  return (
    <div className="section-head" data-reveal>
      <p className="eyebrow">
        <span>{index}</span>
        <span>{label}</span>
      </p>
      <h2 id={id} className="section-title">
        {title}
        {count !== undefined && <sup className="count">({String(count).padStart(2, '0')})</sup>}
      </h2>
    </div>
  )
}
