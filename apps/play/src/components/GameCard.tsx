import { Link } from 'react-router-dom'
import { type GameListItem, gameColor } from '../lib/api'

export function GameCard({ game }: { game: GameListItem }) {
  const color = gameColor(game)

  return (
    <Link
      to={`/game/${game.id}`}
      className="group rounded-xl border border-border bg-surface/50 overflow-hidden hover:border-border2 hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-[16/10] flex items-center justify-center overflow-hidden" style={{ background: `${color}10` }}>
        {game.thumbnail_url ? (
          <img src={game.thumbnail_url} alt={game.title} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <span className="text-5xl font-bold font-mono opacity-15 group-hover:opacity-25 transition-opacity" style={{ color }}>
            {game.title[0]}
          </span>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-bg/60 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-center w-12 h-12 rounded-full" style={{ background: color }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--bg)" stroke="none">
              <polygon points="6 3 20 12 6 21 6 3" />
            </svg>
          </div>
        </div>

        {/* Badges */}
        {game.is_official && (
          <div className="absolute top-2 left-2">
            <span className="text-[9px] font-bold uppercase tracking-wider rounded px-1.5 py-0.5" style={{ background: 'rgba(79,195,247,0.15)', color: '#4fc3f7', border: '1px solid rgba(79,195,247,0.25)' }}>
              Official
            </span>
          </div>
        )}

        {/* Play count */}
        <div className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-bg/70 backdrop-blur-sm px-2 py-0.5">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          <span className="text-[10px] text-text-muted font-mono">{formatPlays(game.plays)}</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3.5">
        <h3 className="font-semibold text-sm text-text group-hover:text-accent transition-colors truncate mb-1">
          {game.title}
        </h3>
        <p className="text-xs text-text-muted mb-2 truncate">
          {game.profiles?.display_name ?? game.profiles?.username ?? 'CubeForge'}
        </p>
        <div className="flex flex-wrap gap-1">
          {game.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] font-mono text-text-muted border border-border rounded px-1.5 py-0.5">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}

function formatPlays(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}
