import { useEffect, useState } from 'react'
import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'

type GameRow = {
  id: string
  title: string
  plays: number
  created_at: string
  thumbnail_url: string | null
  tags: string[]
}

type ReviewRow = {
  game_id: string
  rating: number
  created_at: string
}

type GameStat = GameRow & {
  review_count: number
  avg_rating: number | null
}

export function AnalyticsPage() {
  const { user } = useAuth()
  const [gameStats, setGameStats] = useState<GameStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    async function fetchData() {
      const { data: gamesData } = await supabase
        .from('games')
        .select('id, title, plays, created_at, thumbnail_url, tags')
        .eq('author_id', user!.id)
        .not('bundle_path', 'is', null)
        .order('plays', { ascending: false })

      const games = (gamesData as GameRow[] | null) ?? []

      if (games.length === 0) {
        setGameStats([])
        setLoading(false)
        return
      }

      const gameIds = games.map(g => g.id)

      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('game_id, rating, created_at')
        .in('game_id', gameIds)

      const reviews = (reviewsData as ReviewRow[] | null) ?? []

      const stats: GameStat[] = games.map(game => {
        const gameReviews = reviews.filter(r => r.game_id === game.id)
        const review_count = gameReviews.length
        const avg_rating = review_count
          ? gameReviews.reduce((sum, r) => sum + r.rating, 0) / review_count
          : null
        return { ...game, review_count, avg_rating }
      })

      setGameStats(stats)
      setLoading(false)
    }

    fetchData()
  }, [user])

  const totalPlays = gameStats.reduce((sum, g) => sum + g.plays, 0)
  const totalGames = gameStats.length
  const totalReviews = gameStats.reduce((sum, g) => sum + g.review_count, 0)
  const avgRating =
    totalReviews > 0
      ? gameStats.reduce((sum, g) => sum + (g.avg_rating ?? 0) * g.review_count, 0) / totalReviews
      : null

  const summaryCards = [
    { label: 'Total Plays', value: totalPlays.toLocaleString() },
    { label: 'Total Games', value: totalGames.toLocaleString() },
    { label: 'Total Reviews', value: totalReviews.toLocaleString() },
    {
      label: 'Avg Rating',
      value: avgRating !== null ? `★ ${avgRating.toFixed(1)}` : '—',
      yellow: avgRating !== null,
    },
  ]

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  function getInitialColor(title: string) {
    const colors = [
      '#4fc3f7', '#81c784', '#ffb74d', '#f48fb1',
      '#ce93d8', '#80cbc4', '#e57373', '#fff176',
    ]
    const idx = title.charCodeAt(0) % colors.length
    return colors[idx]
  }

  return (
    <div className="max-w-3xl flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-text">Analytics</h1>
        <p className="text-xs text-text-muted mt-1">Stats for your published games</p>
      </div>

      {loading ? (
        <div className="text-sm text-text-dim">Loading…</div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {summaryCards.map(card => (
              <div
                key={card.label}
                className="rounded-xl border border-border bg-surface p-4 text-center"
                style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
              >
                <p className="text-xs text-text-muted mb-1">{card.label}</p>
                <p
                  className="text-lg font-semibold"
                  style={{ color: card.yellow ? '#facc15' : 'var(--text)' }}
                >
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          {/* Per-game table */}
          {gameStats.length === 0 ? (
            <div
              className="flex items-center justify-center py-16 rounded-xl text-sm text-text-dim"
              style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
            >
              No published games yet
            </div>
          ) : (
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: '1px solid var(--border)' }}
            >
              {/* Table header */}
              <div
                className="grid px-4 py-2"
                style={{
                  background: 'var(--surface2)',
                  gridTemplateColumns: '40px 1fr 80px 72px 96px 88px',
                  gap: '0 12px',
                }}
              >
                {['', 'Game', 'Plays', 'Reviews', 'Avg Rating', 'Published'].map((col, i) => (
                  <span
                    key={i}
                    className="text-[10px] uppercase font-semibold text-text-muted"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {col}
                  </span>
                ))}
              </div>

              {/* Table rows */}
              {gameStats.map(game => (
                <div
                  key={game.id}
                  className="grid items-center px-4 py-3 border-b border-border last:border-0 transition-colors"
                  style={{
                    gridTemplateColumns: '40px 1fr 80px 72px 96px 88px',
                    gap: '0 12px',
                    borderColor: 'var(--border)',
                  }}
                  onMouseEnter={e =>
                    ((e.currentTarget as HTMLDivElement).style.background = 'color-mix(in srgb, var(--surface2) 50%, transparent)')
                  }
                  onMouseLeave={e =>
                    ((e.currentTarget as HTMLDivElement).style.background = '')
                  }
                >
                  {/* Thumbnail */}
                  {game.thumbnail_url ? (
                    <img
                      src={game.thumbnail_url}
                      alt=""
                      className="rounded object-cover"
                      style={{ width: 40, height: 28 }}
                    />
                  ) : (
                    <div
                      className="rounded flex items-center justify-center text-xs font-bold text-bg"
                      style={{
                        width: 40,
                        height: 28,
                        background: getInitialColor(game.title),
                      }}
                    >
                      {game.title.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Title */}
                  <p className="text-sm font-medium text-text truncate" style={{ color: 'var(--text)' }}>
                    {game.title}
                  </p>

                  {/* Plays */}
                  <p className="text-sm text-text-muted" style={{ color: 'var(--text-muted)' }}>
                    {game.plays.toLocaleString()}
                  </p>

                  {/* Reviews */}
                  <p className="text-sm text-text-muted" style={{ color: 'var(--text-muted)' }}>
                    {game.review_count}
                  </p>

                  {/* Avg Rating */}
                  {game.avg_rating !== null ? (
                    <p className="text-sm font-medium" style={{ color: '#facc15' }}>
                      ★ {game.avg_rating.toFixed(1)}
                    </p>
                  ) : (
                    <p className="text-sm text-text-muted" style={{ color: 'var(--text-muted)' }}>
                      —
                    </p>
                  )}

                  {/* Published date */}
                  <p className="text-sm text-text-muted" style={{ color: 'var(--text-muted)' }}>
                    {formatDate(game.created_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
