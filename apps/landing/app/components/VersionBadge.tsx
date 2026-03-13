"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function VersionBadge({
  fallbackVersion,
  fallbackTitle,
}: {
  fallbackVersion: string;
  fallbackTitle: string;
}) {
  const [version, setVersion] = useState(fallbackVersion);
  const [title, setTitle] = useState(fallbackTitle);

  useEffect(() => {
    fetch("https://api.github.com/repos/1homsi/cubeforge/releases/latest")
      .then((res) => {
        if (!res.ok) return;
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        const v = data.tag_name ?? fallbackVersion;
        const t = (data.name ?? "")
          .replace(v, "")
          .replace(/^[\s—–-]+/, "")
          .trim();
        setVersion(v);
        setTitle(t);
      })
      .catch(() => {});
  }, [fallbackVersion]);

  return (
    <Link
      href="/releases"
      className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 backdrop-blur-sm px-4 py-1.5 mb-8 hover:border-border2 transition-colors"
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-ok" />
      </span>
      <span className="text-xs font-mono text-text-dim tracking-wide">
        {version}
        {title ? ` - ${title}` : ""}
      </span>
    </Link>
  );
}
