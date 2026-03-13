export function GetStarted() {
  return (
    <section className="relative py-20 md:py-32">
      <div className="mx-auto max-w-4xl px-6">
        <div className="relative rounded-2xl border border-border bg-surface overflow-hidden">
          {/* Background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-accent/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative px-8 py-14 md:px-16 md:py-20 text-center">
            <h2 className="animate-fade-up text-3xl md:text-4xl font-bold text-text mb-4">
              Start building in seconds
            </h2>
            <p className="animate-fade-up delay-100 text-text-dim text-lg max-w-lg mx-auto mb-10">
              Use the drag-and-drop editor or scaffold with code. Hot reload,
              TypeScript, and a playable template out of the box.
            </p>

            {/* Steps */}
            <div className="animate-fade-up delay-200 flex flex-col md:flex-row items-stretch gap-4 mb-10 max-w-2xl mx-auto">
              <Step
                n={1}
                title="Create"
                code="npx create-cubeforge-game my-game"
              />
              <Step n={2} title="Develop" code="cd my-game && pnpm dev" />
              <Step n={3} title="Ship" code="pnpm build && deploy" />
            </div>

            <div className="animate-fade-up delay-300 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://editor.cubeforge.dev"
                className="rounded-xl bg-accent px-7 py-3.5 text-sm font-semibold text-bg hover:bg-accent2 transition-colors"
              >
                Open the Editor
              </a>
              <a
                href="https://cubeforge.dev/docs/getting-started"
                className="rounded-xl border border-border px-7 py-3.5 text-sm font-medium text-text-dim hover:text-text hover:border-border2 transition-all"
              >
                Getting Started Guide
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Step({
  n,
  title,
  code,
}: {
  n: number;
  title: string;
  code: string;
}) {
  return (
    <div className="flex-1 rounded-xl border border-border bg-bg p-5 text-left">
      <div className="flex items-center gap-2 mb-3">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold font-mono">
          {n}
        </span>
        <span className="text-sm font-semibold text-text">{title}</span>
      </div>
      <code className="block text-xs font-mono text-text-dim bg-surface rounded-lg px-3 py-2 overflow-x-auto">
        {code}
      </code>
    </div>
  );
}
