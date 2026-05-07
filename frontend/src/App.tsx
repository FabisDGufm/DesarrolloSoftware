import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Explore } from './pages/Explore'
import { Messages } from './pages/Messages'
import { Profile } from './pages/Profile'
import { EditProfile } from './pages/EditProfile'
import { CreatePost } from './pages/CreatePost'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { AcademicHelp } from './pages/AcademicHelp'
import { ReportContent } from './pages/ReportContent'
import { ModerationPanel } from './pages/ModerationPanel'
import { Debates } from './pages/Debates'
import { Promotions } from './pages/Promotions'
import { CreatePromotion } from './pages/CreatePromotion'
import { Friends } from './pages/Friends'
import { SavedPosts } from './pages/SavedPosts'
import { Communities } from './pages/Communities'

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
        <Route path="/comunidades" element={<Communities />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/profile/editar" element={<EditProfile />} />
        <Route path="/create-post" element={<CreatePost />} />
        <Route path="/moderacion" element={<ModerationPanel />} />

        {/* Routes kept alive for deep links / communities */}
        <Route path="/ayuda" element={<AcademicHelp />} />
        <Route path="/debates" element={<Debates />} />
        <Route path="/promotions" element={<Promotions />} />
        <Route path="/create-promotion" element={<CreatePromotion />} />
        <Route path="/guardados" element={<SavedPosts />} />
        <Route path="/amigos" element={<Friends />} />

        {/* Redirect old routes */}
        <Route path="/reportar" element={<ReportContent />} />
      </Route>
    </Routes>
  )
}

export default App
