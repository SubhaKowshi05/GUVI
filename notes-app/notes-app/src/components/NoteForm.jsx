import { useState } from 'react'

const EMPTY = { title: '', content: '', tagsText: '' }

function fromNote(note) {
  return note
    ? { title: note.title, content: note.content, tagsText: note.tags.join(', ') }
    : EMPTY
}

/**
 * Used for both creating and editing.
 * - collapsible: shows a "Take a note..." bar that expands on click (create mode)
 */
export default function NoteForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  collapsible = false,
}) {
  const [form, setForm] = useState(() => fromNote(initial))
  const [open, setOpen] = useState(!collapsible)
  const [error, setError] = useState('')

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    setError('')
  }

  const reset = () => {
    setForm(fromNote(initial))
    setError('')
    if (collapsible) setOpen(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim() && !form.content.trim()) {
      setError('Add a title or some content first.')
      return
    }
    onSubmit({ title: form.title, content: form.content, tags: form.tagsText })
    setForm(EMPTY)
    if (collapsible) setOpen(false)
  }

  const handleCancel = () => {
    reset()
    onCancel?.()
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-6 w-full max-w-xl rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-slate-500 shadow-sm hover:shadow"
      >
        Take a note...
      </button>
    )
  }

  const inputBase =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200'

  return (
    <form
      onSubmit={handleSubmit}
      className={`${collapsible ? 'mb-6 max-w-xl rounded-xl border border-slate-200 bg-white p-4 shadow' : ''} space-y-3`}
    >
      <input
        type="text"
        value={form.title}
        onChange={set('title')}
        placeholder="Title"
        aria-label="Note title"
        autoFocus
        className={`${inputBase} font-medium`}
      />
      <textarea
        value={form.content}
        onChange={set('content')}
        placeholder="Write your note..."
        aria-label="Note description"
        rows={5}
        className={`${inputBase} resize-y`}
      />
      <div>
        <input
          type="text"
          value={form.tagsText}
          onChange={set('tagsText')}
          placeholder="Tags, separated by commas (e.g. work, ideas)"
          aria-label="Tags"
          className={inputBase}
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={handleCancel}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
