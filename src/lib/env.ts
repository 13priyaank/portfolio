import { useSyncExternalStore } from 'react'

const q = '(prefers-reduced-motion: reduce)'

function subscribe(cb: () => void) {
  const m = window.matchMedia(q)
  m.addEventListener('change', cb)
  return () => m.removeEventListener('change', cb)
}

export const prefersReducedMotion = () => window.matchMedia(q).matches
export const useReducedMotion = () =>
  useSyncExternalStore(subscribe, prefersReducedMotion, () => false)

export const isCoarsePointer = () => window.matchMedia('(pointer: coarse)').matches
export const isNarrow = () => window.matchMedia('(max-width: 767px)').matches

export function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}
