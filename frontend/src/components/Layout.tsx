import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { TopBar } from './TopBar'
import { IconHome, IconSearch, IconMessage, IconGrid, IconUsers, IconShield } from './Icons'

interface SuggestedUser {
  id: number
  name: string
  university?: string
  profilePhoto?: string
}

const S3_BASE = 'https://social-media-ufm-elpasillo.s3.amazonaws.com'

function resolvePhoto(photo?: string): string | undefined {
  if (!photo) return undefined
  if (photo.startsWith('http')) return photo
  return `${S3_BASE}/${photo}`
}

function Avatar({ name, photo, size }: { name?: string; photo?: string; size?: string }) {
  const src = resolvePhoto(photo)
  if (src) {
    return (
      <div className={`avatar ${size || ''}`}>
        <img src={src} alt={name || ''} />
      </div>
    )
  }
  const letter = (name || '?')[0]!.toUpperCase()
  return <div className={`avatar ${size || ''}`}>{letter}</div>
}

function ConnectPanel({ currentUserId }: { currentUserId?: number }) {
  const [allUsers, setAllUsers] = useState<SuggestedUser[]>([])
  const [displayed, setDisplayed] = useState<SuggestedUser[]>([])
  const [progress, setProgress] = useState(0)
  const [sent, setSent] = useState<number[]>([])

  const pickRandom = (arr: SuggestedUser[], n: number) => {
    const shuffled = [...arr].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, n)
  }

  useEffect(() => {
    api.get('/api/users').then(({ data }) => {
      const users = (data.data || []).filter((u: SuggestedUser) => u.id !== currentUserId)
      setAllUsers(users)
      setDisplayed(pickRandom(users, 3))
    }).catch(() => {})
  }, [currentUserId])

  useEffect(() => {
    if (allUsers.length === 0) return
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          setDisplayed(pickRandom(allUsers, 3))
          return 0
        }
        return p + 2
      })
    }, 100)
    return () => clearInterval(interval)
  }, [allUsers])

  const handleSend = async (targetId: number) => {
    try {
      await api.post(`/api/user-relations/${currentUserId}/friend-request/${targetId}`)
      setSent(prev => [...prev, targetId])
    } catch {
      setSent(prev => [...prev, targetId])
    }
  }

  return (
    <div className="who-to-follow">
      <div className="who-to-follow-title">Conecta</div>
      <div style={{ height: 3, background: 'var(--border-color)', borderRadius: 2, margin: '4px 0 12px' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent)', borderRadius: 2, transition: 'width 0.1s linear' }} />
      </div>
      {displayed.map((u) => (
        <div key={u.id} className="follow-suggestion">
          <Avatar name={u.name} photo={u.profilePhoto} size="avatar-lg" />
          <div className="follow-suggestion-info">
            <div className="follow-suggestion-name">{u.name}</div>
            <div className="follow-suggestion-handle">{u.university || 'Universidad'}</div>
          </div>
          {sent.includes(u.id) ? (
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Enviado</span>
          ) : (
            <button className="btn-follow follow" onClick={() => handleSend(u.id)}>Agregar</button>
          )}
        </div>
      ))}
    </div>
  )
}

export function Layout() {
  const { user, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [pendingRequests, setPendingRequests] = useState(0)

  useEffect(() => {
    if (!user) return
    const check = async () => {
      try {
        const { data } = await api.get(`/api/user-relations/${Number(user.id)}/friend-requests/received`)
        const requests = data.data || data || []
        setPendingRequests(requests.length)
      } catch (_e) {
  console.error(_e)
}
    }
    check()
    const interval = setInterval(check, 10000)
    return () => clearInterval(interval)
  }, [user])

  return (
    <>
    <TopBar />
    <div className="app-layout">
      <nav className="sidebar">
        <div className="sidebar-logo">
          El <span className="sidebar-logo-accent">Pasillo</span>
        </div>
        <div className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
            <span className="nav-icon"><IconHome /></span>
            <span>Inicio</span>
          </NavLink>
          <NavLink to="/explore" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon"><IconSearch /></span>
            <span>Explorar</span>
          </NavLink>
          <NavLink to="/messages" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon"><IconMessage /></span>
            <span>Mensajes</span>
          </NavLink>
          <NavLink to="/comunidades" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon"><IconGrid /></span>
            <span>Comunidades</span>
          </NavLink>
          <NavLink to="/amigos" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon"><IconUsers /></span>
            <span>Amigos</span>
            {pendingRequests > 0 && (
              <span style={{
                background: 'var(--danger)',
                color: 'white',
                borderRadius: '50%',
                fontSize: 11,
                width: 18,
                height: 18,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 6,
                fontWeight: 700,
                animation: 'pulse 1.5s infinite'
              }}>{pendingRequests}</span>
            )}
          </NavLink>
          {(user?.role ?? 0) >= 1 && (
            <NavLink to="/moderacion" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span className="nav-icon"><IconShield /></span>
              <span>Moderacion</span>
            </NavLink>
          )}
        </div>

        {/* Publicar moved to TopBar */}

        {isAuthenticated && user ? (
          <div className="sidebar-user" onClick={() => navigate('/profile/editar')} title="Editar perfil">
            <Avatar name={user.name} photo={user.profilePhoto} />
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user.name}</div>
              <div className="sidebar-user-handle">Editar perfil</div>
            </div>
          </div>
        ) : (
          <div className="sidebar-user" onClick={() => navigate('/login')}>
            <Avatar name="?" />
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">Iniciar sesión</div>
            </div>
          </div>
        )}
      </nav>

      <main className="main-content">
        <Outlet />
      </main>

      <aside className="right-panel">

      <div className="trending-card">
  <div className="trending-card-title">Accesos rápidos</div>
  <div className="trending-item" onClick={() => navigate('/ayuda?slug=general')} style={{ cursor: 'pointer' }}>
    <div className="trending-item-category">Ayuda</div>
    <div className="trending-item-name">General</div>
  </div>
  <div className="trending-item" onClick={() => navigate('/ayuda?slug=matematicas')} style={{ cursor: 'pointer' }}>
    <div className="trending-item-category">Ayuda</div>
    <div className="trending-item-name">Matemáticas</div>
  </div>
  <div className="trending-item" onClick={() => navigate('/explore')} style={{ cursor: 'pointer' }}>
    <div className="trending-item-category">Explorar</div>
    <div className="trending-item-name">Posts</div>
  </div>
  <div className="trending-item" onClick={() => navigate('/explore')} style={{ cursor: 'pointer' }}>
    <div className="trending-item-category">Explorar</div>
    <div className="trending-item-name">Noticias</div>
  </div>
</div>

        {isAuthenticated && <ConnectPanel currentUserId={Number(user?.id)} />}
      </aside>
    </div>
    </>
  )
}