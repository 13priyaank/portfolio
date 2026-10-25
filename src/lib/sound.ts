/**
 * Every sound on the site is synthesised with the Web Audio API: no files.
 * The AudioContext is only created after the visitor opts in (a click),
 * which is also what browsers require before audio may play.
 */

type Listener = (on: boolean) => void

// one chord per section, glided between as the particles morph
const CHORDS = [
  [110.0, 164.81, 246.94], // A  E  B   (hero)
  [98.0, 146.83, 220.0], //  G  D  A
  [87.31, 130.81, 196.0], // F  C  G
  [82.41, 123.47, 185.0], // E  B  F#
  [98.0, 146.83, 233.08], // G  D  Bb
  [110.0, 164.81, 277.18], // A E  C#  (contact: resolves bright)
]

class SoundEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private padGain: GainNode | null = null
  private padFilter: BiquadFilterNode | null = null
  private padOsc: OscillatorNode[][] = []
  private noise: AudioBuffer | null = null
  private listeners = new Set<Listener>()
  private lastHover = 0
  enabled = false

  subscribe(fn: Listener) {
    this.listeners.add(fn)
    return () => void this.listeners.delete(fn)
  }

  private emit() {
    this.listeners.forEach((fn) => fn(this.enabled))
    try {
      localStorage.setItem('pw-sound', this.enabled ? '1' : '0')
    } catch {
      /* storage blocked: preference just isn't remembered */
    }
  }

  get remembered() {
    try {
      return localStorage.getItem('pw-sound')
    } catch {
      return null
    }
  }

  private boot() {
    if (this.ctx) return this.ctx
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AC()
    const comp = ctx.createDynamicsCompressor()
    comp.threshold.value = -18
    comp.ratio.value = 4
    comp.connect(ctx.destination)
    const master = ctx.createGain()
    master.gain.value = 0
    master.connect(comp)

    // white-noise buffer reused by whooshes and clicks
    const len = ctx.sampleRate * 1.5
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1

    // ambient pad: detuned saws through a slowly breathing low-pass
    const padFilter = ctx.createBiquadFilter()
    padFilter.type = 'lowpass'
    padFilter.frequency.value = 520
    padFilter.Q.value = 0.7
    const padGain = ctx.createGain()
    padGain.gain.value = 0.0
    padFilter.connect(padGain)
    padGain.connect(master)

    const lfo = ctx.createOscillator()
    const lfoAmt = ctx.createGain()
    lfo.frequency.value = 0.07
    lfoAmt.gain.value = 260
    lfo.connect(lfoAmt)
    lfoAmt.connect(padFilter.frequency)
    lfo.start()

    this.padOsc = CHORDS[0].map((f) =>
      [-7, 7].map((detune) => {
        const o = ctx.createOscillator()
        o.type = 'sawtooth'
        o.frequency.value = f
        o.detune.value = detune
        const g = ctx.createGain()
        g.gain.value = 0.05
        o.connect(g)
        g.connect(padFilter)
        o.start()
        return o
      }),
    )

    document.addEventListener('visibilitychange', () => {
      if (!this.ctx) return
      if (document.hidden) this.ctx.suspend()
      else if (this.enabled) this.ctx.resume()
    })

    Object.assign(this, { ctx, master, padGain, padFilter, noise: buf })
    return ctx
  }

  setEnabled(on: boolean) {
    if (on) {
      const ctx = this.boot()
      ctx.resume()
      this.master!.gain.cancelScheduledValues(ctx.currentTime)
      this.master!.gain.setTargetAtTime(0.9, ctx.currentTime, 0.15)
      this.padGain!.gain.setTargetAtTime(0.32, ctx.currentTime, 1.6)
    } else if (this.ctx) {
      this.master!.gain.setTargetAtTime(0, this.ctx.currentTime, 0.12)
      this.padGain!.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3)
    }
    this.enabled = on
    this.emit()
  }

  toggle() {
    this.setEnabled(!this.enabled)
    if (this.enabled) this.click()
  }

  private get live() {
    return this.enabled && this.ctx && this.ctx.state === 'running' ? this.ctx : null
  }

  /** glide the pad to the chord for a section */
  section(i: number) {
    const ctx = this.ctx
    if (!ctx) return
    const chord = CHORDS[Math.max(0, Math.min(CHORDS.length - 1, i))]
    this.padOsc.forEach((pair, k) => pair.forEach((o) => o.frequency.setTargetAtTime(chord[k], ctx.currentTime, 0.6)))
    this.padFilter?.frequency.setTargetAtTime(420 + i * 70, ctx.currentTime, 0.8)
  }

  /** filtered-noise sweep, for the particle morph between sections */
  whoosh(up = true) {
    const ctx = this.live
    if (!ctx || !this.noise) return
    const t = ctx.currentTime
    const src = ctx.createBufferSource()
    src.buffer = this.noise
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.Q.value = 1.4
    bp.frequency.setValueAtTime(up ? 280 : 2400, t)
    bp.frequency.exponentialRampToValueAtTime(up ? 2600 : 300, t + 0.55)
    bp.frequency.exponentialRampToValueAtTime(up ? 500 : 180, t + 1.1)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.16, t + 0.3)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.15)
    src.connect(bp)
    bp.connect(g)
    g.connect(this.master!)
    src.start(t)
    src.stop(t + 1.2)
    // a soft shimmer on top
    this.tone(up ? 1318.5 : 987.8, 0.9, 0.025, 'sine', t + 0.18)
  }

  /** tiny blip for hovering interactive things */
  hover() {
    const ctx = this.live
    if (!ctx) return
    const now = performance.now()
    if (now - this.lastHover < 60) return
    this.lastHover = now
    const t = ctx.currentTime
    const o = ctx.createOscillator()
    o.type = 'sine'
    o.frequency.setValueAtTime(2100, t)
    o.frequency.exponentialRampToValueAtTime(1300, t + 0.05)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.035, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07)
    o.connect(g)
    g.connect(this.master!)
    o.start(t)
    o.stop(t + 0.08)
  }

  /** soft pluck for clicks */
  click() {
    const ctx = this.live
    if (!ctx) return
    const t = ctx.currentTime
    const o = ctx.createOscillator()
    o.type = 'triangle'
    o.frequency.setValueAtTime(880, t)
    o.frequency.exponentialRampToValueAtTime(440, t + 0.09)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.11, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22)
    o.connect(g)
    g.connect(this.master!)
    o.start(t)
    o.stop(t + 0.25)
  }

  /** rising bell arpeggio for entering the site */
  chime() {
    const ctx = this.live
    if (!ctx) return
    const t = ctx.currentTime
    ;[440, 554.37, 659.25, 880, 1108.73].forEach((f, i) => this.tone(f, 1.6, 0.05, 'sine', t + i * 0.09))
    this.whoosh(true)
  }

  private tone(freq: number, dur: number, vol: number, type: OscillatorType, at: number) {
    const ctx = this.ctx
    if (!ctx) return
    const o = ctx.createOscillator()
    o.type = type
    o.frequency.value = freq
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, at)
    g.gain.exponentialRampToValueAtTime(vol, at + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur)
    o.connect(g)
    g.connect(this.master!)
    o.start(at)
    o.stop(at + dur + 0.05)
  }
}

export const sound = new SoundEngine()
