import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import NotesView from './pages/NotesView.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<NotesView view="active" />} />
        <Route path="archive" element={<NotesView view="archived" />} />
        <Route path="trash" element={<NotesView view="trashed" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
