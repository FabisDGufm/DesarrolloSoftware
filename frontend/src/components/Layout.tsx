import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useState, useEffect } from 'react'
import { api } from '../services/api'

interface SuggestedUser {
  id: number
  name: string
  university?: string
}

function Avatar({ name, size }: { name?: string; size?: string }) {
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
          <Avatar name={u.name} size="avatar-lg" />
          <div className="follow-suggestion-info">
            <div className="follow-suggestion-name">{u.name}</div>
            <div className="follow-suggestion-handle">{u.university || 'Universidad'}</div>
          </div>
          {sent.includes(u.id) ? (
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Enviado ✓</span>
          ) : (
            <button className="btn-follow follow" onClick={() => handleSend(u.id)}>Agregar</button>
          )}
        </div>
      ))}
    </div>
  )
}

export function Layout() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()
  const [pendingRequests, setPendingRequests] = useState(0)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

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
    <div className="app-layout">
      <nav className="sidebar">
        <div className="sidebar-logo">
          El <span className="sidebar-logo-accent">Pasillo</span>
        </div>
        <div className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
            <span className="nav-icon">&#9750;</span>
            <span>Inicio</span>
          </NavLink>
          <NavLink to="/explore" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">&#9906;</span>
            <span>Explorar</span>
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/guardados" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">&#9733;</span>
              <span>Guardados</span>
            </NavLink>
          )}
          <NavLink to="/amigos" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">&#128101;</span>
            <span>Amigos</span>
            {pendingRequests > 0 && (
              <span style={{
                background: 'red',
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
          <NavLink to="/messages" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">&#9883;</span>
            <span>Mensajes</span>
          </NavLink>
          <NavLink to="/ayuda" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">&#9998;</span>
            <span>Ayuda</span>
          </NavLink>
          <NavLink to="/reportar" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">&#9888;</span>
            <span>Reportar</span>
          </NavLink>
          {(user?.role ?? 0) >= 1 && (
            <NavLink to="/moderacion" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">&#9632;</span>
              <span>Moderacion</span>
            </NavLink>
          )}
          <NavLink to="/debates" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">&#128172;</span>
            <span>Sin Filtro</span>
          </NavLink>
          <NavLink to="/promotions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">&#128717;</span>
            <span>Emprendimientos</span>
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">&#9673;</span>
              <span>Perfil</span>
            </NavLink>
          )}
        </div>

        {isAuthenticated && (
          <>
            <button className="sidebar-post-btn" onClick={() => navigate('/create-post')}>
              Publicar
            </button>
            <button className="sidebar-post-btn" onClick={() => navigate('/create-promotion')} style={{ marginTop: 10, background: 'var(--accent)' }}>
              Promocionate
            </button>
          </>
        )}

        {isAuthenticated && user ? (
          <div className="sidebar-user" onClick={handleLogout} title="Cerrar sesion">
            <Avatar name={user.name} />
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user.name}</div>
              <div className="sidebar-user-handle">Cerrar sesion</div>
            </div>
          </div>
        ) : (
          <div className="sidebar-user" onClick={() => navigate('/login')}>
            <Avatar name="?" />
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">Iniciar sesion</div>
            </div>
          </div>
        )}
      </nav>

      <main className="main-content">
        <Outlet />
      </main>

      <aside className="right-panel">

      <div className="trending-card">
  <div className="trending-card-title">Accesos rapidos</div>
  <div className="trending-item" onClick={() => navigate('/ayuda?slug=general')} style={{ cursor: 'pointer' }}>
    <div className="trending-item-category">Ayuda</div>
    <div className="trending-item-name">General</div>
  </div>
  <div className="trending-item" onClick={() => navigate('/ayuda?slug=matematicas')} style={{ cursor: 'pointer' }}>
    <div className="trending-item-category">Ayuda</div>
    <div className="trending-item-name">Matematicas</div>
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
  )
}