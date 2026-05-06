import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Explore } from './pages/Explore'
import { Messages } from './pages/Messages'
import { Profile } from './pages/Profile'
import { CreatePost } from './pages/CreatePost'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { AcademicHelp } from './pages/AcademicHelp'
import { ReportContent } from './pages/ReportContent'
import { ModerationPanel } from './pages/ModerationPanel'
import { Debates } from './pages/Debates'

function App() {
  return (
    <Routes>
      {/* Auth pages (no layout) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Main app with layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/ayuda" element={<AcademicHelp />} />
        <Route path="/reportar" element={<ReportContent />} />
        <Route path="/moderacion" element={<ModerationPanel />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/create-post" element={<CreatePost />} />
        <Route path="/debates" element={<Debates />} />
      </Route>
    </Routes>
  )
}

export default App
