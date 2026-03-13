import { VersionBadge } from "./VersionBadge";

export function Hero({ version, title }: { version: string; title: string }) {
  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-32">
      {/* Background gradient orbs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute top-40 right-1/4 w-72 h-72 bg-accent2/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-4xl px-6 text-center">
        {/* Badge - fetches latest version client-side on every load */}
        <VersionBadge fallbackVersion={version} fallbackTitle={title} />

        {/* Main heading */}
        <h1 className="animate-fade-up delay-100 text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
          <span className="text-text">Build games with</span>
          <br />
          <span className="text-accent glow-text">React</span>
        </h1>

        {/* Subtitle */}
        <p className="animate-fade-up delay-200 text-lg md:text-xl text-text-dim max-w-2xl mx-auto mb-10 leading-relaxed">
          A 2D game engine that feels like building a website. Drag-and-drop
          in the editor or write real TypeScript, then publish to the web
          and share with the world.
        </p>

        {/* CTA buttons */}
        <div className="animate-fade-up delay-300 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://editor.cubeforge.dev"
            className="group relative flex items-center gap-2.5 rounded-xl bg-accent px-7 py-3.5 text-sm font-semibold text-bg hover:bg-accent2 transition-all animate-pulse-glow"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Start Building
          </a>
          <a
            href="https://play.cubeforge.dev"
            className="flex items-center gap-2 rounded-xl border border-border bg-surface/60 backdrop-blur-sm px-7 py-3.5 text-sm font-medium text-text-dim hover:text-text hover:border-border2 transition-all"
          >
            Browse Games
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

        {/* Install command */}
        <div className="animate-fade-up delay-400 mt-10 inline-flex items-center gap-3 rounded-lg border border-border bg-surface/90 backdrop-blur-sm px-5 py-2.5">
          <span className="text-text-muted font-mono text-sm">$</span>
          <code className="font-mono text-sm text-text">
            npx create-cubeforge-game my-game
          </code>
          <button
            className="text-text-muted hover:text-accent transition-colors"
            title="Copy"
          >
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
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
