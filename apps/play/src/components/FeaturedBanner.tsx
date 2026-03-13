import { Link } from 'react-router-dom'
import { type GameListItem, gameColor } from '../lib/api'

export function FeaturedBanner({ game }: { game: GameListItem }) {
  const color = gameColor(game)

  return (
    <Link
      to={`/game/${game.id}`}
      className="group relative rounded-2xl border border-border overflow-hidden block"
    >
      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${color}15, ${color}05)` }} />
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[120px] opacity-20" style={{ background: color }} />

      <div className="relative flex flex-col md:flex-row items-center gap-8 p-8 md:p-12">
        {/* Preview */}
        <div className="w-full md:w-80 aspect-[16/10] rounded-xl border border-border/50 overflow-hidden flex items-center justify-center shrink-0" style={{ background: `${color}08` }}>
          {game.thumbnail_url ? (
            <img src={game.thumbnail_url} alt={game.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-7xl font-bold font-mono opacity-15 group-hover:opacity-25 transition-opacity" style={{ color }}>
              {game.title[0]}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 mb-4">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="var(--accent)" stroke="none">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span className="text-[10px] font-semibold text-accent uppercase tracking-wider">Featured</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-text mb-2 group-hover:text-accent transition-colors">
            {game.title}
          </h2>
          <p className="text-sm text-text-dim mb-1">
            by {game.profiles?.display_name ?? game.profiles?.username ?? 'CubeForge'}
          </p>
          {game.description && (
            <p className="text-sm text-text-dim leading-relaxed mb-4 max-w-md">{game.description}</p>
          )}

          <div className="flex flex-wrap gap-1.5 justify-center md:justify-start mb-5">
            {game.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="text-[10px] font-mono text-accent/70 border border-accent/20 rounded px-2 py-0.5">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4 justify-center md:justify-start">
            <span className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-bg group-hover:opacity-90 transition-opacity" style={{ background: color }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <polygon points="6 3 20 12 6 21 6 3" />
              </svg>
              Play Now
            </span>
            <span className="flex items-center gap-1.5 text-xs text-text-muted">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              {game.plays.toLocaleString()} plays
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
