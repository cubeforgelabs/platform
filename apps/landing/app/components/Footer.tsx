export function Footer() {
  return (
    <footer className="relative border-t border-border bg-bg/90 backdrop-blur-sm py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-text font-bold text-lg mb-3"
            >
              <span className="text-accent font-mono">▣</span> CubeForge
            </a>
            <p className="text-xs text-text-dim leading-relaxed max-w-[200px]">
              A 2D game engine for the web. Build browser games with React
              components.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-semibold text-text uppercase tracking-wider mb-4">
              Product
            </h4>
            <ul className="space-y-2.5">
              <FooterLink href="https://editor.cubeforge.dev">
                Editor
              </FooterLink>
              <FooterLink href="https://play.cubeforge.dev">
                Play
              </FooterLink>
              <FooterLink href="https://docs.cubeforge.dev">
                Documentation
              </FooterLink>
              <FooterLink href="https://www.npmjs.com/package/cubeforge">
                npm Package
              </FooterLink>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-semibold text-text uppercase tracking-wider mb-4">
              Resources
            </h4>
            <ul className="space-y-2.5">
              <FooterLink href="https://docs.cubeforge.dev/guide/getting-started">
                Getting Started
              </FooterLink>
              <FooterLink href="https://docs.cubeforge.dev/guide/physics">
                Physics Guide
              </FooterLink>
              <FooterLink href="https://docs.cubeforge.dev/api">
                API Reference
              </FooterLink>
              <FooterLink href="https://play.cubeforge.dev">
                Browse Games
              </FooterLink>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-xs font-semibold text-text uppercase tracking-wider mb-4">
              Community
            </h4>
            <ul className="space-y-2.5">
              <FooterLink href="https://github.com/1homsi/cubeforge">
                GitHub
              </FooterLink>
              <FooterLink href="https://github.com/1homsi/cubeforge/issues">
                Issues
              </FooterLink>
              <FooterLink href="/releases">
                Releases
              </FooterLink>
              <FooterLink href="https://github.com/1homsi/cubeforge/blob/main/LICENSE">
                License (MIT)
              </FooterLink>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-border">
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} CubeForge. Open source under MIT.
          </p>
          <div className="flex items-center gap-5">
            {/* GitHub */}
            <a
              href="https://github.com/1homsi/cubeforge"
              className="text-text-muted hover:text-text transition-colors"
              aria-label="GitHub"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            {/* npm */}
            <a
              href="https://www.npmjs.com/package/cubeforge"
              className="text-text-muted hover:text-text transition-colors"
              aria-label="npm"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H5.113z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <a
        href={href}
        className="text-xs text-text-dim hover:text-text transition-colors"
      >
        {children}
      </a>
    </li>
  );
}
