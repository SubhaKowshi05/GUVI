export default function TagFilter({ tags, activeTag, onChange }) {
  if (tags.length === 0) return null

  const chip = (active) =>
    `rounded-full border px-3 py-1 text-xs font-medium ${
      active
        ? 'border-amber-500 bg-amber-500 text-white'
        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
    }`

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2" role="group" aria-label="Filter by tag">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Tags</span>
      <button type="button" className={chip(activeTag === null)} onClick={() => onChange(null)}>
        All
      </button>
      {tags.map((t) => (
        <button
          key={t}
          type="button"
          className={chip(activeTag === t)}
          onClick={() => onChange(activeTag === t ? null : t)}
        >
          #{t}
        </button>
      ))}
    </div>
  )
}
