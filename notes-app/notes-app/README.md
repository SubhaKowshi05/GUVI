# Notes App

A notes app built with React, Tailwind CSS and React Router. Notes are saved in the browser's `localStorage`, so there is no backend.

## Features

- Create, view, edit and delete notes (title, description, tags)
- Card layout, with a modal for the full note
- Search by title, content or tag
- Tags on every note, with a tag filter on each page
- Pin notes so they stay at the top
- Archive notes instead of deleting them
- Trash with restore, delete permanently and empty trash
- Separate pages: `/` (Notes), `/archive`, `/trash`

## Tech

React 19, Vite, Tailwind CSS v4, React Router, localStorage

## Run locally

Requires Node.js 18 or newer.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve the production build locally
```

## Project structure

```
src/
  main.jsx                 entry point (Router + NotesProvider)
  App.jsx                  routes
  index.css                Tailwind import
  context/NotesContext.jsx all note state, actions and localStorage persistence
  components/
    Layout.jsx             header, search bar, navigation
    NoteForm.jsx           create / edit form
    NoteCard.jsx           card with quick actions
    NoteModal.jsx          expanded view with edit, pin, archive, trash
    TagFilter.jsx          tag chips
    Icon.jsx               inline SVG icons
  pages/NotesView.jsx      one page component for Notes, Archive and Trash
```

## Data shape

Notes are stored under the `notes-app:v1` key:

```js
{
  id, title, content,
  tags: ['work', 'ideas'],
  pinned: false,
  status: 'active' | 'archived' | 'trashed',
  createdAt, updatedAt
}
```

## Deploy to Netlify

1. Push this project to GitHub.
2. In Netlify choose **Add new site → Import an existing project** and pick the repo.
3. Build command `npm run build`, publish directory `dist` (already set in `netlify.toml`).
4. Deploy. The redirect rule in `netlify.toml` and `public/_redirects` makes `/archive` and `/trash` work on refresh.

## Deploy to Render (alternative)

Create a **Static Site**, build command `npm install && npm run build`, publish directory `dist`. Under **Redirects/Rewrites** add a rewrite from `/*` to `/index.html`.

## License

MIT
