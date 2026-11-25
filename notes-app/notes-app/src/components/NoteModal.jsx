import { useEffect, useState } from 'react'
import Icon from './Icon.jsx'
import NoteForm from './NoteForm.jsx'
import { useNotes } from '../context/NotesContext.jsx'

export default function NoteModal({ note, onClose }) {
  const {
    updateNote,
    togglePin,
    archiveNote,
    unarchiveNote,
    trashNote,
    restoreNote,
    deleteForever,
  } = useNotes()
  const [editing, setEditing] = useState(false)

  // Close on Escape and lock page scroll while the modal is open
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  const act = (fn) => () => {
    fn(note.id)
    onClose()
  }

  const handleDeleteForever = () => {
    if (window.confirm('Delete this note permanently? This cannot be undone.')) {
      deleteForever(note.id)
      onClose()
    }
  }

  const btn =
    'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100'

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Note details"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-4">
          <h2 className="min-w-0 break-words text-lg font-semibold">
            {editing ? 'Edit note' : note.title || <span className="text-slate-400">Untitled</span>}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100"
          >
            <Icon name="close" />
          </button>
        </div>

        <div className="overflow-y-auto p-4">
          {editing ? (
            <NoteForm
              initial={note}
              submitLabel="Save changes"
              onSubmit={(data) => {
                updateNote(note.id, data)
                setEditing(false)
              }}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <>
              {note.content ? (
                <p className="whitespace-pre-wrap break-words text-slate-700">{note.content}</p>
              ) : (
                <p className="text-slate-400">No content.</p>
              )}
              {note.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {note.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
              <p className="mt-4 text-xs text-slate-400">
                Created {new Date(note.createdAt).toLocaleString()} · Updated{' '}
                {new Date(note.updatedAt).toLocaleString()}
              </p>
            </>
          )}
        </div>

        {!editing && (
          <div className="flex flex-wrap gap-1 border-t border-slate-100 p-3">
            {note.status !== 'trashed' && (
              <button type="button" className={btn} onClick={() => setEditing(true)}>
                <Icon name="edit" className="h-4 w-4" /> Edit
              </button>
            )}
            {note.status === 'active' && (
              <>
                <button type="button" className={btn} onClick={() => togglePin(note.id)}>
                  <Icon name="pin" className="h-4 w-4" filled={note.pinned} />
                  {note.pinned ? 'Unpin' : 'Pin'}
                </button>
                <button type="button" className={btn} onClick={act(archiveNote)}>
                  <Icon name="archive" className="h-4 w-4" /> Archive
                </button>
              </>
            )}
            {note.status === 'archived' && (
              <button type="button" className={btn} onClick={act(unarchiveNote)}>
                <Icon name="restore" className="h-4 w-4" /> Unarchive
              </button>
            )}
            {note.status !== 'trashed' && (
              <button type="button" className={btn} onClick={act(trashNote)}>
                <Icon name="trash" className="h-4 w-4" /> Trash
              </button>
            )}
            {note.status === 'trashed' && (
              <>
                <button type="button" className={btn} onClick={act(restoreNote)}>
                  <Icon name="restore" className="h-4 w-4" /> Restore
                </button>
                <button
                  type="button"
                  className={`${btn} text-red-600 hover:bg-red-50`}
                  onClick={handleDeleteForever}
                >
                  <Icon name="close" className="h-4 w-4" /> Delete permanently
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
