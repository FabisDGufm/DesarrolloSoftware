import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconArrowLeft } from '../components/Icons'
import { api } from '../services/api'
import { useAuthStore } from '../stores/authStore'

const S3_BASE = 'https://social-media-ufm-elpasillo.s3.amazonaws.com'

function resolvePhoto(photo?: string): string | undefined {
  if (!photo) return undefined
  if (photo.startsWith('http')) return photo
  return `${S3_BASE}/${photo}`
}

export function EditProfile() {
  const navigate = useNavigate()
  const { user, setAuth, logout } = useAuthStore()
  const photoRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  if (!user) {
    navigate('/login')
    return null
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.id) return
    setUploading(true)
    try {
      const { data: uploadData } = await api.get('/api/users/upload-url', {
        params: { fileName: file.name },
      })
      const { url, key } = uploadData.data
      await fetch(url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })
      await api.put(`/api/users/${user.id}/profile-photo`, { profilePhoto: key })
      setAuth({ ...user, profilePhoto: key }, useAuthStore.getState().token || '')
    } catch (err) {
      console.error('Error subiendo foto:', err)
    } finally {
      setUploading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const photoSrc = resolvePhoto(user.profilePhoto)

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate('/profile')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: 20,
              cursor: 'pointer',
              padding: '14px 0',
            }}
          >
            <IconArrowLeft size={18} />
          </button>
          <span className="page-title" style={{ padding: 0 }}>Editar perfil</span>
        </div>
      </div>

      <div style={{ padding: '24px 20px' }}>
        {/* Photo section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
          <div className="avatar avatar-xl" style={{ cursor: 'pointer' }} onClick={() => photoRef.current?.click()}>
            {photoSrc ? (
              <img src={photoSrc} alt={user.name} />
            ) : (
              (user.name || '?')[0]!.toUpperCase()
            )}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{user.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>{user.email}</div>
            <input
              ref={photoRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{ display: 'none' }}
            />
            <button
              className="btn-secondary"
              onClick={() => photoRef.current?.click()}
              disabled={uploading}
              style={{ width: 'auto' }}
            >
              {uploading ? 'Subiendo...' : 'Cambiar foto'}
            </button>
          </div>
        </div>

        {/* Info section */}
        <div style={{
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--r-lg)',
          padding: 20,
          border: '1px solid var(--border-subtle)',
          marginBottom: 32,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Información
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Nombre</div>
              <div style={{ fontSize: 15 }}>{user.name}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Correo</div>
              <div style={{ fontSize: 15 }}>{user.email}</div>
            </div>
            {user.university && (
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Universidad</div>
                <div style={{ fontSize: 15 }}>{user.university}</div>
              </div>
            )}
          </div>
        </div>

        {/* Danger zone */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: 24,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Cuenta
          </div>
          {showConfirm ? (
            <div style={{
              background: 'var(--danger-muted)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--r-md)',
              padding: 16,
            }}>
              <div style={{ fontSize: 14, marginBottom: 12 }}>¿Quieres cerrar sesión?</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '8px 18px',
                    border: 'none',
                    borderRadius: 'var(--r-sm)',
                    background: 'var(--danger)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  Si, cerrar sesión
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  style={{
                    padding: '8px 18px',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--r-sm)',
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirm(true)}
              style={{
                padding: '10px 20px',
                border: '1px solid var(--danger)',
                borderRadius: 'var(--r-md)',
                background: 'transparent',
                color: 'var(--danger)',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--danger-muted)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              Cerrar sesión
            </button>
          )}
        </div>
      </div>
    </>
  )
}
