import { useState } from "react";
import { games } from "../data/games";
import { FeaturedBanner } from "../components/FeaturedBanner";
import { GameCard } from "../components/GameCard";
import { TagFilter } from "../components/TagFilter";
import { SearchBar } from "../components/SearchBar";

export function HomePage() {
  const [tag, setTag] = useState("All");
  const [search, setSearch] = useState("");

  const featured = games.find((g) => g.featured);

  const filtered = games.filter((g) => {
    const matchTag = tag === "All" || g.tags.includes(tag);
    const matchSearch =
      !search ||
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.author.toLowerCase().includes(search.toLowerCase()) ||
      g.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchTag && matchSearch;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-10">
      {/* Featured game */}
      {featured && !search && tag === "All" && (
        <div className="mb-10">
          <FeaturedBanner game={featured} />
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex-1 w-full md:w-auto">
          <TagFilter active={tag} onChange={setTag} />
        </div>
        <div className="w-full md:w-72">
          <SearchBar value={search} onChange={setSearch} />
        </div>
      </div>

      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text">
          {tag === "All" ? "All Games" : tag}
        </h2>
        <span className="text-xs text-text-muted font-mono">
          {filtered.length} game{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((game) => (
            <GameCard key={game.slug} game={game} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface2 flex items-center justify-center mb-4">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-text-muted"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <p className="text-sm text-text-dim mb-1">No games found</p>
          <p className="text-xs text-text-muted">
            Try a different search or filter
          </p>
        </div>
      )}

      {/* CTA */}
      <div className="mt-16 mb-8 text-center">
        <div className="inline-flex flex-col items-center rounded-2xl border border-border bg-surface/50 px-10 py-8">
          <h3 className="text-lg font-semibold text-text mb-2">
            Build your own game
          </h3>
          <p className="text-sm text-text-dim mb-5 max-w-sm">
            Use the drag-and-drop editor or write code with the CubeForge
            engine. Publish here for everyone to play.
          </p>
          <div className="flex items-center gap-3">
            <a
              href="https://editor.cubeforge.dev"
              className="rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-bg hover:bg-accent2 transition-colors"
            >
              Open Editor
            </a>
            <a
              href="https://docs.cubeforge.dev/guide/getting-started"
              className="rounded-xl border border-border px-6 py-2.5 text-sm font-medium text-text-dim hover:text-text hover:border-border2 transition-all"
            >
              Read Docs
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
