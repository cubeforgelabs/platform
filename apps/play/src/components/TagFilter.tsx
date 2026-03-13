export function TagFilter({
  tags,
  active,
  onChange,
}: {
  tags: string[]
  active: string
  onChange: (tag: string) => void
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      {['All', ...tags].map((tag) => (
        <button
          key={tag}
          onClick={() => onChange(tag)}
          className={`shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
            active === tag
              ? 'bg-accent text-bg'
              : 'bg-surface border border-border text-text-dim hover:text-text hover:border-border2'
          }`}
        >
          {tag === 'All' ? 'All Games' : tag}
        </button>
      ))}
    </div>
  )
}
