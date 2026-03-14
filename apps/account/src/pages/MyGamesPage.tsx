import { useEffect, useState } from 'react'
import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'
import type { Tables } from '@cubeforgelabs/auth'
import { Pencil, X, Check, Trash2, ExternalLink } from 'lucide-react'

type Game = Tables<'games'> & {
  avg_rating: number | null
  review_count: number
}

type EditState = {
  title: string
  description: string
  tags: string
}

export function MyGamesPage() {
  const { user } = useAuth()
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editState, setEditState] = useState<EditState>({ title: '', description: '', tags: '' })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    if (!user) return
    supabase
      .from('games')
      .select('*, reviews(rating)')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rows = (data as any[]) ?? []
        const mapped: Game[] = rows.map(g => {
          const reviews = (g.reviews as { rating: number }[]) ?? []
          const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null
          return { ...g, avg_rating: avg, review_count: reviews.length }
        })
        setGames(mapped)
        setLoading(false)
      })
  }, [user])

  function startEdit(game: Game) {
    setEditingId(game.id)
    setSaveError('')
    setEditState({
      title: game.title,
      description: game.description ?? '',
      tags: game.tags.join(', '),
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setSaveError('')
  }

  async function saveEdit(id: string) {
    setSaving(true)
    setSaveError('')
    const tags = editState.tags
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(Boolean)
    const { error } = await supabase
      .from('games')
      .update({ title: editState.title, description: editState.description, tags })
      .eq('id', id)
    setSaving(false)
    if (error) { setSaveError(error.message); return }
    setGames(prev => prev.map(g =>
      g.id === id ? { ...g, title: editState.title, description: editState.description, tags } : g
    ))
    setEditingId(null)
  }

  async function deleteGame(id: string) {
    if (!confirm('Delete this game? This cannot be undone.')) return
    await supabase.from('games').delete().eq('id', id)
    setGames(prev => prev.filter(g => g.id !== id))
  }

  const sectionStyle = { background: 'var(--surface)', border: '1px solid var(--border)' }

  return (
    <div className="max-w-2xl flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">My Games</h1>
          <p className="text-xs text-text-muted mt-1">{games.length} game{games.length !== 1 ? 's' : ''} published</p>
        </div>
        <a
          href="https://editor.cubeforge.dev"
          className="rounded-xl px-4 py-2 text-xs font-semibold text-bg transition-colors"
          style={{ background: 'var(--accent)' }}
        >
          + New game
        </a>
      </div>

      {loading ? (
        <div className="text-sm text-text-dim">Loading…</div>
      ) : games.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 text-center rounded-2xl"
          style={sectionStyle}
        >
          <p className="text-sm text-text-dim mb-2">No games yet</p>
          <p className="text-xs text-text-muted mb-4">Build your first game in the editor and publish it here.</p>
          <a
            href="https://editor.cubeforge.dev"
            className="rounded-xl px-5 py-2 text-sm font-semibold text-bg transition-colors"
            style={{ background: 'var(--accent)' }}
          >
            Open Editor
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {games.map(game => (
            <div key={game.id} className="rounded-xl p-4 flex flex-col gap-3" style={sectionStyle}>
              {editingId === game.id ? (
                /* ── Edit form ── */
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    {game.thumbnail_url ? (
                      <img src={game.thumbnail_url} alt="" className="w-14 h-10 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-14 h-10 rounded-lg shrink-0" style={{ background: 'var(--surface2)' }} />
                    )}
                    <input
                      className="inner-input flex-1 text-sm font-medium"
                      value={editState.title}
                      onChange={e => setEditState(s => ({ ...s, title: e.target.value }))}
                      placeholder="Game title"
                      required
                    />
                  </div>
                  <textarea
                    className="inner-input text-sm resize-none"
                    rows={3}
                    value={editState.description}
                    onChange={e => setEditState(s => ({ ...s, description: e.target.value }))}
                    placeholder="Description…"
                  />
                  <div>
                    <input
                      className="inner-input text-sm"
                      value={editState.tags}
                      onChange={e => setEditState(s => ({ ...s, tags: e.target.value }))}
                      placeholder="Tags, comma separated (e.g. platformer, puzzle)"
                    />
                    <p className="text-[10px] text-text-muted mt-1">Comma-separated</p>
                  </div>
                  {saveError && <p className="text-xs" style={{ color: 'var(--error)' }}>{saveError}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(game.id)}
                      disabled={saving || !editState.title.trim()}
                      className="inline-flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-semibold text-bg disabled:opacity-50 transition-colors"
                      style={{ background: 'var(--accent)' }}
                    >
                      <Check size={12} /> {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="inline-flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs text-text-dim transition-colors"
                      style={{ border: '1px solid var(--border)' }}
                    >
                      <X size={12} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Display row ── */
                <div className="flex items-center gap-3">
                  {game.thumbnail_url ? (
                    <img src={game.thumbnail_url} alt="" className="w-14 h-10 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-14 h-10 rounded-lg shrink-0" style={{ background: 'var(--surface2)' }} />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text truncate">{game.title}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-text-muted">{game.plays.toLocaleString()} plays</span>
                      {game.avg_rating !== null && (
                        <span className="text-xs flex items-center gap-0.5" style={{ color: '#facc15' }}>
                          ★ <span className="text-text-muted" style={{ color: 'var(--text-muted)' }}>
                            {game.avg_rating.toFixed(1)} ({game.review_count})
                          </span>
                        </span>
                      )}
                    </div>
                    {game.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {game.tags.map(tag => (
                          <span key={tag} className="text-[10px] font-mono text-text-muted px-1.5 py-0.5 rounded" style={{ border: '1px solid var(--border)' }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={`https://play.cubeforge.dev/game/${game.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                      title="View on play"
                    >
                      <ExternalLink size={14} />
                    </a>
                    <button
                      onClick={() => startEdit(game)}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => deleteGame(game.id)}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--error)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
