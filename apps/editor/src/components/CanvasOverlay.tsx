import { useRef, useState, useEffect, useCallback } from 'react'
import type { CsxDocument, CsxEntity } from '../lib/csx'
import { moveEntity, findEntity } from '../lib/csxUtils'
import { COMPONENT_CATEGORIES } from '../lib/componentRegistry'

interface Props {
  doc: CsxDocument
  selectedId: string | null
  snapToGrid: boolean
  gridSize: number
  zoom: number
  pan: { x: number; y: number }
  onSelect: (id: string | null) => void
  onChange: (doc: CsxDocument) => void
  onZoomChange: (zoom: number) => void
  onPanChange: (pan: { x: number; y: number }) => void
  containerRef: React.RefObject<HTMLDivElement | null>
}

function snap(v: number, grid: number, enabled: boolean) {
  return enabled ? Math.round(v / grid) * grid : Math.round(v)
}

export function CanvasOverlay({
  doc, selectedId, snapToGrid, gridSize, zoom, pan,
  onSelect, onChange, onZoomChange, onPanChange, containerRef,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [size, setSize] = useState({ w: 900, h: 560 })
  const dragging = useRef<{
    id: string; startMx: number; startMy: number; origX: number; origY: number
  } | null>(null)
  const panning = useRef<{ startMx: number; startMy: number; origPan: { x: number; y: number } } | null>(null)
  const spaceDown = useRef(false)

  useEffect(() => {
    if (!containerRef.current) return
    const obs = new ResizeObserver(entries => {
      const r = entries[0].contentRect
      setSize({ w: r.width, h: r.height })
    })
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [containerRef])

  // World → screen
  const ws = useCallback((wx: number, wy: number) => ({
    sx: wx * zoom + pan.x,
    sy: wy * zoom + pan.y,
  }), [zoom, pan])

  // Screen → world
  const sw = useCallback((sx: number, sy: number) => ({
    wx: (sx - pan.x) / zoom,
    wy: (sy - pan.y) / zoom,
  }), [zoom, pan])

  // Space key for panning
  useEffect(() => {
    const down = (e: KeyboardEvent) => { if (e.code === 'Space' && e.target === document.body) { e.preventDefault(); spaceDown.current = true } }
    const up = (e: KeyboardEvent) => { if (e.code === 'Space') spaceDown.current = false }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])

  // Scroll to zoom
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    function onWheel(e: WheelEvent) {
      e.preventDefault()
      const rect = el!.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      const factor = e.deltaY > 0 ? 0.9 : 1.1
      const newZoom = Math.max(0.1, Math.min(8, zoom * factor))
      // Zoom toward cursor
      onPanChange({
        x: mx - (mx - pan.x) * (newZoom / zoom),
        y: my - (my - pan.y) * (newZoom / zoom),
      })
      onZoomChange(newZoom)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [zoom, pan, onZoomChange, onPanChange, containerRef])

  function onSvgMouseDown(e: React.MouseEvent) {
    if (e.button === 1 || (e.button === 0 && spaceDown.current)) {
      e.preventDefault()
      panning.current = { startMx: e.clientX, startMy: e.clientY, origPan: { ...pan } }
      return
    }
    if (e.target === svgRef.current) onSelect(null)
  }

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (panning.current) {
        const dx = e.clientX - panning.current.startMx
        const dy = e.clientY - panning.current.startMy
        onPanChange({ x: panning.current.origPan.x + dx, y: panning.current.origPan.y + dy })
        return
      }
      if (!dragging.current) return
      const rect = svgRef.current?.getBoundingClientRect()
      if (!rect) return
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      const { wx, wy } = sw(mx, my)
      const ox = dragging.current.origX + (wx - sw(dragging.current.startMx - rect.left, dragging.current.startMy - rect.top).wx)
      const oy = dragging.current.origY + (wy - sw(dragging.current.startMx - rect.left, dragging.current.startMy - rect.top).wy)
      onChange(moveEntity(doc, dragging.current.id, snap(ox, gridSize, snapToGrid), snap(oy, gridSize, snapToGrid)))
    }
    function onMouseUp() { dragging.current = null; panning.current = null }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp) }
  }, [doc, onChange, sw, snapToGrid, gridSize, onPanChange])

  function onEntityMouseDown(e: React.MouseEvent, entityId: string) {
    if (spaceDown.current) return
    e.stopPropagation()
    onSelect(entityId)
    const entity = findEntity(doc.entities, entityId)
    if (!entity) return
    dragging.current = {
      id: entityId,
      startMx: e.clientX,
      startMy: e.clientY,
      origX: entity.x,
      origY: entity.y,
    }
  }

  const flat = flattenEntities(doc.entities)
  const gameW = doc.game.width * zoom
  const gameH = doc.game.height * zoom

  return (
    <svg
      ref={svgRef}
      className="canvas-overlay"
      width={size.w}
      height={size.h}
      style={{ cursor: spaceDown.current ? 'grab' : 'default' }}
      onMouseDown={onSvgMouseDown}
    >
      {/* Game world boundary */}
      <rect
        x={pan.x}
        y={pan.y}
        width={gameW}
        height={gameH}
        fill={doc.world.background}
        stroke="rgba(79,195,247,0.2)"
        strokeWidth={1}
      />

      {/* Grid */}
      {snapToGrid && zoom > 0.3 && (
        <GridLines gameW={gameW} gameH={gameH} gridSize={gridSize * zoom} pan={pan} />
      )}

      {/* Entities */}
      {flat.map(entity => {
        const { sx, sy } = ws(entity.x, entity.y)
        const isSelected = entity.id === selectedId

        const box = entity.components.find(c => c.type === 'BoxCollider')
        const circle = entity.components.find(c => c.type === 'CircleCollider')
        const sprite = entity.components.find(c => c.type === 'Sprite')
        const hasRB = entity.components.some(c => c.type === 'RigidBody')
        const hasCamera = entity.components.some(c => c.type === 'Camera2D')
        const hasParticle = entity.components.some(c => c.type === 'ParticleEmitter')
        const hasText = entity.components.find(c => c.type === 'Text')

        const bw = ((box?.props.width as number) ?? (sprite?.props.width as number) ?? 32) * zoom
        const bh = ((box?.props.height as number) ?? (sprite?.props.height as number) ?? 32) * zoom
        const br = ((circle?.props.radius as number) ?? 16) * zoom

        const accentColor = isSelected ? '#4fc3f7' : (hasRB ? COMPONENT_CATEGORIES.physics.color : '#6b7a9e')
        const fillOpacity = isSelected ? 0.12 : 0.05

        return (
          <g key={entity.id} onMouseDown={e => onEntityMouseDown(e, entity.id)} style={{ cursor: 'move' }}>
            {/* Entity body */}
            {box && (
              <rect
                x={sx - bw / 2}
                y={sy - bh / 2}
                width={bw}
                height={bh}
                fill={accentColor}
                fillOpacity={fillOpacity}
                stroke={accentColor}
                strokeWidth={isSelected ? 1.5 : 0.75}
                strokeDasharray={box.props.isTrigger ? `${4 * zoom} ${2 * zoom}` : undefined}
                strokeOpacity={isSelected ? 1 : 0.5}
              />
            )}
            {circle && (
              <circle
                cx={sx}
                cy={sy}
                r={br}
                fill={accentColor}
                fillOpacity={fillOpacity}
                stroke={accentColor}
                strokeWidth={isSelected ? 1.5 : 0.75}
                strokeDasharray={circle.props.isTrigger ? `${4 * zoom} ${2 * zoom}` : undefined}
                strokeOpacity={isSelected ? 1 : 0.5}
              />
            )}
            {!box && !circle && !hasCamera && (
              <rect
                x={sx - 12}
                y={sy - 12}
                width={24}
                height={24}
                fill={accentColor}
                fillOpacity={fillOpacity}
                stroke={accentColor}
                strokeWidth={isSelected ? 1.5 : 0.75}
                strokeOpacity={isSelected ? 1 : 0.4}
                strokeDasharray="3 2"
              />
            )}

            {/* Camera frustum */}
            {hasCamera && (
              <g strokeOpacity={isSelected ? 0.8 : 0.3}>
                <rect
                  x={sx - (doc.game.width / 2) * zoom}
                  y={sy - (doc.game.height / 2) * zoom}
                  width={doc.game.width * zoom}
                  height={doc.game.height * zoom}
                  fill="none"
                  stroke="#89dceb"
                  strokeWidth={1}
                  strokeDasharray="6 3"
                />
                <circle cx={sx} cy={sy} r={5} fill="#89dceb" fillOpacity={0.6} stroke="none" />
              </g>
            )}

            {/* Particle halo */}
            {hasParticle && (
              <circle cx={sx} cy={sy} r={20 * zoom} fill="none" stroke="#fab387" strokeWidth={0.75} strokeDasharray="3 2" strokeOpacity={0.5} />
            )}

            {/* Text preview */}
            {hasText && (
              <text
                x={sx}
                y={sy}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={Math.max(8, (hasText.props.fontSize as number ?? 16) * zoom * 0.8)}
                fill={hasText.props.color as string ?? '#ffffff'}
                opacity={0.6}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {String(hasText.props.content ?? 'Text')}
              </text>
            )}

            {/* Crosshair center dot */}
            <circle
              cx={sx}
              cy={sy}
              r={isSelected ? 5 : 3}
              fill={isSelected ? '#4fc3f7' : '#1e2235'}
              stroke={accentColor}
              strokeWidth={1.5}
            />

            {/* Entity label */}
            {isSelected && (
              <text
                x={sx + 10}
                y={sy - 10}
                fontSize={10}
                fill="#4fc3f7"
                fontFamily="'JetBrains Mono', monospace"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {entity.name}
              </text>
            )}

            {/* Hit area */}
            <circle cx={sx} cy={sy} r={Math.max(14, Math.min(bw, bh) / 2)} fill="transparent" />
          </g>
        )
      })}
    </svg>
  )
}

function GridLines({ gameW, gameH, gridSize, pan }: {
  gameW: number; gameH: number; gridSize: number; pan: { x: number; y: number }
}) {
  if (gridSize < 4) return null
  const lines: React.ReactNode[] = []
  const cols = Math.floor(gameW / gridSize)
  const rows = Math.floor(gameH / gridSize)
  for (let i = 1; i < cols; i++) {
    lines.push(<line key={`v${i}`} x1={pan.x + i * gridSize} y1={pan.y} x2={pan.x + i * gridSize} y2={pan.y + gameH} stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />)
  }
  for (let i = 1; i < rows; i++) {
    lines.push(<line key={`h${i}`} x1={pan.x} y1={pan.y + i * gridSize} x2={pan.x + gameW} y2={pan.y + i * gridSize} stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />)
  }
  return <>{lines}</>
}

function flattenEntities(entities: CsxEntity[]): CsxEntity[] {
  const result: CsxEntity[] = []
  function walk(es: CsxEntity[]) { for (const e of es) { result.push(e); walk(e.children) } }
  walk(entities)
  return result
}
