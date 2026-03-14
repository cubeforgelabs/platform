import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { fetchGames, type GameListItem } from '../lib/api'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth-context'
import { FeaturedBanner } from '../components/FeaturedBanner'
import { GameCard } from '../components/GameCard'
import { TagFilter } from '../components/TagFilter'
import { SearchBar } from '../components/SearchBar'

type SortKey = 'popular' | 'newest'

type RecentGame = {
  game_id: string
  played_at: string
  games: GameListItem | null
}

export function HomePage() {
  const { user } = useAuth()
  const [games, setGames] = useState<GameListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tag, setTag] = useState('All')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('popular')
  const [recentGames, setRecentGames] = useState<RecentGame[]>([])
  const [followingGames, setFollowingGames] = useState<GameListItem[]>([])

  useEffect(() => {
    fetchGames().then((data) => {
      setGames(data)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!user) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(supabase as any)
      .from('play_history')
      .select('game_id, played_at, games(*)')
      .eq('user_id', user.id)
      .order('played_at', { ascending: false })
      .limit(8)
      .then(({ data }: { data: RecentGame[] | null }) => {
        setRecentGames((data ?? []).filter((r) => r.games != null))
      })
  }, [user])

  useEffect(() => {
    if (!user) return
    supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)
      .then(({ data }) => {
        if (!data || data.length === 0) return
        const ids = data.map((f) => f.following_id)
        supabase
          .from('games')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .select('*, profiles!games_author_id_fkey(username, display_name, avatar_url), reviews(rating)' as any)
          .in('author_id', ids)
          .not('bundle_path', 'is', null)
          .order('created_at', { ascending: false })
          .limit(8)
          .then(({ data: gData }) => {
            if (!gData) return
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rows = (gData as any[]).map((g) => {
              const reviews = (g.reviews as { rating: number }[]) ?? []
              const avg = reviews.length ? reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / reviews.length : null
              return { ...g, avg_rating: avg, review_count: reviews.length }
            })
            setFollowingGames(rows as unknown as GameListItem[])
          })
      })
  }, [user])

  const tags = useMemo(() => {
    const all = games.flatMap((g) => g.tags)
    return [...new Set(all)].sort()
  }, [games])

  const isFiltering = !!search || tag !== 'All'

  const featured = games[0] ?? null

  const newReleases = useMemo(
    () =>
      [...games]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 8),
    [games]
  )

  const filtered = games
    .filter((g) => {
      const matchTag = tag === 'All' || g.tags.includes(tag)
      const matchSearch =
        !search ||
        g.title.toLowerCase().includes(search.toLowerCase()) ||
        g.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      return matchTag && matchSearch
    })
    .sort((a, b) =>
      sort === 'newest'
        ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        : b.plays - a.plays
    )

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-10">
      {/* Featured */}
      {featured && !isFiltering && (
        <div className="mb-10">
          <FeaturedBanner game={featured} />
        </div>
      )}

      {/* Continue Playing — only for logged-in users with history */}
      {!isFiltering && recentGames.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-text">Continue Playing</h2>
            <a
              href="https://account.cubeforge.dev/history"
              className="text-xs text-text-muted hover:text-accent transition-colors"
            >
              View history →
            </a>
          </div>
          <HorizontalScroll>
            {recentGames.map((r) =>
              r.games ? <MiniGameCard key={r.game_id} game={r.games} /> : null
            )}
          </HorizontalScroll>
        </section>
      )}

      {/* From people you follow */}
      {!isFiltering && followingGames.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-text">From people you follow</h2>
            <Link to="/browse" className="text-xs text-text-muted hover:text-accent transition-colors">
              Browse all →
            </Link>
          </div>
          <HorizontalScroll>
            {followingGames.map((game) => (
              <MiniGameCard key={game.id} game={game} />
            ))}
          </HorizontalScroll>
        </section>
      )}

      {/* New Releases */}
      {!isFiltering && !loading && newReleases.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-text">New Releases</h2>
            <Link
              to="/browse"
              className="text-xs text-text-muted hover:text-accent transition-colors"
            >
              See all →
            </Link>
          </div>
          <HorizontalScroll>
            {newReleases.map((game) => (
              <MiniGameCard key={game.id} game={game} />
            ))}
          </HorizontalScroll>
        </section>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <TagFilter tags={tags} active={tag} onChange={setTag} />
        <div className="flex-1 min-w-[160px] max-w-xs">
          <SearchBar value={search} onChange={setSearch} />
        </div>
        <SortToggle value={sort} onChange={setSort} />
      </div>

      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text">
          {tag === 'All' ? 'All Games' : tag}
        </h2>
        <span className="text-xs text-text-muted font-mono">
          {loading ? 'Loading…' : `${filtered.length} game${filtered.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-surface/50 overflow-hidden animate-pulse">
              <div className="w-full aspect-[16/10] bg-surface2" />
              <div className="p-3.5 space-y-2">
                <div className="h-3 bg-surface2 rounded w-3/4" />
                <div className="h-2.5 bg-surface2 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface2 flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <p className="text-sm text-text-dim mb-1">No games found</p>
          <p className="text-xs text-text-muted">Try a different search or filter</p>
        </div>
      )}

      {/* CTA */}
      <div className="mt-16 mb-8 text-center">
        <div className="inline-flex flex-col items-center rounded-2xl border border-border bg-surface/50 px-10 py-8">
          <h3 className="text-lg font-semibold text-text mb-2">Build your own game</h3>
          <p className="text-sm text-text-dim mb-5 max-w-sm">
            Use the drag-and-drop editor or write code with the CubeForge engine. Publish here for everyone to play.
          </p>
          <div className="flex items-center gap-3">
            <a
              href="https://editor.cubeforge.dev"
              className="rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-bg hover:bg-accent2 transition-colors"
            >
              Open Editor
            </a>
            <a
              href="https://docs.cubeforge.dev/guide/getting-started"
              className="rounded-xl border border-border px-6 py-2.5 text-sm font-medium text-text-dim hover:text-text hover:border-border2 transition-all"
            >
              Read Docs
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function SortToggle({
  value,
  onChange,
}: {
  value: SortKey
  onChange: (v: SortKey) => void
}) {
  return (
    <div className="flex rounded-xl overflow-hidden shrink-0" style={{ border: '1px solid var(--border)' }}>
      {(['popular', 'newest'] as const).map((key) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className="px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap"
          style={
            value === key
              ? { background: 'var(--surface2)', color: 'var(--text)' }
              : { background: 'var(--surface)', color: 'var(--text-muted)' }
          }
        >
          {key === 'popular' ? '🔥 Popular' : '✨ Newest'}
        </button>
      ))}
    </div>
  )
}

function HorizontalScroll({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:-mx-6 md:px-6"
      style={{ scrollbarWidth: 'none' }}
    >
      {children}
    </div>
  )
}

function MiniGameCard({ game }: { game: GameListItem }) {
  return (
    <Link
      to={`/game/${game.id}`}
      className="group flex-shrink-0 w-44 rounded-xl border border-border bg-surface/50 overflow-hidden hover:border-border2 hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-surface2">
        {game.thumbnail_url ? (
          <img
            src={game.thumbnail_url}
            alt={game.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-3xl font-bold font-mono opacity-15"
              style={{ color: 'var(--accent)' }}
            >
              {game.title[0]}
            </span>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-bg/50 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--bg)" stroke="none">
              <polygon points="6 3 20 12 6 21 6 3" />
            </svg>
          </div>
        </div>
      </div>
      <div className="p-2.5">
        <p className="text-xs font-medium text-text group-hover:text-accent transition-colors truncate">
          {game.title}
        </p>
        <p className="text-[10px] text-text-muted mt-0.5 truncate">
          {game.profiles?.display_name ?? game.profiles?.username ?? 'CubeForge'}
        </p>
      </div>
    </Link>
  )
}
