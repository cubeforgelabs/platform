"use client";

import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

interface Release {
  tag_name: string;
  name: string;
  body: string;
  published_at: string;
  html_url: string;
  prerelease: boolean;
  draft: boolean;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ReleasesPage() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(
      "https://api.github.com/repos/1homsi/cubeforge/releases?per_page=50",
    )
      .then((res) => {
        if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);
        return res.json();
      })
      .then((data: Release[]) => {
        setReleases(data.filter((r) => !r.draft));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <main className="bg-grid min-h-screen overflow-x-hidden relative">
      <div className="relative z-10">
        <Navbar />

        <section className="pt-32 pb-20 md:pt-40 md:pb-32">
          <div className="mx-auto max-w-3xl px-6">
            <h1 className="text-4xl md:text-5xl font-bold text-text mb-4">
              Releases
            </h1>
            <p className="text-text-dim text-lg mb-12">
              Every version of CubeForge, straight from GitHub.
            </p>

            {loading && (
              <div className="flex items-center gap-3 text-text-dim">
                <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                <span className="text-sm">Loading releases...</span>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                <p className="text-sm text-red-400">
                  Failed to load releases: {error}
                </p>
                <a
                  href="https://github.com/1homsi/cubeforge/releases"
                  className="text-sm text-accent hover:text-accent2 mt-2 inline-block"
                >
                  View on GitHub instead
                </a>
              </div>
            )}

            <div className="space-y-6">
              {releases.map((release, i) => (
                <article
                  key={release.tag_name}
                  className="group rounded-xl border border-border bg-surface/80 backdrop-blur-sm p-6 hover:border-border2 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-semibold text-accent">
                        {release.tag_name}
                      </span>
                      {i === 0 && (
                        <span className="text-[10px] font-mono bg-accent/10 text-accent border border-accent/20 rounded-full px-2 py-0.5">
                          latest
                        </span>
                      )}
                      {release.prerelease && (
                        <span className="text-[10px] font-mono bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full px-2 py-0.5">
                          pre-release
                        </span>
                      )}
                    </div>
                    <time className="text-xs text-text-muted shrink-0">
                      {formatDate(release.published_at)}
                    </time>
                  </div>

                  {release.name &&
                    release.name !== release.tag_name && (
                      <h2 className="text-base font-semibold text-text mb-3">
                        {release.name
                          .replace(release.tag_name, "")
                          .replace(/^[\s—–-]+/, "")
                          .trim()}
                      </h2>
                    )}

                  {release.body && (
                    <div className="release-body border-t border-border pt-3">
                      <Markdown
                        components={{
                          h1: ({ children }) => (
                            <h3 className="text-sm font-bold text-text mt-4 mb-2 first:mt-0">
                              {children}
                            </h3>
                          ),
                          h2: ({ children }) => (
                            <h3 className="text-sm font-bold text-text mt-4 mb-2 first:mt-0">
                              {children}
                            </h3>
                          ),
                          h3: ({ children }) => (
                            <h4 className="text-sm font-semibold text-text mt-3 mb-1.5">
                              {children}
                            </h4>
                          ),
                          p: ({ children }) => (
                            <p className="text-xs text-text-dim leading-relaxed mb-2">
                              {children}
                            </p>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-none space-y-0.5 mb-2">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal list-inside space-y-0.5 mb-2 text-xs text-text-dim">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li className="text-xs text-text-dim leading-relaxed ml-3 before:content-['•'] before:mr-2 before:text-text-muted">
                              {children}
                            </li>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold text-text">
                              {children}
                            </strong>
                          ),
                          em: ({ children }) => (
                            <em className="italic text-text-dim">{children}</em>
                          ),
                          code: ({ children }) => (
                            <code className="text-accent/80 bg-accent/10 rounded px-1 py-0.5 text-[11px] font-mono">
                              {children}
                            </code>
                          ),
                          pre: ({ children }) => (
                            <pre className="bg-bg/80 border border-border rounded-lg p-3 overflow-x-auto mb-2 text-[11px]">
                              {children}
                            </pre>
                          ),
                          a: ({ href, children }) => (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-accent hover:text-accent2 underline underline-offset-2"
                            >
                              {children}
                            </a>
                          ),
                          hr: () => (
                            <hr className="border-border my-3" />
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-2 border-accent/30 pl-3 text-xs text-text-muted italic mb-2">
                              {children}
                            </blockquote>
                          ),
                        }}
                      >
                        {release.body}
                      </Markdown>
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-border">
                    <a
                      href={release.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-text-muted hover:text-accent transition-colors inline-flex items-center gap-1.5"
                    >
                      View on GitHub
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                      </svg>
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </main>
  );
}
