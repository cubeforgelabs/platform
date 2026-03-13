import {
  Game, World, Entity, Transform, Sprite,
  RigidBody, BoxCollider, Script, Camera2D,
} from 'cubeforge'
import type { SpriteShape } from 'cubeforge'
import { useEffect, useState } from 'react'

const COLORS = [
  '#4fc3f718', '#f38ba818', '#a6e3a118',
  '#f9e2af18', '#cba6f718', '#fab38718',
  '#89b4fa18', '#94e2d518',
]
const SHAPES: SpriteShape[] = [
  'circle', 'hexagon', 'roundedRect', 'triangle',
  'star', 'pentagon', 'circle', 'hexagon',
]

/* eslint-disable @typescript-eslint/no-explicit-any */
function makeDrift(idx: number) {
  const vx = Math.sin(idx * 2.7) * 10 + (idx % 2 === 0 ? 5 : -5)
  const vy = -(6 + ((idx * 3) % 10))
  return {
    init: (eid: any, world: any) => {
      const rb = world.getComponent(eid, 'RigidBody')
      if (rb) { rb.vx = vx; rb.vy = vy }
    },
    update: (eid: any, world: any) => {
      const t = world.getComponent(eid, 'Transform')
      if (!t) return
      const hw = window.innerWidth / 2 + 80
      const hh = window.innerHeight / 2 + 80
      if (t.y < -hh) t.y = hh
      if (t.y > hh) t.y = -hh
      if (t.x < -hw) t.x = hw
      if (t.x > hw) t.x = -hw
    },
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function FloatingShape({ idx, w, h }: { idx: number; w: number; h: number }) {
  const size = 20 + ((idx * 7) % 30)
  const x = ((idx * 173) % w) - w / 2
  const y = ((idx * 311) % h) - h / 2
  const color = COLORS[idx % COLORS.length]
  const shape = SHAPES[idx % SHAPES.length]
  const script = makeDrift(idx)

  return (
    <Entity id={`fs-${idx}`}>
      <Transform x={x} y={y} rotation={(idx * 37) % 360} />
      <Sprite
        width={size}
        height={size}
        color={color}
        shape={shape}
        borderRadius={shape === 'roundedRect' ? 6 : 0}
      />
      <RigidBody gravityScale={0} lockRotation={false} linearDamping={0} />
      <BoxCollider width={size} height={size} isTrigger />
      <Script init={script.init} update={script.update} />
    </Entity>
  )
}

export function PhysicsBg() {
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null)

  useEffect(() => {
    setDims({ w: window.innerWidth, h: window.innerHeight })
  }, [])

  if (!dims) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <Game width={dims.w} height={dims.h} gravity={0}>
        <World background="#0b0d14">
          <Camera2D />
          {Array.from({ length: 30 }, (_, i) => (
            <FloatingShape key={`s${i}`} idx={i} w={dims.w} h={dims.h} />
          ))}
        </World>
      </Game>
    </div>
  )
}
