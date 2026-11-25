import Icon from './Icon.jsx'
import { useNotes } from '../context/NotesContext.jsx'

function IconButton({ label, onClick, children, className = '' }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={`rounded-full p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800 ${className}`}
    >
      {children}
    </button>
  )
}

export default function NoteCard({ note, onOpen }) {
  const { togglePin, archiveNote, unarchiveNote, trashNote, restoreNote, deleteForever } =
    useNotes()

  const handleDeleteForever = () => {
    if (window.confirm('Delete this note permanently? This cannot be undone.')) {
      deleteForever(note.id)
    }
  }

  return (
    <article
      onClick={() => onOpen(note.id)}
      className="group flex cursor-pointer flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-start gap-2">
        <h3 className="min-w-0 flex-1 break-words font-semibold">
          {note.title || <span className="text-slate-400">Untitled</span>}
        </h3>
        {note.status === 'active' && (
          <IconButton
            label={note.pinned ? 'Unpin note' : 'Pin note'}
            onClick={() => togglePin(note.id)}
            className={note.pinned ? 'text-amber-600' : ''}
          >
            <Icon name="pin" className="h-4 w-4" filled={note.pinned} />
          </IconButton>
        )}
      </div>

      {note.content && (
        <p className="mt-2 line-clamp-6 whitespace-pre-wrap break-words text-sm text-slate-600">
          {note.content}
        </p>
      )}

      {note.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {note.tags.map((t) => (
            <span key={t} className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
              #{t}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-xs text-slate-400">
          {new Date(note.updatedAt).toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
        <div className="flex gap-0.5 opacity-100 transition md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
          {note.status === 'active' && (
            <>
              <IconButton label="Archive note" onClick={() => archiveNote(note.id)}>
                <Icon name="archive" className="h-4 w-4" />
              </IconButton>
              <IconButton label="Move to trash" onClick={() => trashNote(note.id)}>
                <Icon name="trash" className="h-4 w-4" />
              </IconButton>
            </>
          )}
          {note.status === 'archived' && (
            <>
              <IconButton label="Unarchive note" onClick={() => unarchiveNote(note.id)}>
                <Icon name="restore" className="h-4 w-4" />
              </IconButton>
              <IconButton label="Move to trash" onClick={() => trashNote(note.id)}>
                <Icon name="trash" className="h-4 w-4" />
              </IconButton>
            </>
          )}
          {note.status === 'trashed' && (
            <>
              <IconButton label="Restore note" onClick={() => restoreNote(note.id)}>
                <Icon name="restore" className="h-4 w-4" />
              </IconButton>
              <IconButton label="Delete permanently" onClick={handleDeleteForever}>
                <Icon name="close" className="h-4 w-4" />
              </IconButton>
            </>
          )}
        </div>
      </div>
    </article>
  )
}
