import { Component, type ReactNode, useEffect, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Orb } from './Orb'
import { stage, stageListeners } from '../lib/stage'
import { isNarrow, hasWebGL } from '../lib/env'

class Boundary extends Component<{ onFail: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onFail()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

type Props = { reduced: boolean; onReady: () => void; onFail: () => void }

function Invalidator() {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    stageListeners.add(invalidate)
    return () => {
      stageListeners.delete(invalidate)
    }
  }, [invalidate])
  return null
}

export default function Scene({ reduced, onReady, onFail }: Props) {
  const [ok] = useState(() => hasWebGL())

  useEffect(() => {
    if (!ok) onFail()
  }, [ok, onFail])

  useEffect(() => {
    if (reduced) return
    const move = (e: PointerEvent) => {
      stage.mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      stage.mouse.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [reduced])

  if (!ok) return null
  const narrow = isNarrow()

  return (
    <Boundary onFail={onFail}>
      <Canvas
        className="scene-canvas"
        // reduced motion: render on demand (a still frame), otherwise continuous
        frameloop={reduced ? 'demand' : 'always'}
        dpr={[1, narrow ? 1.5 : 1.75]}
        camera={{ position: [0, 0, 5], fov: 40, near: 0.1, far: 20 }}
        gl={{ antialias: !narrow, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl, invalidate }) => {
          gl.setClearColor(0x000000, 0)
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault()
            onFail()
          })
          invalidate()
          onReady()
        }}
      >
        <Orb reduced={reduced} />
        {reduced && <Invalidator />}
      </Canvas>
    </Boundary>
  )
}
