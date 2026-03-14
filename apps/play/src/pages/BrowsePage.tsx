import { useState, useEffect, useMemo } from 'react'
import { fetchGames, type GameListItem } from '../lib/api'
import { GameCard } from '../components/GameCard'
import { TagFilter } from '../components/TagFilter'
import { SearchBar } from '../components/SearchBar'

type SortKey = 'popular' | 'newest' | 'top-rated'

export function BrowsePage() {
  const [games, setGames] = useState<GameListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tag, setTag] = useState('All')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('popular')

  useEffect(() => {
    fetchGames().then((data) => {
      setGames(data)
      setLoading(false)
    })
  }, [])

  const tags = useMemo(() => {
    const all = games.flatMap((g) => g.tags)
    return [...new Set(all)].sort()
  }, [games])

  const filtered = games
    .filter((g) => {
      const matchTag = tag === 'All' || g.tags.includes(tag)
      const matchSearch =
        !search ||
        g.title.toLowerCase().includes(search.toLowerCase()) ||
        g.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      return matchTag && matchSearch
    })
    .sort((a, b) => {
      if (sort === 'popular') return b.plays - a.plays
      if (sort === 'top-rated') return (b.avg_rating ?? 0) - (a.avg_rating ?? 0)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text mb-2">Browse Games</h1>
        <p className="text-sm text-text-dim">Discover games built with CubeForge by the community</p>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1 w-full md:w-auto">
            <TagFilter tags={tags} active={tag} onChange={setTag} />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-full md:w-64">
              <SearchBar value={search} onChange={setSearch} />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-xl border border-border bg-surface px-3 py-2.5 text-xs text-text-dim focus:outline-none focus:border-accent/40"
            >
              <option value="popular">Most Played</option>
              <option value="newest">Newest</option>
              <option value="top-rated">Top Rated</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-text-muted font-mono">
          {loading ? 'Loading…' : `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
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
          <p className="text-sm text-text-dim mb-1">No games found</p>
          <p className="text-xs text-text-muted">Try a different search or filter</p>
        </div>
      )}
    </div>
  )
}
