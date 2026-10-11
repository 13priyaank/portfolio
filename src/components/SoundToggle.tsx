import { sfx, useSoundEnabled } from '../lib/sound'

export function SoundToggle() {
  const on = useSoundEnabled()
  return (
    <button
      type="button"
      className="sound-toggle"
      aria-pressed={on}
      aria-label={on ? 'Sound on. Turn interface sounds off' : 'Sound off. Turn interface sounds on'}
      onClick={() => sfx.setEnabled(!on)}
    >
      <span className={`eq ${on ? 'is-on' : ''}`} aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="mono-label !text-fg">Sound {on ? 'on' : 'off'}</span>
    </button>
  )
}
