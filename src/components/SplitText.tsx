
type Props = {
  text: string
  as?: 'h1' | 'h2' | 'h3' | 'p'
  className?: string
  /** 'scroll' reveals when scrolled into view, 'intro' is driven by the hero timeline */
  mode?: 'scroll' | 'intro'
}

/**
 * Splits a heading into masked words so GSAP can slide them up.
 * Wrap a word in *asterisks* to set it in the italic accent style.
 * The full text stays available to assistive tech via aria-label.
 */
export function SplitText({ text, as: Tag = 'h2', className = '', mode = 'scroll' }: Props) {
  const words = text.split(' ')
  const attr = mode === 'intro' ? { 'data-intro-words': '' } : { 'data-words': '' }
  const plain = text.replace(/\*/g, '')
  return (
    <Tag className={className} aria-label={plain} {...attr}>
      {words.map((raw, i) => {
        // *word* (optionally followed by punctuation) renders as the italic accent
        const m = raw.match(/^\*(.+)\*(\W*)$/)
        return (
          <span key={i}>
            <span className="w" aria-hidden="true">
              {m ? (
                <>
                  <span className="em">{m[1]}</span>
                  <span>{m[2]}</span>
                </>
              ) : (
                <span>{raw}</span>
              )}
            </span>
            {i < words.length - 1 ? ' ' : null}
          </span>
        )
      })}
    </Tag>
  )
}
