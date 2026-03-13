import { useState } from 'react'
import type { CsxDocument, CsxEntity, CsxComponent } from '../lib/csx'
import { createEntity } from '../lib/csx'
import { removeEntity, renameEntity } from '../lib/csxUtils'
import { COMPONENT_REGISTRY } from '../lib/componentRegistry'

interface Prefab {
  label: string
  icon: string
  name: string
  components: CsxComponent[]
  x?: number
  y?: number
}

const PREFABS: Prefab[] = [
  {
    label: 'Character', icon: '🧍', name: 'Character',
    components: [
      { type: 'RigidBody',   props: { mass: 1, lockRotation: true, gravityScale: 1 } },
      { type: 'BoxCollider', props: { width: 32, height: 48 } },
      { type: 'Sprite',      props: { width: 32, height: 48, src: '' } },
    ],
    x: 100, y: 200,
  },
  {
    label: 'Platform', icon: '▬', name: 'Platform',
    components: [
      { type: 'BoxCollider', props: { width: 200, height: 24 } },
    ],
    x: 200, y: 400,
  },
  {
    label: 'Camera', icon: '📷', name: 'Camera',
    components: [
      { type: 'Camera2D', props: { smoothing: 0.87, zoom: 1 } },
    ],
    x: 450, y: 280,
  },
  {
    label: 'Trigger', icon: '⚡', name: 'Trigger',
    components: [
      { type: 'BoxCollider', props: { width: 64, height: 64, isTrigger: true } },
    ],
    x: 300, y: 200,
  },
  {
    label: 'Enemy', icon: '👾', name: 'Enemy',
    components: [
      { type: 'RigidBody',   props: { mass: 1, lockRotation: true } },
      { type: 'BoxCollider', props: { width: 32, height: 32 } },
      { type: 'Sprite',      props: { width: 32, height: 32, src: '' } },
    ],
    x: 400, y: 200,
  },
  {
    label: 'Text', icon: 'T', name: 'Label',
    components: [
      { type: 'Text', props: { content: 'Hello', fontSize: 24, color: '#ffffff', align: 'left' } },
    ],
    x: 200, y: 100,
  },
  {
    label: 'Particles', icon: '✨', name: 'Particles',
    components: [
      { type: 'ParticleEmitter', props: { rate: 20, speed: 100, lifetime: 1, color: '#4fc3f7' } },
    ],
    x: 300, y: 300,
  },
  {
    label: 'Sound', icon: '🔊', name: 'Sound',
    components: [
      { type: 'SoundEmitter', props: { src: '', volume: 1, loop: false, autoPlay: false } },
    ],
    x: 100, y: 100,
  },
]

interface Props {
  doc: CsxDocument
  selectedId: string | null
  onSelect: (id: string | null) => void
  onChange: (doc: CsxDocument) => void
}

export function HierarchyPanel({ doc, selectedId, onSelect, onChange }: Props) {
  const [showPrefabs, setShowPrefabs] = useState(false)

  function handleAddEntity() {
    const entity = createEntity('Entity', 100, 100)
    onChange({ ...doc, entities: [...doc.entities, entity] })
    onSelect(entity.id)
  }

  function handleAddPrefab(prefab: Prefab) {
    const entity: CsxEntity = {
      ...createEntity(prefab.name, prefab.x ?? 100, prefab.y ?? 100),
      components: prefab.components.map(c => ({ ...c, props: { ...c.props } })),
    }
    onChange({ ...doc, entities: [...doc.entities, entity] })
    onSelect(entity.id)
    setShowPrefabs(false)
  }

  function handleDelete(id: string) {
    if (selectedId === id) onSelect(null)
    onChange({ ...doc, entities: removeEntity(doc.entities, id) })
  }

  function handleRename(id: string, name: string) {
    onChange(renameEntity(doc, id, name))
  }

  function handleDuplicate(entity: CsxEntity) {
    const clone: CsxEntity = {
      ...entity,
      id: `e_${Math.random().toString(36).slice(2, 9)}`,
      name: `${entity.name} Copy`,
      x: entity.x + 20,
      y: entity.y + 20,
      components: entity.components.map(c => ({ ...c, props: { ...c.props } })),
      children: [],
    }
    onChange({ ...doc, entities: [...doc.entities, clone] })
    onSelect(clone.id)
  }

  return (
    <div className="panel-section">
      <div className="panel-header">
        <span>SCENE</span>
        <div style={{ display: 'flex', gap: 2 }}>
          <button className="panel-icon-btn" onClick={() => setShowPrefabs(o => !o)} title="Add prefab">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <rect x="1.5" y="1.5" width="4" height="4" rx="0.5" />
              <rect x="6.5" y="1.5" width="4" height="4" rx="0.5" />
              <rect x="1.5" y="6.5" width="4" height="4" rx="0.5" />
              <rect x="6.5" y="6.5" width="4" height="4" rx="0.5" />
            </svg>
          </button>
          <button className="panel-icon-btn" onClick={handleAddEntity} title="Add empty entity">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M6 2v8M2 6h8" />
            </svg>
          </button>
        </div>
      </div>

      {/* Prefab picker */}
      {showPrefabs && (
        <div className="prefab-picker">
          <div className="prefab-grid">
            {PREFABS.map(p => (
              <button key={p.label} className="prefab-btn" onClick={() => handleAddPrefab(p)} title={p.label}>
                <span className="prefab-icon">{p.icon}</span>
                <span className="prefab-label">{p.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Game root node */}
      <div className="hierarchy-root">
        <div
          className={`hierarchy-item hierarchy-item--root${!selectedId ? ' active' : ''}`}
          onClick={() => onSelect(null)}
        >
          <span className="hierarchy-icon">⬡</span>
          <span>Game</span>
          <span style={{ fontSize: 9, color: 'var(--text-muted)', marginLeft: 'auto' }}>
            {doc.entities.length} entities
          </span>
        </div>
      </div>

      <div className="hierarchy-entities">
        {doc.entities.length === 0 ? (
          <div className="hierarchy-empty">
            <p>No entities yet.</p>
            <button className="hierarchy-empty-btn" onClick={() => setShowPrefabs(true)}>Add from prefabs</button>
          </div>
        ) : (
          doc.entities.map(e => (
            <EntityRow
              key={e.id}
              entity={e}
              selectedId={selectedId}
              onSelect={onSelect}
              onDelete={handleDelete}
              onRename={handleRename}
              onDuplicate={handleDuplicate}
              depth={0}
            />
          ))
        )}
      </div>
    </div>
  )
}

function EntityRow({
  entity, selectedId, onSelect, onDelete, onRename, onDuplicate, depth,
}: {
  entity: CsxEntity
  selectedId: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onRename: (id: string, name: string) => void
  onDuplicate: (e: CsxEntity) => void
  depth: number
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(entity.name)
  const [hovered, setHovered] = useState(false)
  const isSelected = selectedId === entity.id

  function commitRename() {
    const name = draft.trim() || entity.name
    setDraft(name)
    onRename(entity.id, name)
    setEditing(false)
  }

  const compIcons = entity.components
    .slice(0, 3)
    .map(c => COMPONENT_REGISTRY[c.type]?.icon ?? '·')
    .join('')

  const hasChildren = entity.children.length > 0

  return (
    <>
      <div
        className={`hierarchy-item${isSelected ? ' active' : ''}`}
        style={{ paddingLeft: 10 + depth * 14 }}
        onClick={() => onSelect(entity.id)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {hasChildren ? (
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none" style={{ flexShrink: 0, opacity: 0.4 }}>
            <path d="M1 2l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        ) : (
          <span style={{ width: 8, flexShrink: 0 }} />
        )}

        <span className="hierarchy-entity-icon">□</span>

        {editing ? (
          <input
            autoFocus
            className="hierarchy-rename-input"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setEditing(false) }}
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <span
            className="hierarchy-name"
            onDoubleClick={e => { e.stopPropagation(); setDraft(entity.name); setEditing(true) }}
          >
            {entity.name}
          </span>
        )}

        {compIcons && <span className="hierarchy-comp-tags">{compIcons}</span>}

        {(hovered || isSelected) && !editing && (
          <div className="hierarchy-actions" onClick={e => e.stopPropagation()}>
            <button className="hierarchy-action-btn" title="Duplicate" onClick={() => onDuplicate(entity)}>
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="4" y="4" width="7" height="7" rx="1" />
                <path d="M8 4V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h1" />
              </svg>
            </button>
            <button className="hierarchy-action-btn danger" title="Delete" onClick={() => onDelete(entity.id)}>
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M2 3h8M5 3V2h2v1M4 3l.5 7h3L8 3" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {entity.children.map(child => (
        <EntityRow
          key={child.id}
          entity={child}
          selectedId={selectedId}
          onSelect={onSelect}
          onDelete={onDelete}
          onRename={onRename}
          onDuplicate={onDuplicate}
          depth={depth + 1}
        />
      ))}
    </>
  )
}
