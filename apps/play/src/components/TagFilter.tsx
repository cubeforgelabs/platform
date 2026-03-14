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
    <select
      value={active}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-xl border border-border bg-surface px-3 py-2.5 text-xs text-text-dim focus:outline-none focus:border-accent/40 min-w-[140px]"
    >
      <option value="All">All Games</option>
      {tags.map((tag) => (
        <option key={tag} value={tag}>{tag}</option>
      ))}
    </select>
  )
}
