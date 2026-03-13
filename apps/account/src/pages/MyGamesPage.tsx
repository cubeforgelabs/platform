import { useEffect, useState } from 'react'
import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'
import type { Tables } from '@cubeforgelabs/auth'

type Game = Tables<'games'>

export function MyGamesPage() {
  const { user } = useAuth()
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from('games')
      .select('*')
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setGames(data ?? [])
        setLoading(false)
      })
  }, [user])

  async function togglePublished(game: Game) {
    await supabase.from('games').update({ published: !game.published }).eq('id', game.id)
    setGames(prev => prev.map(g => g.id === game.id ? { ...g, published: !g.published } : g))
  }

  async function deleteGame(id: string) {
    if (!confirm('Delete this game?')) return
    await supabase.from('games').delete().eq('id', id)
    setGames(prev => prev.filter(g => g.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-text">My Games</h1>
        <a
          href="https://editor.cubeforge.dev"
          className="rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-bg hover:bg-accent2 transition-colors"
        >
          + New game
        </a>
      </div>

      {loading ? (
        <div className="text-sm text-text-dim">Loading…</div>
      ) : games.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-border rounded-2xl bg-surface">
          <p className="text-sm text-text-dim mb-2">No games yet</p>
          <p className="text-xs text-text-muted mb-4">Build your first game in the editor and publish it here.</p>
          <a
            href="https://editor.cubeforge.dev"
            className="rounded-xl bg-accent px-5 py-2 text-sm font-semibold text-bg hover:bg-accent2 transition-colors"
          >
            Open Editor
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {games.map(game => (
            <div key={game.id} className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4">
              {game.thumbnail_url ? (
                <img src={game.thumbnail_url} alt="" className="w-14 h-10 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-14 h-10 rounded-lg bg-surface2 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text truncate">{game.title}</p>
                <p className="text-xs text-text-muted">{game.play_count} plays</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => togglePublished(game)}
                  className={`text-xs px-3 py-1 rounded-lg border transition-colors ${
                    game.published
                      ? 'border-green/30 text-green bg-green/10 hover:bg-green/20'
                      : 'border-border text-text-muted hover:text-text'
                  }`}
                >
                  {game.published ? 'Published' : 'Draft'}
                </button>
                <a
                  href={`https://play.cubeforge.dev/games/${game.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-text-muted hover:text-text transition-colors"
                >
                  View
                </a>
                <button
                  onClick={() => deleteGame(game.id)}
                  className="text-xs text-text-muted hover:text-red transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
