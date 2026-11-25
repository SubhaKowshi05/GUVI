import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'notes-app:v1'

const NotesContext = createContext(null)

function loadNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function makeId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function normalizeTags(tags) {
  const list = Array.isArray(tags) ? tags : String(tags || '').split(',')
  const seen = new Set()
  const out = []
  for (const t of list) {
    const clean = String(t).trim().replace(/^#+/, '').toLowerCase()
    if (clean && !seen.has(clean)) {
      seen.add(clean)
      out.push(clean)
    }
  }
  return out
}

/**
 * Note shape:
 * { id, title, content, tags: string[], pinned: boolean,
 *   status: 'active' | 'archived' | 'trashed', createdAt, updatedAt }
 */
export function NotesProvider({ children }) {
  const [notes, setNotes] = useState(loadNotes)
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState(null)

  // Persist every change to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
    } catch {
      // storage full or unavailable: the app still works for this session
    }
  }, [notes])

  const patch = useCallback((id, changes) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...changes, updatedAt: Date.now() } : n)),
    )
  }, [])

  const addNote = useCallback(({ title, content, tags }) => {
    const now = Date.now()
    const note = {
      id: makeId(),
      title: title.trim(),
      content: content.trim(),
      tags: normalizeTags(tags),
      pinned: false,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    }
    setNotes((prev) => [note, ...prev])
  }, [])

  const updateNote = useCallback(
    (id, { title, content, tags }) =>
      patch(id, { title: title.trim(), content: content.trim(), tags: normalizeTags(tags) }),
    [patch],
  )

  const togglePin = useCallback(
    (id) =>
      setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned, updatedAt: Date.now() } : n)),
      ),
    [],
  )

  // Archiving or trashing also unpins; restoring returns the note to the main list
  const archiveNote = useCallback((id) => patch(id, { status: 'archived', pinned: false }), [patch])
  const unarchiveNote = useCallback((id) => patch(id, { status: 'active' }), [patch])
  const trashNote = useCallback((id) => patch(id, { status: 'trashed', pinned: false }), [patch])
  const restoreNote = useCallback((id) => patch(id, { status: 'active' }), [patch])

  const deleteForever = useCallback(
    (id) => setNotes((prev) => prev.filter((n) => n.id !== id)),
    [],
  )
  const emptyTrash = useCallback(
    () => setNotes((prev) => prev.filter((n) => n.status !== 'trashed')),
    [],
  )

  const value = useMemo(
    () => ({
      notes,
      query,
      setQuery,
      activeTag,
      setActiveTag,
      addNote,
      updateNote,
      togglePin,
      archiveNote,
      unarchiveNote,
      trashNote,
      restoreNote,
      deleteForever,
      emptyTrash,
    }),
    [
      notes,
      query,
      activeTag,
      addNote,
      updateNote,
      togglePin,
      archiveNote,
      unarchiveNote,
      trashNote,
      restoreNote,
      deleteForever,
      emptyTrash,
    ],
  )

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>
}

export function useNotes() {
  const ctx = useContext(NotesContext)
  if (!ctx) throw new Error('useNotes must be used inside <NotesProvider>')
  return ctx
}
