import { useState } from 'react'
import type { CsxDocument, CsxEntity } from '../lib/csx'
import { createEntity } from '../lib/csx'
import { removeEntity, renameEntity } from '../lib/csxUtils'
import { COMPONENT_REGISTRY } from '../lib/componentRegistry'

interface Props {
  doc: CsxDocument
  selectedId: string | null
  onSelect: (id: string | null) => void
  onChange: (doc: CsxDocument) => void
}

export function HierarchyPanel({ doc, selectedId, onSelect, onChange }: Props) {
  function handleAddEntity() {
    const entity = createEntity('Entity', 100, 100)
    onChange({ ...doc, entities: [...doc.entities, entity] })
    onSelect(entity.id)
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
      x: entity.x + 16,
      y: entity.y + 16,
      children: [],
    }
    onChange({ ...doc, entities: [...doc.entities, clone] })
    onSelect(clone.id)
  }

  return (
    <div className="panel-section">
      <div className="panel-header">
        <span>SCENE</span>
        <button className="panel-icon-btn" onClick={handleAddEntity} title="Add entity">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M6 2v8M2 6h8" />
          </svg>
        </button>
      </div>

      {/* Game / World root nodes */}
      <div className="hierarchy-root">
        <div className={`hierarchy-item hierarchy-item--root${!selectedId ? ' active' : ''}`} onClick={() => onSelect(null)}>
          <span className="hierarchy-icon">⬡</span>
          <span>Game</span>
        </div>
      </div>

      <div className="hierarchy-entities">
        {doc.entities.length === 0 ? (
          <p className="hierarchy-empty">No entities yet.<br />Press + to add one.</p>
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
            />
          ))
        )}
      </div>
    </div>
  )
}

function EntityRow({
  entity, selectedId, onSelect, onDelete, onRename, onDuplicate,
}: {
  entity: CsxEntity
  selectedId: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onRename: (id: string, name: string) => void
  onDuplicate: (e: CsxEntity) => void
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

  const componentTags = entity.components
    .slice(0, 3)
    .map(c => COMPONENT_REGISTRY[c.type]?.icon ?? '?')
    .join('')

  return (
    <div
      className={`hierarchy-item${isSelected ? ' active' : ''}`}
      onClick={() => onSelect(entity.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
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
        <span className="hierarchy-name" onDoubleClick={e => { e.stopPropagation(); setDraft(entity.name); setEditing(true) }}>
          {entity.name}
        </span>
      )}

      {componentTags && <span className="hierarchy-comp-tags">{componentTags}</span>}

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
  )
}
