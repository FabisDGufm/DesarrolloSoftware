import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { IconSearch } from './Icons'

const S3_BASE = 'https://social-media-ufm-elpasillo.s3.amazonaws.com'

export function TopBar() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuthStore()
  const [query, setQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      navigate(`/explore?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleLogout = () => {
    setShowDropdown(false)
    logout()
    navigate('/login')
  }

  const photoSrc = user?.profilePhoto
    ? user.profilePhoto.startsWith('http') ? user.profilePhoto : `${S3_BASE}/${user.profilePhoto}`
    : undefined

  return (
    <div className="top-bar">
      <div className="top-bar-logo" onClick={() => navigate('/')}>
        El <span className="top-bar-logo-accent">Pasillo</span>
      </div>

      <div className="top-bar-search">
        <span className="top-bar-search-icon"><IconSearch size={16} /></span>
        <input
          type="text"
          placeholder="Buscar en El Pasillo..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>

      <div className="top-bar-actions">
        {isAuthenticated && (
          <button className="top-bar-publish" onClick={() => navigate('/create-post')}>
            + Publicar
          </button>
        )}

        {isAuthenticated && user ? (
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <div
              className="top-bar-avatar"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {photoSrc ? (
                <img src={photoSrc} alt={user.name} />
              ) : (
                (user.name || '?')[0]!.toUpperCase()
              )}
            </div>

            {showDropdown && (
              <div className="top-bar-dropdown">
                <button className="top-bar-dropdown-item" onClick={() => { setShowDropdown(false); navigate('/profile') }}>
                  Ver perfil
                </button>
                <button className="top-bar-dropdown-item" onClick={() => { setShowDropdown(false); navigate('/profile/editar') }}>
                  Editar perfil
                </button>
                <div className="top-bar-dropdown-divider" />
                <button className="top-bar-dropdown-item danger" onClick={handleLogout}>
                  Cerrar sesion
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            className="top-bar-publish"
            onClick={() => navigate('/login')}
            style={{ background: 'var(--primary)', color: 'var(--text-on-primary)' }}
          >
            Iniciar sesion
          </button>
        )}
      </div>
    </div>
  )
}
