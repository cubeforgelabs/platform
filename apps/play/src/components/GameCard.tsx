import { Link } from "react-router-dom";
import type { Game } from "../data/games";

export function GameCard({ game }: { game: Game }) {
  return (
    <Link
      to={`/game/${game.slug}`}
      className="group rounded-xl border border-border bg-surface/50 overflow-hidden hover:border-border2 hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Thumbnail */}
      <div
        className="relative w-full aspect-[16/10] flex items-center justify-center"
        style={{ background: `${game.color}10` }}
      >
        <span
          className="text-5xl font-bold font-mono opacity-15 group-hover:opacity-25 transition-opacity"
          style={{ color: game.color }}
        >
          {game.title[0]}
        </span>

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-bg/60 opacity-0 group-hover:opacity-100 transition-opacity">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-full"
            style={{ background: game.color }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="var(--bg)"
              stroke="none"
            >
              <polygon points="6 3 20 12 6 21 6 3" />
            </svg>
          </div>
        </div>

        {/* Play count badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-bg/70 backdrop-blur-sm px-2 py-0.5">
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-text-muted"
          >
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          <span className="text-[10px] text-text-muted font-mono">
            {formatPlays(game.plays)}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-sm text-text group-hover:text-accent transition-colors truncate">
            {game.title}
          </h3>
          <div className="flex items-center gap-0.5 shrink-0">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="var(--warn)"
              stroke="none"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span className="text-[10px] text-text-dim font-mono">
              {game.rating.toFixed(1)}
            </span>
          </div>
        </div>
        <p className="text-xs text-text-dim mb-2 truncate">{game.author}</p>
        <div className="flex flex-wrap gap-1">
          {game.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-mono text-text-muted border border-border rounded px-1.5 py-0.5"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

function formatPlays(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
