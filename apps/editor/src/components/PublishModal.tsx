import { useState } from 'react'
import type { CsxDocument } from '../lib/csx'
import { publishProject, type PublishMeta } from '../lib/publish'

const SUGGESTED_TAGS = ['platformer', 'arcade', 'puzzle', 'shooter', 'top-down', 'idle', 'physics', 'multiplayer']

interface Props {
  doc: CsxDocument
  userId: string
  onClose: () => void
  onSuccess: (gameId: string, url: string, updatedDoc: CsxDocument) => void
}

export function PublishModal({ doc, userId, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState(doc.meta.name)
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [isPublic] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState('')
  const [tagInput, setTagInput] = useState('')

  function toggleTag(tag: string) {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  function addCustomTag() {
    const t = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
    if (t && !tags.includes(t)) setTags(prev => [...prev, t])
    setTagInput('')
  }

  async function handlePublish() {
    if (!title.trim()) { setError('Title is required'); return }
    setPublishing(true)
    setError('')
    try {
      const meta: PublishMeta = { title: title.trim(), description, tags, isPublic }
      const result = await publishProject(doc, meta, userId)
      // Update doc meta with game_id for future re-publishes
      const updatedDoc: CsxDocument = { ...doc, meta: { ...doc.meta, game_id: result.gameId } }
      onSuccess(result.gameId, result.url, updatedDoc)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Publish failed')
    } finally {
      setPublishing(false)
    }
  }

  const isRePublish = !!doc.meta.game_id

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isRePublish ? 'Update game' : 'Publish game'}</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M2 2l10 10M12 2L2 12" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-field">
            <label>Title *</label>
            <input
              className="modal-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="My Awesome Game"
              autoFocus
            />
          </div>

          <div className="modal-field">
            <label>Description</label>
            <textarea
              className="modal-input modal-textarea"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Tell players what this game is about…"
              rows={3}
            />
          </div>

          <div className="modal-field">
            <label>Tags</label>
            <div className="modal-tags">
              {SUGGESTED_TAGS.map(tag => (
                <button
                  key={tag}
                  className={`modal-tag${tags.includes(tag) ? ' active' : ''}`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="modal-tag-input-row">
              <input
                className="modal-input"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomTag()}
                placeholder="Add custom tag…"
              />
              <button className="modal-tag-add" onClick={addCustomTag}>Add</button>
            </div>
            {tags.length > 0 && (
              <div className="modal-tags" style={{ marginTop: 6 }}>
                {tags.map(t => (
                  <button key={t} className="modal-tag active" onClick={() => toggleTag(t)}>
                    {t} ✕
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && <p className="modal-error">{error}</p>}
        </div>

        <div className="modal-footer">
          <button className="modal-cancel" onClick={onClose}>Cancel</button>
          <button
            className="modal-publish-btn"
            onClick={handlePublish}
            disabled={publishing || !title.trim()}
          >
            {publishing ? 'Publishing…' : isRePublish ? 'Update & Publish' : 'Publish to play.cubeforge.dev'}
          </button>
        </div>
      </div>
    </div>
  )
}
