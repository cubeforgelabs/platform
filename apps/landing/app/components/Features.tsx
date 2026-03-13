const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    title: "60 Hz Fixed Timestep",
    description:
      "Deterministic physics with fixed-step integration. Same behavior at 30 FPS or 144 FPS. No frame-rate dependent bugs.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 3v18" />
      </svg>
    ),
    title: "ECS Architecture",
    description:
      "Archetype-based Entity Component System with cached queries and selective invalidation. Fast iteration over thousands of entities.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    title: "Impulse Physics",
    description:
      "Sequential impulse constraint solver with warm starting, Coulomb friction, CCD, joints, and contact manifolds. Rapier-grade quality.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: "10+ Collider Shapes",
    description:
      "Box, circle, capsule, convex polygon, triangle, segment, height field, half-space, and tri-mesh. Plus compound colliders.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
    title: "Zero Dependencies",
    description:
      "No Three.js, no Pixi, no Rapier WASM. Just React and a Canvas2D renderer. Under 60 KB gzipped total.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    title: "Plugin System",
    description:
      "Extend the engine with custom systems via definePlugin(). Register systems, hook lifecycle events, declare dependencies.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
    title: "Publish Anywhere",
    description:
      "Static HTML + JS output. Deploy to S3, Netlify, Vercel, or GitHub Pages. Share games with a URL.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    title: "Built for Learning",
    description:
      "Declarative API that reads like English. Perfect for kids and beginners. If you can build a React app, you can build a game.",
  },
];

export function Features() {
  return (
    <section className="relative py-20 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-16">
          <h2 className="animate-fade-up text-3xl md:text-4xl font-bold text-text mb-4">
            Everything you need
          </h2>
          <p className="animate-fade-up delay-100 text-text-dim text-lg max-w-xl mx-auto">
            A complete game engine in a single npm package. No configuration, no boilerplate.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={`animate-fade-up delay-${(i + 1) * 100} group rounded-xl border border-border bg-surface/80 backdrop-blur-sm p-6 hover:border-accent/30 hover:bg-surface transition-all duration-300`}
              style={{ animationDelay: `${(i + 1) * 80}ms` }}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10 text-accent mb-4 group-hover:bg-accent/20 transition-colors">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-text text-sm mb-2">
                {feature.title}
              </h3>
              <p className="text-xs text-text-dim leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
