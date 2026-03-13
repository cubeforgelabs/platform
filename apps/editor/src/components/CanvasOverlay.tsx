import { useRef, useState, useEffect, useCallback } from 'react'
import type { CsxDocument } from '../lib/csx'
import { moveEntity, findEntity } from '../lib/csxUtils'
import { COMPONENT_REGISTRY, COMPONENT_CATEGORIES } from '../lib/componentRegistry'

interface Props {
  doc: CsxDocument
  selectedId: string | null
  onSelect: (id: string | null) => void
  onChange: (doc: CsxDocument) => void
  containerRef: React.RefObject<HTMLDivElement | null>
}

export function CanvasOverlay({ doc, selectedId, onSelect, onChange, containerRef }: Props) {
  const overlayRef = useRef<SVGSVGElement>(null)
  const [size, setSize] = useState({ w: 900, h: 560 })
  const dragging = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null)

  // Track container size for scale
  useEffect(() => {
    if (!containerRef.current) return
    const obs = new ResizeObserver(entries => {
      const rect = entries[0].contentRect
      setSize({ w: rect.width, h: rect.height })
    })
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [containerRef])

  const scaleX = size.w / doc.game.width
  const scaleY = size.h / doc.game.height

  const toScreen = useCallback((wx: number, wy: number) => ({
    sx: wx * scaleX,
    sy: wy * scaleY,
  }), [scaleX, scaleY])

  const toWorld = useCallback((sx: number, sy: number) => ({
    wx: sx / scaleX,
    wy: sy / scaleY,
  }), [scaleX, scaleY])

  function onMouseDown(e: React.MouseEvent, entityId: string) {
    e.stopPropagation()
    onSelect(entityId)
    const entity = findEntity(doc.entities, entityId)
    if (!entity) return
    dragging.current = {
      id: entityId,
      startX: e.clientX,
      startY: e.clientY,
      origX: entity.x,
      origY: entity.y,
    }
  }

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragging.current) return
      const dx = e.clientX - dragging.current.startX
      const dy = e.clientY - dragging.current.startY
      const { wx, wy } = toWorld(
        dragging.current.origX * scaleX + dx,
        dragging.current.origY * scaleY + dy,
      )
      onChange(moveEntity(doc, dragging.current.id, wx, wy))
    }
    function onMouseUp() { dragging.current = null }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [doc, onChange, scaleX, scaleY, toWorld])

  const flatEntities = flattenEntities(doc.entities)

  return (
    <svg
      ref={overlayRef}
      className="canvas-overlay"
      width={size.w}
      height={size.h}
      onClick={() => onSelect(null)}
    >
      {flatEntities.map(entity => {
        const { sx, sy } = toScreen(entity.x, entity.y)
        const isSelected = entity.id === selectedId

        // Get collider size for visual bounds
        const boxCollider = entity.components.find(c => c.type === 'BoxCollider')
        const circleCollider = entity.components.find(c => c.type === 'CircleCollider')
        const spriteComp = entity.components.find(c => c.type === 'Sprite')

        const w = (
          (boxCollider?.props.width as number) ??
          (spriteComp?.props.width as number) ??
          32
        ) * scaleX

        const h = (
          (boxCollider?.props.height as number) ??
          (spriteComp?.props.height as number) ??
          32
        ) * scaleY

        const color = isSelected ? '#4fc3f7' : '#6b7a9e'
        const hasRigidBody = entity.components.some(c => c.type === 'RigidBody')
        const catColor = hasRigidBody
          ? COMPONENT_CATEGORIES.physics.color
          : COMPONENT_CATEGORIES.rendering.color

        return (
          <g key={entity.id} onMouseDown={e => onMouseDown(e, entity.id)} style={{ cursor: 'move' }}>
            {/* Collider bounds */}
            {boxCollider && (
              <rect
                x={sx - w / 2}
                y={sy - h / 2}
                width={w}
                height={h}
                fill={isSelected ? 'rgba(79,195,247,0.06)' : 'rgba(107,122,158,0.04)'}
                stroke={catColor}
                strokeWidth={isSelected ? 1.5 : 0.75}
                strokeDasharray={boxCollider.props.isTrigger ? '4 2' : undefined}
                style={{ pointerEvents: 'none' }}
              />
            )}
            {circleCollider && (
              <circle
                cx={sx}
                cy={sy}
                r={((circleCollider.props.radius as number) ?? 16) * Math.min(scaleX, scaleY)}
                fill="none"
                stroke={catColor}
                strokeWidth={isSelected ? 1.5 : 0.75}
                strokeDasharray={circleCollider.props.isTrigger ? '4 2' : undefined}
                style={{ pointerEvents: 'none' }}
              />
            )}

            {/* Entity handle */}
            <circle
              cx={sx}
              cy={sy}
              r={isSelected ? 6 : 4}
              fill={isSelected ? '#4fc3f7' : '#1e2235'}
              stroke={color}
              strokeWidth={1.5}
            />

            {/* Label */}
            {isSelected && (
              <text
                x={sx + 10}
                y={sy - 8}
                fontSize={10}
                fill="#4fc3f7"
                fontFamily="'JetBrains Mono', monospace"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {entity.name}
              </text>
            )}

            {/* Invisible hit area */}
            <circle cx={sx} cy={sy} r={12} fill="transparent" />
          </g>
        )
      })}
    </svg>
  )
}

function flattenEntities(entities: import('../lib/csx').CsxEntity[]): import('../lib/csx').CsxEntity[] {
  const result: import('../lib/csx').CsxEntity[] = []
  function walk(es: typeof entities) {
    for (const e of es) { result.push(e); walk(e.children) }
  }
  walk(entities)
  return result
}
