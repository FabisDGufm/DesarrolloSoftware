import { Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home'
import { ProfilePhotoUpload } from './pages/ProfilePhotoUpload'
import { CreatePost } from './pages/CreatePost'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/profile-photo" element={<ProfilePhotoUpload />} />
      <Route path="/create-post" element={<CreatePost />} />
    </Routes>
  )
}

export default App
