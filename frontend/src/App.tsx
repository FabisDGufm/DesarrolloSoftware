import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Explore } from './pages/Explore'
import { Messages } from './pages/Messages'
import { Profile } from './pages/Profile'
import { CreatePost } from './pages/CreatePost'
import { Login } from './pages/Login'
import { Register } from './pages/Register'

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
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/create-post" element={<CreatePost />} />
      </Route>
    </Routes>
  )
}

export default App
