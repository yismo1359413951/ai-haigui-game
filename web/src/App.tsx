import { Navigate, Route, Routes } from 'react-router-dom'
import Game from './pages/Game'
import Home from './pages/Home'
import Result from './pages/Result'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/game/:id" element={<Game />} />
      <Route path="/result" element={<Result />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
