import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

function Avatar({ name, size }: { name?: string; size?: string }) {
  const letter = (name || '?')[0]!.toUpperCase()
  return <div className={`avatar ${size || ''}`}>{letter}</div>
}

export function Layout() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="app-layout">
      {/* Sidebar */}
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
          {isAuthenticated && (
            <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">&#9673;</span>
              <span>Perfil</span>
            </NavLink>
          )}
        </div>

        {isAuthenticated && (
          <button className="sidebar-post-btn" onClick={() => navigate('/create-post')}>
            Publicar
          </button>
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

      {/* Main content */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Right panel */}
      <aside className="right-panel">
        <div className="search-bar">
          <span className="search-icon">&#9906;</span>
          <input type="text" placeholder="Buscar en el pasillo..." />
        </div>

        <div className="trending-card">
          <div className="trending-card-title">En el pasillo</div>
          <div className="trending-item">
            <div className="trending-item-category">Guatemala</div>
            <div className="trending-item-name">Vida Universitaria</div>
            <div className="trending-item-count">1,234 posts</div>
          </div>
          <div className="trending-item">
            <div className="trending-item-category">Academico</div>
            <div className="trending-item-name">Examenes Finales</div>
            <div className="trending-item-count">890 posts</div>
          </div>
          <div className="trending-item">
            <div className="trending-item-category">Tech</div>
            <div className="trending-item-name">Desarrollo de Software</div>
            <div className="trending-item-count">456 posts</div>
          </div>
        </div>

        <div className="who-to-follow">
          <div className="who-to-follow-title">Conecta</div>
          <div className="follow-suggestion">
            <Avatar name="M" size="avatar-lg" />
            <div className="follow-suggestion-info">
              <div className="follow-suggestion-name">Maria Lopez</div>
              <div className="follow-suggestion-handle">Ingenieria - UFM</div>
            </div>
            <button className="btn-follow follow">Seguir</button>
          </div>
          <div className="follow-suggestion">
            <Avatar name="C" size="avatar-lg" />
            <div className="follow-suggestion-info">
              <div className="follow-suggestion-name">Carlos Ruiz</div>
              <div className="follow-suggestion-handle">Derecho - URL</div>
            </div>
            <button className="btn-follow follow">Seguir</button>
          </div>
          <div className="follow-suggestion">
            <Avatar name="A" size="avatar-lg" />
            <div className="follow-suggestion-info">
              <div className="follow-suggestion-name">Ana Castillo</div>
              <div className="follow-suggestion-handle">Medicina - USAC</div>
            </div>
            <button className="btn-follow follow">Seguir</button>
          </div>
        </div>
      </aside>
    </div>
  )
}
