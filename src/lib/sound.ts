/**
 * The car's sounds, synthesised with the Web Audio API (no audio files):
 * an engine whose pitch follows scroll speed, wind, a starter motor, a horn,
 * indicator ticks for hovers and a door-chime when you pass an exit.
 * Nothing is created until the visitor opts in with a click.
 */

type Listener = (on: boolean) => void

class CarAudio {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private noise: AudioBuffer | null = null
  private engine: { osc: OscillatorNode[]; filter: BiquadFilterNode; gain: GainNode } | null = null
  private wind: { filter: BiquadFilterNode; gain: GainNode } | null = null
  private listeners = new Set<Listener>()
  private tickFlip = false
  private lastHover = 0
  /** while the ignition rev plays, per-frame speed updates leave the engine alone */
  private revUntil = 0
  enabled = false

  subscribe(fn: Listener) {
    this.listeners.add(fn)
    return () => void this.listeners.delete(fn)
  }

  private boot() {
    if (this.ctx) return this.ctx
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AC()
    const comp = ctx.createDynamicsCompressor()
    comp.threshold.value = -16
    comp.ratio.value = 5
    comp.connect(ctx.destination)
    const master = ctx.createGain()
    master.gain.value = 0
    master.connect(comp)

    const len = ctx.sampleRate * 2
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const d = buf.getChannelData(0)
    // brown-ish noise: smoother than white, better for wind and rumble
    let last = 0
    for (let i = 0; i < len; i++) {
      last = (last + 0.04 * (Math.random() * 2 - 1)) / 1.04
      d[i] = last * 3.5
    }

    // engine: a low saw + square pair through a low-pass, with a slow wobble
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 220
    filter.Q.value = 2
    const egain = ctx.createGain()
    egain.gain.value = 0
    filter.connect(egain)
    egain.connect(master)
    const osc = (['sawtooth', 'square'] as OscillatorType[]).map((type, i) => {
      const o = ctx.createOscillator()
      o.type = type
      o.frequency.value = i ? 22 : 44
      const g = ctx.createGain()
      g.gain.value = i ? 0.35 : 0.6
      o.connect(g)
      g.connect(filter)
      o.start()
      return o
    })
    const wob = ctx.createOscillator()
    const wobAmt = ctx.createGain()
    wob.frequency.value = 7
    wobAmt.gain.value = 2.5
    wob.connect(wobAmt)
    osc.forEach((o) => wobAmt.connect(o.frequency))
    wob.start()

    // wind: looping noise through a band-pass that opens with speed
    const src = ctx.createBufferSource()
    src.buffer = buf
    src.loop = true
    const wf = ctx.createBiquadFilter()
    wf.type = 'bandpass'
    wf.frequency.value = 500
    wf.Q.value = 0.6
    const wg = ctx.createGain()
    wg.gain.value = 0
    src.connect(wf)
    wf.connect(wg)
    wg.connect(master)
    src.start()

    document.addEventListener('visibilitychange', () => {
      if (!this.ctx) return
      if (document.hidden) this.ctx.suspend()
      else if (this.enabled) this.ctx.resume()
    })

    this.ctx = ctx
    this.master = master
    this.noise = buf
    this.engine = { osc, filter, gain: egain }
    this.wind = { filter: wf, gain: wg }
    return ctx
  }

  setEnabled(on: boolean) {
    if (on) {
      const ctx = this.boot()
      ctx.resume()
      this.master!.gain.setTargetAtTime(0.9, ctx.currentTime, 0.1)
    } else if (this.ctx) {
      this.master!.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1)
    }
    this.enabled = on
    this.listeners.forEach((fn) => fn(on))
  }

  toggle() {
    this.setEnabled(!this.enabled)
    if (this.enabled) this.ignition()
  }

  private get live() {
    return this.enabled && this.ctx?.state === 'running' ? this.ctx : null
  }

  /** called every frame with km/h (0..240) */
  setSpeed(kmh: number) {
    const ctx = this.ctx
    if (!ctx || !this.engine || !this.wind) return
    const t = ctx.currentTime
    const s = Math.min(1, kmh / 240)
    this.wind.filter.frequency.setTargetAtTime(400 + s * 1800, t, 0.2)
    this.wind.gain.gain.setTargetAtTime(this.enabled ? s * s * 0.35 : 0, t, 0.25)
    if (t < this.revUntil) return
    const rpm = 44 + s * 120
    this.engine.osc[0].frequency.setTargetAtTime(rpm, t, 0.12)
    this.engine.osc[1].frequency.setTargetAtTime(rpm / 2, t, 0.12)
    this.engine.filter.frequency.setTargetAtTime(220 + s * 1300, t, 0.12)
    this.engine.gain.gain.setTargetAtTime(this.enabled ? 0.07 + s * 0.13 : 0, t, 0.15)
  }

  /** starter motor whirr, then the engine catches */
  ignition() {
    const ctx = this.live
    if (!ctx || !this.noise) return
    const t = ctx.currentTime
    const src = ctx.createBufferSource()
    src.buffer = this.noise
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 900
    bp.Q.value = 3
    const am = ctx.createGain()
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.5, t + 0.05)
    g.gain.setValueAtTime(0.5, t + 0.6)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.8)
    // chug-chug-chug: amplitude-modulate the whirr
    const lfo = ctx.createOscillator()
    lfo.frequency.value = 11
    const lfoAmt = ctx.createGain()
    lfoAmt.gain.value = 0.5
    am.gain.value = 0.5
    lfo.connect(lfoAmt)
    lfoAmt.connect(am.gain)
    src.connect(bp)
    bp.connect(am)
    am.connect(g)
    g.connect(this.master!)
    src.start(t)
    lfo.start(t)
    src.stop(t + 0.85)
    lfo.stop(t + 0.85)
    // engine catches with a rev
    if (this.engine) {
      this.revUntil = t + 1.6
      const eg = this.engine.gain.gain
      eg.cancelScheduledValues(t)
      eg.setValueAtTime(0, t)
      eg.linearRampToValueAtTime(0.0, t + 0.65)
      eg.linearRampToValueAtTime(0.32, t + 0.8)
      eg.setTargetAtTime(0.07, t + 1.0, 0.3)
      for (const o of this.engine.osc) {
        o.frequency.setValueAtTime(o.frequency.value, t + 0.7)
        o.frequency.linearRampToValueAtTime(o.type === 'square' ? 60 : 120, t + 0.9)
      }
      this.engine.filter.frequency.setValueAtTime(1600, t + 0.8)
    }
  }

  /** two-tone car horn */
  honk() {
    const ctx = this.live
    if (!ctx) return
    const t = ctx.currentTime
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 2200
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.22, t + 0.02)
    g.gain.setValueAtTime(0.22, t + 0.3)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42)
    lp.connect(g)
    g.connect(this.master!)
    for (const f of [392, 494]) {
      const o = ctx.createOscillator()
      o.type = 'square'
      o.frequency.value = f
      o.connect(lp)
      o.start(t)
      o.stop(t + 0.45)
    }
  }

  /** indicator click (tick... tock) for hovering interactive things */
  tick() {
    const ctx = this.live
    if (!ctx) return
    const now = performance.now()
    if (now - this.lastHover < 70) return
    this.lastHover = now
    this.tickFlip = !this.tickFlip
    const t = ctx.currentTime
    const o = ctx.createOscillator()
    o.type = 'square'
    o.frequency.value = this.tickFlip ? 1900 : 1500
    const hp = ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 1200
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.06, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.025)
    o.connect(hp)
    hp.connect(g)
    g.connect(this.master!)
    o.start(t)
    o.stop(t + 0.03)
  }

  /** soft "ding-dong" when the car passes an exit sign */
  chime(up = true) {
    const ctx = this.live
    if (!ctx) return
    const t = ctx.currentTime
    const notes = up ? [659.25, 523.25] : [523.25, 440]
    notes.forEach((f, i) => {
      const o = ctx.createOscillator()
      o.type = 'sine'
      o.frequency.value = f
      const g = ctx.createGain()
      const at = t + i * 0.22
      g.gain.setValueAtTime(0.0001, at)
      g.gain.exponentialRampToValueAtTime(0.09, at + 0.01)
      g.gain.exponentialRampToValueAtTime(0.0001, at + 1.1)
      o.connect(g)
      g.connect(this.master!)
      o.start(at)
      o.stop(at + 1.2)
    })
  }
}

export const sound = new CarAudio()
