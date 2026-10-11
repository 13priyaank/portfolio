/** Pure-CSS stand-in used when WebGL is unavailable or fails. */
export function OrbFallback() {
  return (
    <div aria-hidden="true" className="orb-fallback">
      <span />
      <span />
      <span />
    </div>
  )
}
