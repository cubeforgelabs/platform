import { Outlet, Link, useLocation } from "react-router-dom";

export function Layout() {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="sticky top-0 z-50 border-b border-border bg-bg/90 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="flex items-center gap-2 font-mono font-semibold text-sm text-text tracking-wide"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent/10 border border-accent/20">
                <span className="text-accent font-mono font-bold text-xs">
                  C
                </span>
              </div>
              play
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <NavLink to="/" active={pathname === "/"}>
                Home
              </NavLink>
              <NavLink
                to="/browse"
                active={pathname === "/browse"}
              >
                Browse
              </NavLink>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://editor.cubeforge.dev"
              className="text-xs text-text-dim hover:text-text transition-colors hidden sm:block"
            >
              Make a Game
            </a>
            <button className="rounded-lg bg-accent px-4 py-1.5 text-xs font-semibold text-bg hover:bg-accent2 transition-colors">
              Sign In
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} CubeForge. Open source under MIT.
          </p>
          <div className="flex items-center gap-6 text-xs text-text-muted">
            <a
              href="https://cubeforge.dev"
              className="hover:text-text-dim transition-colors"
            >
              cubeforge.dev
            </a>
            <a
              href="https://docs.cubeforge.dev"
              className="hover:text-text-dim transition-colors"
            >
              Docs
            </a>
            <a
              href="https://github.com/1homsi/cubeforge"
              className="hover:text-text-dim transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavLink({
  to,
  active,
  children,
}: {
  to: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "bg-surface2 text-text"
          : "text-text-dim hover:text-text hover:bg-surface"
      }`}
    >
      {children}
    </Link>
  );
}
