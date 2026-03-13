import { useParams, Link } from "react-router-dom";
import { games } from "../data/games";

export function GamePage() {
  const { slug } = useParams();
  const game = games.find((g) => g.slug === slug);

  if (!game) {
    return (
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-text mb-4">Game not found</h1>
        <Link to="/" className="text-sm text-accent hover:text-accent2">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-text-muted mb-6">
        <Link to="/" className="hover:text-text-dim transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link to="/browse" className="hover:text-text-dim transition-colors">
          Browse
        </Link>
        <span>/</span>
        <span className="text-text-dim">{game.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        {/* Main content */}
        <div>
          {/* Game embed area */}
          <div
            className="w-full aspect-[16/10] rounded-2xl border border-border flex items-center justify-center mb-6 relative overflow-hidden"
            style={{ background: `${game.color}08` }}
          >
            <div className="flex flex-col items-center gap-4">
              <span
                className="text-8xl font-bold font-mono opacity-10"
                style={{ color: game.color }}
              >
                {game.title[0]}
              </span>
              <button
                className="flex items-center gap-2.5 rounded-xl px-8 py-3 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
                style={{ background: game.color }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  stroke="none"
                >
                  <polygon points="6 3 20 12 6 21 6 3" />
                </svg>
                Play Game
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-xl border border-border bg-surface/50 p-6 mb-6">
            <h2 className="text-sm font-semibold text-text mb-3">About</h2>
            <p className="text-sm text-text-dim leading-relaxed">
              {game.description}
            </p>
          </div>

          {/* Comments placeholder */}
          <div className="rounded-xl border border-border bg-surface/50 p-6">
            <h2 className="text-sm font-semibold text-text mb-4">
              Comments
            </h2>
            <div className="flex flex-col items-center py-8 text-center">
              <p className="text-xs text-text-muted mb-2">
                No comments yet
              </p>
              <button className="text-xs text-accent hover:text-accent2 transition-colors">
                Sign in to leave a comment
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Info card */}
          <div className="rounded-xl border border-border bg-surface/50 p-5">
            <h1 className="text-xl font-bold text-text mb-1">{game.title}</h1>
            <p className="text-sm text-text-dim mb-4">by {game.author}</p>

            <div className="space-y-3 mb-5">
              <InfoRow label="Plays" value={game.plays.toLocaleString()} />
              <InfoRow
                label="Rating"
                value={
                  <span className="flex items-center gap-1">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="var(--warn)"
                      stroke="none"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    {game.rating.toFixed(1)}
                  </span>
                }
              />
              <InfoRow label="Engine" value="CubeForge" />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {game.tags.map((t) => (
                <Link
                  key={t}
                  to={`/browse?tag=${t}`}
                  className="text-[10px] font-mono text-accent/70 border border-accent/20 rounded px-2 py-0.5 hover:bg-accent/5 transition-colors"
                >
                  {t}
                </Link>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="rounded-xl border border-border bg-surface/50 p-5 space-y-2.5">
            <button className="w-full rounded-lg border border-border bg-surface2 px-4 py-2 text-xs font-medium text-text-dim hover:text-text hover:border-border2 transition-all flex items-center justify-center gap-2">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              Favorite
            </button>
            <button className="w-full rounded-lg border border-border bg-surface2 px-4 py-2 text-xs font-medium text-text-dim hover:text-text hover:border-border2 transition-all flex items-center justify-center gap-2">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              Share
            </button>
            <button className="w-full rounded-lg border border-border bg-surface2 px-4 py-2 text-xs font-medium text-text-dim hover:text-text hover:border-border2 transition-all flex items-center justify-center gap-2">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              View Source
            </button>
          </div>

          {/* More by author */}
          <div className="rounded-xl border border-border bg-surface/50 p-5">
            <h3 className="text-xs font-semibold text-text mb-3">
              More by {game.author}
            </h3>
            <div className="space-y-2">
              {games
                .filter(
                  (g) => g.author === game.author && g.slug !== game.slug,
                )
                .slice(0, 3)
                .map((g) => (
                  <Link
                    key={g.slug}
                    to={`/game/${g.slug}`}
                    className="flex items-center gap-3 rounded-lg p-2 -mx-2 hover:bg-surface2 transition-colors"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${g.color}15` }}
                    >
                      <span
                        className="text-sm font-bold font-mono opacity-40"
                        style={{ color: g.color }}
                      >
                        {g.title[0]}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-text truncate">
                        {g.title}
                      </p>
                      <p className="text-[10px] text-text-muted">
                        {g.plays.toLocaleString()} plays
                      </p>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-text-muted">{label}</span>
      <span className="text-text-dim font-medium">{value}</span>
    </div>
  );
}
