import { useEffect, useState } from 'react'
import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'
import { Trash2 } from 'lucide-react'

type HistoryEntry = {
  game_id: string
  played_at: string
  games: {
    id: string
    title: string
    thumbnail_url: string | null
  } | null
}

export function HistoryPage() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  async function loadHistory() {
    if (!user) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('play_history')
      .select('game_id, played_at, games(id, title, thumbnail_url)')
      .eq('user_id', user.id)
      .order('played_at', { ascending: false })
    setEntries(data ?? [])
    setLoading(false)
  }

  useEffect(() => { loadHistory() }, [user])

  async function removeEntry(gameId: string) {
    if (!user) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('play_history').delete().eq('user_id', user.id).eq('game_id', gameId)
    setEntries(e => e.filter(x => x.game_id !== gameId))
  }

  async function clearAll() {
    if (!user || !window.confirm('Clear your entire play history?')) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('play_history').delete().eq('user_id', user.id)
    setEntries([])
  }

  if (loading) return <div className="text-sm text-text-dim">Loading…</div>

  return (
    <div className="max-w-2xl flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Play History</h1>
          <p className="text-xs text-text-muted mt-1">Games you've played, most recent first</p>
        </div>
        {entries.length > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-text-muted hover:text-text transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <p className="text-sm text-text-dim">No games played yet.</p>
          <a
            href="https://play.cubeforge.dev"
            className="text-xs mt-2 inline-block hover:underline"
            style={{ color: 'var(--accent)' }}
          >
            Browse games
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map(entry => (
            <div
              key={entry.game_id}
              className="flex items-center gap-3 rounded-xl p-3"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              {entry.games?.thumbnail_url ? (
                <img
                  src={entry.games.thumbnail_url}
                  alt=""
                  className="w-12 h-10 rounded-lg object-cover shrink-0"
                />
              ) : (
                <div
                  className="w-12 h-10 rounded-lg shrink-0"
                  style={{ background: 'var(--surface2)' }}
                />
              )}
              <div className="flex-1 min-w-0">
                <a
                  href={`https://play.cubeforge.dev/game/${entry.game_id}`}
                  className="text-sm font-medium text-text hover:text-accent transition-colors truncate block"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--text)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text)')}
                >
                  {entry.games?.title ?? 'Unknown Game'}
                </a>
                <p className="text-xs text-text-muted mt-0.5">
                  {new Date(entry.played_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </p>
              </div>
              <button
                onClick={() => removeEntry(entry.game_id)}
                className="shrink-0 p-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--error)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                title="Remove from history"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
