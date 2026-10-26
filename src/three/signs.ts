import { BoxGeometry, CanvasTexture, Group, Mesh, MeshStandardMaterial, SRGBColorSpace } from 'three'

type SignSpec = { kind: 'exit' | 'welcome' | 'arrive'; top: string; main: string }

/** Paint a road sign onto a canvas so it can be used as a texture. */
function paint({ kind, top, main }: SignSpec) {
  const W = 1024
  const H = 440
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d')!
  const bg = kind === 'exit' ? '#0e6b4e' : kind === 'welcome' ? '#e2603b' : '#1d2a52'
  const r = 40
  g.fillStyle = bg
  g.beginPath()
  g.roundRect(0, 0, W, H, r)
  g.fill()
  g.strokeStyle = '#fff8ec'
  g.lineWidth = 14
  g.beginPath()
  g.roundRect(22, 22, W - 44, H - 44, r - 16)
  g.stroke()

  g.fillStyle = '#fff8ec'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  const font = "'Big Shoulders Display Variable', 'Arial Narrow', sans-serif"
  // the small tab on top ("EXIT 02", "MILE 0")
  g.font = `800 64px ${font}`
  const tw = g.measureText(top).width + 70
  g.fillStyle = '#fff8ec'
  g.beginPath()
  g.roundRect(W / 2 - tw / 2, 54, tw, 86, 14)
  g.fill()
  g.fillStyle = bg
  g.fillText(top, W / 2, 99)

  g.fillStyle = '#fff8ec'
  let size = 170
  g.font = `800 ${size}px ${font}`
  while (g.measureText(main).width > W - 140 && size > 60) {
    size -= 6
    g.font = `800 ${size}px ${font}`
  }
  g.fillText(main, W / 2, 278)
  if (kind === 'exit') {
    // arrow pointing off the road
    g.font = `800 90px ${font}`
    g.fillText('↗', W - 110, 380)
  }

  const tex = new CanvasTexture(c)
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

const post = new BoxGeometry(0.28, 1, 0.28)
const postMat = new MeshStandardMaterial({ color: '#8a8f94', roughness: 0.6, metalness: 0.5, flatShading: true })
const backMat = new MeshStandardMaterial({ color: '#6d7378', roughness: 0.6, metalness: 0.4 })

/** A two-legged road sign, ~9 wide; its face looks toward +z (oncoming car). */
export function makeSign(spec: SignSpec) {
  const g = new Group()
  const w = 9
  const h = (w * 440) / 1024
  const face = new MeshStandardMaterial({ map: paint(spec), roughness: 0.55, emissive: '#ffffff', emissiveIntensity: 0 })
  // box: front face (+z, index 4) carries the painted sign
  const board = new Mesh(new BoxGeometry(w, h, 0.18), [backMat, backMat, backMat, backMat, face, backMat])
  board.position.y = 5.2 + h / 2
  g.add(board)
  for (const x of [-w * 0.32, w * 0.32]) {
    const p = new Mesh(post, postMat)
    p.scale.y = 5.4
    p.position.set(x, 2.7, -0.15)
    g.add(p)
  }
  g.userData.face = face
  return g
}

/** Repaint signs once the display font has loaded (canvas text can't wait for it). */
export function repaint(sign: Group, spec: SignSpec) {
  const face = sign.userData.face as MeshStandardMaterial
  face.map?.dispose()
  face.map = paint(spec)
  face.needsUpdate = true
}
