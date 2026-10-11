import { useSyncExternalStore } from 'react'

/**
 * Tiny synthesized UI sound engine (Web Audio, no audio files).
 * OFF by default. The AudioContext is only created inside a user gesture
 * (the toggle click), which satisfies browser autoplay policies.
 */
type Listener = () => void

class Sfx {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private noise: AudioBuffer | null = null
  private listeners = new Set<Listener>()
  private on = false

  subscribe = (l: Listener) => {
    this.listeners.add(l)
    return () => {
      this.listeners.delete(l)
    }
  }
  getSnapshot = () => this.on
  private emit() {
    this.listeners.forEach((l) => l())
  }

  async setEnabled(v: boolean) {
    if (v) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AC) return
      if (!this.ctx) {
        this.ctx = new AC()
        this.master = this.ctx.createGain()
        this.master.gain.value = 0.9
        this.master.connect(this.ctx.destination)
      }
      try {
        await this.ctx.resume()
      } catch {
        return
      }
      this.on = true
      this.emit()
      this.chime()
    } else {
      this.blip(392, 0.12, 'sine', 0.05)
      this.on = false
      this.emit()
    }
  }

  private blip(freq: number, dur: number, type: OscillatorType, gain: number, delay = 0, endFreq?: number) {
    const c = this.ctx
    if (!c || !this.master) return
    const t = c.currentTime + delay
    const o = c.createOscillator()
    const g = c.createGain()
    o.type = type
    o.frequency.setValueAtTime(freq, t)
    if (endFreq) o.frequency.exponentialRampToValueAtTime(endFreq, t + dur)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(gain, t + 0.008)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    o.connect(g).connect(this.master)
    o.start(t)
    o.stop(t + dur + 0.02)
  }

  /** short, quiet click for buttons and links */
  tick() {
    if (!this.on) return
    this.blip(1500, 0.05, 'sine', 0.035, 0, 900)
  }
  /** lower, softer hover cue */
  soft() {
    if (!this.on) return
    this.blip(640, 0.09, 'triangle', 0.022)
  }
  /** two-note confirmation when sound is enabled */
  chime() {
    this.blip(523.25, 0.5, 'sine', 0.05)
    this.blip(783.99, 0.7, 'sine', 0.04, 0.09)
  }
  /** filtered noise sweep for section jumps */
  whoosh() {
    const c = this.ctx
    if (!this.on || !c || !this.master) return
    if (!this.noise) {
      const len = Math.floor(c.sampleRate * 0.6)
      const buf = c.createBuffer(1, len, c.sampleRate)
      const d = buf.getChannelData(0)
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
      this.noise = buf
    }
    const t = c.currentTime
    const src = c.createBufferSource()
    src.buffer = this.noise
    const f = c.createBiquadFilter()
    f.type = 'bandpass'
    f.Q.value = 0.9
    f.frequency.setValueAtTime(260, t)
    f.frequency.exponentialRampToValueAtTime(2200, t + 0.5)
    const g = c.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.07, t + 0.18)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55)
    src.connect(f).connect(g).connect(this.master)
    src.start(t)
    src.stop(t + 0.6)
  }
}

export const sfx = new Sfx()
export const useSoundEnabled = () => useSyncExternalStore(sfx.subscribe, sfx.getSnapshot, () => false)
