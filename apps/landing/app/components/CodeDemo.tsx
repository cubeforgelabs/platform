export function CodeDemo() {
  return (
    <section className="relative py-20 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="animate-fade-up text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
            Code that reads like a scene
          </h2>
          <p className="text-text-dim text-lg max-w-xl mx-auto">
            Entities are React components. Physics, sprites, and behavior
            compose naturally, just like building a UI.
          </p>
        </div>

        <div className="animate-fade-up delay-200 relative">
          {/* Editor window chrome */}
          <div className="code-block overflow-hidden glow">
            {/* Title bar */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-surface2/50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#f38ba8]/60" />
                <div className="w-3 h-3 rounded-full bg-[#f9e2af]/60" />
                <div className="w-3 h-3 rounded-full bg-[#a6e3a1]/60" />
              </div>
              <span className="ml-3 text-xs text-text-muted font-mono">
                Player.tsx
              </span>
            </div>

            {/* Code content */}
            <div className="p-6 overflow-x-auto">
              <pre className="text-[13px] leading-7">
                <Line n={1}>
                  <Kw>function</Kw> <Fn>Player</Fn>
                  {"({ "}
                  <Prop>x</Prop>, <Prop>y</Prop>
                  {" }) {"}
                </Line>
                <Line n={2}>
                  {"  "}
                  <Kw>return</Kw> {"("}
                </Line>
                <Line n={3}>
                  {"    "}<Tag>&lt;Entity</Tag> <Attr>id</Attr>=<Str>&quot;player&quot;</Str> <Attr>tags</Attr>={"{"}[<Str>&apos;player&apos;</Str>]{"}"}<Tag>&gt;</Tag>
                </Line>
                <Line n={4}>
                  {"      "}<Tag>&lt;Transform</Tag> <Attr>x</Attr>={"{"}x{"}"} <Attr>y</Attr>={"{"}y{"}"} <Tag>/&gt;</Tag>
                </Line>
                <Line n={5}>
                  {"      "}<Tag>&lt;Sprite</Tag> <Attr>width</Attr>={"{"}32{"}"} <Attr>height</Attr>={"{"}48{"}"} <Attr>color</Attr>=<Str>&quot;#4fc3f7&quot;</Str> <Tag>/&gt;</Tag>
                </Line>
                <Line n={6}>
                  {"      "}<Tag>&lt;RigidBody</Tag> <Tag>/&gt;</Tag>
                </Line>
                <Line n={7}>
                  {"      "}<Tag>&lt;BoxCollider</Tag> <Attr>width</Attr>={"{"}28{"}"} <Attr>height</Attr>={"{"}44{"}"} <Tag>/&gt;</Tag>
                </Line>
                <Line n={8}>
                  {"      "}<Tag>&lt;Script</Tag> <Attr>update</Attr>={"{"}movement{"}"} <Tag>/&gt;</Tag>
                </Line>
                <Line n={9}>
                  {"    "}<Tag>&lt;/Entity&gt;</Tag>
                </Line>
                <Line n={10}>{"  )"}</Line>
                <Line n={11}>{"}"}</Line>
              </pre>
            </div>
          </div>

          {/* Floating annotation cards */}
          <div className="hidden lg:block absolute -right-4 top-24 animate-float">
            <AnnotationCard
              icon="⚡"
              title="Impulse Physics"
              desc="Full constraint solver with contacts, friction, and CCD"
            />
          </div>
          <div className="hidden lg:block absolute -left-4 top-56 animate-float delay-500">
            <AnnotationCard
              icon="🎮"
              title="Script System"
              desc="init + update per frame, access to input and ECS"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Line({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex">
      <span className="w-8 text-right mr-6 text-text-muted select-none shrink-0">
        {n}
      </span>
      <span className="text-text">{children}</span>
    </div>
  );
}

function Kw({ children }: { children: React.ReactNode }) {
  return <span className="text-syntax-kw">{children}</span>;
}
function Fn({ children }: { children: React.ReactNode }) {
  return <span className="text-syntax-fn">{children}</span>;
}
function Tag({ children }: { children: React.ReactNode }) {
  return <span className="text-syntax-tag">{children}</span>;
}
function Attr({ children }: { children: React.ReactNode }) {
  return <span className="text-syntax-attr">{children}</span>;
}
function Str({ children }: { children: React.ReactNode }) {
  return <span className="text-syntax-str">{children}</span>;
}
function Prop({ children }: { children: React.ReactNode }) {
  return <span className="text-syntax-attr">{children}</span>;
}

function AnnotationCard({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface/90 backdrop-blur-sm px-4 py-3 shadow-lg max-w-[220px]">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">{icon}</span>
        <span className="text-xs font-semibold text-text">{title}</span>
      </div>
      <p className="text-xs text-text-dim leading-relaxed">{desc}</p>
    </div>
  );
}
