import { useState } from 'react'
import type { CsxDocument, CsxEntity } from '../lib/csx'
import {
  addComponent, removeComponent, updateComponentProp,
  moveEntity, collectEntityNames,
} from '../lib/csxUtils'
import {
  COMPONENT_REGISTRY, COMPONENT_CATEGORIES, COMPONENT_LIST,
  type FieldSchema,
} from '../lib/componentRegistry'

interface Props {
  doc: CsxDocument
  selectedId: string | null
  onChange: (doc: CsxDocument) => void
}

export function InspectorPanel({ doc, selectedId, onChange }: Props) {
  if (!selectedId) return <GameInspector doc={doc} onChange={onChange} />

  const entity = doc.entities.find(e => e.id === selectedId)
    ?? doc.entities.flatMap(function walk(e): CsxEntity[] { return [e, ...e.children.flatMap(walk)] })
        .find(e => e.id === selectedId)
  if (!entity) return null

  return <EntityInspector doc={doc} entity={entity} onChange={onChange} />
}

/* ── Game-level inspector (nothing selected) ─────────────────────────── */

function GameInspector({ doc, onChange }: { doc: CsxDocument; onChange: (d: CsxDocument) => void }) {
  function set<K extends keyof typeof doc.game>(key: K, value: typeof doc.game[K]) {
    onChange({ ...doc, game: { ...doc.game, [key]: value } })
  }
  function setWorld<K extends keyof typeof doc.world>(key: K, value: typeof doc.world[K]) {
    onChange({ ...doc, world: { ...doc.world, [key]: value } })
  }

  return (
    <div className="inspector">
      <div className="panel-header"><span>GAME SETTINGS</span></div>
      <div className="inspector-section">
        <div className="inspector-row">
          <label>Width</label>
          <input type="number" className="inspector-input" value={doc.game.width}
            onChange={e => set('width', Number(e.target.value))} />
        </div>
        <div className="inspector-row">
          <label>Height</label>
          <input type="number" className="inspector-input" value={doc.game.height}
            onChange={e => set('height', Number(e.target.value))} />
        </div>
        <div className="inspector-row">
          <label>Gravity</label>
          <input type="number" className="inspector-input" value={doc.game.gravity}
            onChange={e => set('gravity', Number(e.target.value))} />
        </div>
        <div className="inspector-row">
          <label>Debug</label>
          <Toggle checked={doc.game.debug} onChange={v => set('debug', v)} />
        </div>
      </div>
      <div className="inspector-section">
        <div className="inspector-section-title">World</div>
        <div className="inspector-row">
          <label>Background</label>
          <input type="color" className="inspector-color" value={doc.world.background}
            onChange={e => setWorld('background', e.target.value)} />
        </div>
      </div>
    </div>
  )
}

/* ── Entity inspector ─────────────────────────────────────────────────── */

function EntityInspector({ doc, entity, onChange }: { doc: CsxDocument; entity: CsxEntity; onChange: (d: CsxDocument) => void }) {
  const [addOpen, setAddOpen] = useState(false)
  const entityNames = collectEntityNames(doc.entities)

  function setPos(key: 'x' | 'y', v: number) {
    onChange(moveEntity(doc, entity.id, key === 'x' ? v : entity.x, key === 'y' ? v : entity.y))
  }

  function handleAddComp(type: string) {
    const def = COMPONENT_REGISTRY[type]
    if (!def) return
    onChange(addComponent(doc, entity.id, { type, props: { ...def.defaultProps } }))
    setAddOpen(false)
  }

  function handleRemoveComp(idx: number) {
    onChange(removeComponent(doc, entity.id, idx))
  }

  function handlePropChange(compIdx: number, key: string, value: unknown) {
    onChange(updateComponentProp(doc, entity.id, compIdx, key, value))
  }

  return (
    <div className="inspector">
      <div className="panel-header"><span>INSPECTOR</span></div>

      {/* Transform */}
      <div className="inspector-section">
        <div className="inspector-section-title">Transform</div>
        <div className="inspector-row-pair">
          <div className="inspector-row">
            <label>X</label>
            <input type="number" className="inspector-input" value={entity.x}
              onChange={e => setPos('x', Number(e.target.value))} />
          </div>
          <div className="inspector-row">
            <label>Y</label>
            <input type="number" className="inspector-input" value={entity.y}
              onChange={e => setPos('y', Number(e.target.value))} />
          </div>
        </div>
      </div>

      {/* Components */}
      {entity.components.map((comp, i) => {
        const def = COMPONENT_REGISTRY[comp.type]
        const catColor = def ? COMPONENT_CATEGORIES[def.category].color : '#6b7a9e'
        return (
          <div key={i} className="inspector-section">
            <div className="inspector-comp-header">
              <span className="inspector-comp-dot" style={{ background: catColor }} />
              <span className="inspector-comp-name">{def?.label ?? comp.type}</span>
              <button className="hierarchy-action-btn danger" onClick={() => handleRemoveComp(i)} title="Remove component">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M3 3l6 6M9 3l-6 6" />
                </svg>
              </button>
            </div>
            {(def?.schema ?? []).map(field => (
              <FieldRow
                key={field.key}
                field={field}
                value={comp.props[field.key]}
                entityNames={entityNames}
                onChange={v => handlePropChange(i, field.key, v)}
              />
            ))}
          </div>
        )
      })}

      {/* Add component */}
      <div className="inspector-add-comp">
        <button className="inspector-add-comp-btn" onClick={() => setAddOpen(o => !o)}>
          + Add Component
        </button>
        {addOpen && (
          <div className="comp-picker">
            {Object.entries(COMPONENT_CATEGORIES).map(([cat, { label, color }]) => {
              const comps = COMPONENT_LIST.filter(c => c.category === cat)
              if (!comps.length) return null
              return (
                <div key={cat}>
                  <div className="comp-picker-cat" style={{ color }}>{label}</div>
                  {comps.map(def => (
                    <button key={def.type} className="comp-picker-item" onClick={() => handleAddComp(def.type)}>
                      <span>{def.icon}</span>
                      <span>{def.label}</span>
                    </button>
                  ))}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Field renderer ───────────────────────────────────────────────────── */

function FieldRow({ field, value, entityNames, onChange }: {
  field: FieldSchema
  value: unknown
  entityNames: string[]
  onChange: (v: unknown) => void
}) {
  const label = field.label ?? field.key

  if (field.type === 'boolean') {
    return (
      <div className="inspector-row">
        <label>{label}</label>
        <Toggle checked={Boolean(value)} onChange={onChange} />
      </div>
    )
  }

  if (field.type === 'color') {
    return (
      <div className="inspector-row">
        <label>{label}</label>
        <input type="color" className="inspector-color" value={String(value ?? '#ffffff')}
          onChange={e => onChange(e.target.value)} />
      </div>
    )
  }

  if (field.type === 'number') {
    return (
      <div className="inspector-row">
        <label>{label}</label>
        <input
          type="number"
          className="inspector-input"
          value={value as number ?? 0}
          min={field.min}
          max={field.max}
          step={field.step ?? 1}
          onChange={e => onChange(Number(e.target.value))}
        />
      </div>
    )
  }

  if (field.type === 'select') {
    return (
      <div className="inspector-row">
        <label>{label}</label>
        <select className="inspector-select" value={String(value ?? '')} onChange={e => onChange(e.target.value)}>
          {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    )
  }

  if (field.type === 'entity-ref') {
    return (
      <div className="inspector-row">
        <label>{label}</label>
        <select className="inspector-select" value={String(value ?? '')} onChange={e => onChange(e.target.value)}>
          <option value="">— none —</option>
          {entityNames.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
    )
  }

  // string, file-image, file-audio
  return (
    <div className="inspector-row">
      <label>{label}</label>
      <input
        type="text"
        className="inspector-input"
        value={String(value ?? '')}
        placeholder={field.type === 'file-image' ? 'image.png' : field.type === 'file-audio' ? 'sound.mp3' : ''}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`inspector-toggle${checked ? ' on' : ''}`}
    >
      <span className="inspector-toggle-knob" />
    </button>
  )
}
