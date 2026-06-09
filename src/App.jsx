import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Book from './pages/Book'
import Admin from './pages/Admin'
import ClickFlame from './components/ClickFlame'

export default function App() {
  return (
    <BrowserRouter>
      <ClickFlame />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/book" element={<Book />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}
