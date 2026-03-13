const examples = [
  {
    title: "Platformer",
    description: "Full platformer with enemies, coins, and coyote-time jumps",
    tags: ["physics", "animation", "input"],
    color: "#4fc3f7",
  },
  {
    title: "Mario Clone",
    description: "Multi-level recreation with power-ups and enemy AI",
    tags: ["physics", "state", "sprites"],
    color: "#f38ba8",
  },
  {
    title: "Top-Down RPG",
    description: "WASD movement with collision, enemies, and key pickups",
    tags: ["top-down", "triggers", "camera"],
    color: "#a6e3a1",
  },
  {
    title: "Endless Runner",
    description: "Auto-scrolling obstacle course with score tracking",
    tags: ["physics", "spawning", "lockX"],
    color: "#f9e2af",
  },
  {
    title: "Breakout",
    description: "Classic brick-breaker with paddle, ball, and power-ups",
    tags: ["script", "collision", "particles"],
    color: "#cba6f7",
  },
  {
    title: "Flappy Bird",
    description: "Tap-to-fly through pipes with score and restart",
    tags: ["script", "spawning", "input"],
    color: "#fab387",
  },
];

export function Examples() {
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
          {examples.map((example, i) => (
            <a
              key={example.title}
              href={`https://play.cubeforge.dev/${example.title.toLowerCase().replace(/\s+/g, "-")}`}
              className="animate-fade-up group rounded-xl border border-border bg-surface/80 backdrop-blur-sm p-6 hover:border-border2 hover:-translate-y-0.5 transition-all duration-200"
              style={{ animationDelay: `${(i + 1) * 80}ms` }}
            >
              {/* Preview placeholder */}
              <div
                className="w-full h-32 rounded-lg mb-4 flex items-center justify-center border border-border/50"
                style={{ background: `${example.color}08` }}
              >
                <span
                  className="text-2xl font-bold font-mono opacity-20"
                  style={{ color: example.color }}
                >
                  {example.title[0]}
                </span>
              </div>

              <h3 className="font-semibold text-text text-sm mb-1.5 group-hover:text-accent transition-colors">
                {example.title}
              </h3>
              <p className="text-xs text-text-dim leading-relaxed mb-3">
                {example.description}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {example.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-mono text-accent/70 border border-accent/20 rounded px-1.5 py-0.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </a>
          ))}
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
  );
}
