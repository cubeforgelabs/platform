import { useState } from "react";
import { games } from "../data/games";
import { GameCard } from "../components/GameCard";
import { TagFilter } from "../components/TagFilter";
import { SearchBar } from "../components/SearchBar";

type SortKey = "popular" | "rating" | "newest";

export function BrowsePage() {
  const [tag, setTag] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("popular");

  const filtered = games
    .filter((g) => {
      const matchTag = tag === "All" || g.tags.includes(tag);
      const matchSearch =
        !search ||
        g.title.toLowerCase().includes(search.toLowerCase()) ||
        g.author.toLowerCase().includes(search.toLowerCase()) ||
        g.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      return matchTag && matchSearch;
    })
    .sort((a, b) => {
      if (sort === "popular") return b.plays - a.plays;
      if (sort === "rating") return b.rating - a.rating;
      return 0;
    });

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text mb-2">Browse Games</h1>
        <p className="text-sm text-text-dim">
          Discover games built with CubeForge by the community
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1 w-full md:w-auto">
            <TagFilter active={tag} onChange={setTag} />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-full md:w-64">
              <SearchBar value={search} onChange={setSearch} />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-xl border border-border bg-surface px-3 py-2.5 text-xs text-text-dim focus:outline-none focus:border-accent/40"
            >
              <option value="popular">Most Played</option>
              <option value="rating">Top Rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-text-muted font-mono">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((game) => (
            <GameCard key={game.slug} game={game} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-sm text-text-dim mb-1">No games found</p>
          <p className="text-xs text-text-muted">
            Try a different search or filter
          </p>
        </div>
      )}
    </div>
  );
}
