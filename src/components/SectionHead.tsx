import { SplitText } from './SplitText'

type Props = { id: string; index: string; label: string; title: string; className?: string }

export function SectionHead({ id, index, label, title, className = '' }: Props) {
  return (
    <header className={className}>
      <p data-reveal className="mono-label mb-6 flex items-center gap-3">
        <span className="text-accent">{index}</span>
        <span className="h-px w-8 bg-line-strong" aria-hidden="true" />
        <span>{label}</span>
      </p>
      <SplitText as="h2" text={title} className="display text-[clamp(2.5rem,6vw,5.25rem)]" />
      <span id={`${id}-title`} className="sr-only">
        {label}
      </span>
    </header>
  )
}
