import { useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import Icon from './Icon.jsx'
import { useNotes } from '../context/NotesContext.jsx'

const NAV = [
  { to: '/', label: 'Notes', icon: 'notes', end: true },
  { to: '/archive', label: 'Archive', icon: 'archive' },
  { to: '/trash', label: 'Trash', icon: 'trash' },
]

export default function Layout() {
  const { query, setQuery, setActiveTag, notes } = useNotes()
  const { pathname } = useLocation()

  // A tag filter from one page should not carry over to another
  useEffect(() => {
    setActiveTag(null)
  }, [pathname, setActiveTag])

  const count = (status) => notes.filter((n) => n.status === status).length
  const counts = { '/': count('active'), '/archive': count('archived'), '/trash': count('trashed') }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <h1 className="text-xl font-semibold text-amber-600">Notes</h1>
          <div className="relative flex-1 sm:max-w-xl">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Icon name="search" className="h-4 w-4" />
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, content or tag"
              aria-label="Search notes"
              className="w-full rounded-lg border border-slate-200 bg-slate-100 py-2 pl-9 pr-3 text-sm outline-none focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-200"
            />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:flex-row md:gap-6">
        <nav className="flex gap-2 md:w-48 md:shrink-0 md:flex-col" aria-label="Sections">
          {NAV.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-1 items-center justify-center gap-3 rounded-lg px-3 py-2 text-sm font-medium md:flex-none md:justify-start ${
                  isActive
                    ? 'bg-amber-100 text-amber-800'
                    : 'text-slate-600 hover:bg-slate-200'
                }`
              }
            >
              <Icon name={icon} className="h-5 w-5" />
              <span>{label}</span>
              <span className="ml-auto hidden text-xs text-slate-400 md:inline">{counts[to]}</span>
            </NavLink>
          ))}
        </nav>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
