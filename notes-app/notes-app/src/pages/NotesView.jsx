import { useMemo, useState } from 'react'
import NoteCard from '../components/NoteCard.jsx'
import NoteForm from '../components/NoteForm.jsx'
import NoteModal from '../components/NoteModal.jsx'
import TagFilter from '../components/TagFilter.jsx'
import { useNotes } from '../context/NotesContext.jsx'

const COPY = {
  active: {
    title: 'Notes',
    empty: 'No notes yet. Use the box above to create your first one.',
  },
  archived: {
    title: 'Archive',
    empty: 'Nothing archived. Archived notes are kept here instead of being deleted.',
  },
  trashed: {
    title: 'Trash',
    empty: 'Trash is empty. Deleted notes can be restored from here.',
  },
}

const byNewest = (a, b) => b.updatedAt - a.updatedAt

function Grid({ notes, onOpen }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {notes.map((n) => (
        <NoteCard key={n.id} note={n} onOpen={onOpen} />
      ))}
    </div>
  )
}

export default function NotesView({ view }) {
  const { notes, query, activeTag, setActiveTag, addNote, emptyTrash } = useNotes()
  const [openId, setOpenId] = useState(null)

  // Notes belonging to this page (before search / tag filtering)
  const inView = useMemo(() => notes.filter((n) => n.status === view), [notes, view])

  const allTags = useMemo(
    () => [...new Set(inView.flatMap((n) => n.tags))].sort(),
    [inView],
  )

  // Ignore a stale tag filter if no note on this page has that tag any more
  const tag = activeTag && allTags.includes(activeTag) ? activeTag : null

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return inView
      .filter((n) => {
        if (tag && !n.tags.includes(tag)) return false
        if (!q) return true
        return (
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((t) => t.includes(q.replace(/^#/, '')))
        )
      })
      .sort(byNewest)
  }, [inView, query, tag])

  const pinned = view === 'active' ? visible.filter((n) => n.pinned) : []
  const others = view === 'active' ? visible.filter((n) => !n.pinned) : visible

  const openNote = openId ? notes.find((n) => n.id === openId) : null
  const filtering = Boolean(query.trim() || tag)

  const handleEmptyTrash = () => {
    if (window.confirm('Permanently delete everything in the trash? This cannot be undone.')) {
      emptyTrash()
    }
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{COPY[view].title}</h2>
        {view === 'trashed' && inView.length > 0 && (
          <button
            type="button"
            onClick={handleEmptyTrash}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Empty trash
          </button>
        )}
      </div>

      {view === 'active' && <NoteForm collapsible submitLabel="Add note" onSubmit={addNote} />}

      <TagFilter tags={allTags} activeTag={tag} onChange={setActiveTag} />

      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          {filtering && inView.length > 0 ? 'No notes match your search or tag.' : COPY[view].empty}
        </p>
      ) : (
        <div className="space-y-8">
          {pinned.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                Pinned
              </h3>
              <Grid notes={pinned} onOpen={setOpenId} />
            </div>
          )}
          {others.length > 0 && (
            <div>
              {pinned.length > 0 && (
                <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                  Others
                </h3>
              )}
              <Grid notes={others} onOpen={setOpenId} />
            </div>
          )}
        </div>
      )}

      {openNote && <NoteModal note={openNote} onClose={() => setOpenId(null)} />}
    </section>
  )
}
