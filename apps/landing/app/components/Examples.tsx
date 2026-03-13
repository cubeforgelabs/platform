export interface GameEntry {
  id: string
  title: string
  description: string | null
  tags: string[]
  thumbnail_url: string | null
  slug: string | null
}

const ACCENT_COLORS = ['#4fc3f7', '#f38ba8', '#a6e3a1', '#f9e2af', '#cba6f7', '#fab387']

export function Examples({ games }: { games: GameEntry[] }) {
  return (
    <section className="relative py-20 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-16">
          <h2 className="animate-fade-up text-3xl md:text-4xl font-bold text-text mb-4">
            Play, remix, publish
          </h2>
          <p className="animate-fade-up delay-100 text-text-dim text-lg max-w-xl mx-auto">
            Browse games built with CubeForge. Play in the browser, remix the
            source, or publish your own to the community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((game, i) => {
            const color = ACCENT_COLORS[i % ACCENT_COLORS.length]
            const href = game.slug
              ? `https://play.cubeforge.dev/games/${game.slug}`
              : `https://play.cubeforge.dev`
            return (
              <a
                key={game.id}
                href={href}
                className="animate-fade-up group rounded-xl border border-border bg-surface/80 backdrop-blur-sm p-6 hover:border-border2 hover:-translate-y-0.5 transition-all duration-200"
                style={{ animationDelay: `${(i + 1) * 80}ms` }}
              >
                {/* Preview */}
                <div
                  className="w-full h-32 rounded-lg mb-4 overflow-hidden border border-border/50"
                  style={{ background: `${color}08` }}
                >
                  {game.thumbnail_url ? (
                    <img
                      src={game.thumbnail_url}
                      alt={game.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span
                        className="text-2xl font-bold font-mono opacity-20"
                        style={{ color }}
                      >
                        {game.title[0]}
                      </span>
                    </div>
                  )}
                </div>

                <h3 className="font-semibold text-text text-sm mb-1.5 group-hover:text-accent transition-colors">
                  {game.title}
                </h3>
                {game.description && (
                  <p className="text-xs text-text-dim leading-relaxed mb-3">
                    {game.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {game.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono text-accent/70 border border-accent/20 rounded px-1.5 py-0.5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </a>
            )
          })}
        </div>

        <div className="text-center mt-10">
          <a
            href="https://play.cubeforge.dev"
            className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent2 transition-colors font-medium"
          >
            Browse all games
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
