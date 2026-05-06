import { useState } from 'react'
import { api } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { useNavigate } from 'react-router-dom'

const TARGET_TYPES = [
  { value: 'post', label: 'Post (targetId: autorId/postId)' },
  { value: 'user', label: 'Usuario (targetId: id numerico)' },
  { value: 'comment', label: 'Comentario' },
  { value: 'message', label: 'Mensaje directo' },
  { value: 'help_message', label: 'Mensaje de ayuda academica' },
] as const

export function ReportContent() {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [targetType, setTargetType] = useState<string>('post')
  const [targetId, setTargetId] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg('')
    setLoading(true)
    try {
      await api.post('/api/moderation/reports', {
        targetType,
        targetId: targetId.trim(),
        reason: reason.trim(),
      })
      setMsg('Reporte enviado. Gracias.')
      setTargetId('')
      setReason('')
    } catch (err: unknown) {
      const m =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null
      setMsg(m || 'No se pudo enviar el reporte.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">Reportar contenido</div>
      </div>

      {!isAuthenticated ? (
        <div className="empty-state">
          <p>Inicia sesion para enviar un reporte.</p>
          <button type="button" className="btn-primary" onClick={() => navigate('/login')}>
            Ir a login
          </button>
        </div>
      ) : (
        <div style={{ maxWidth: 520, padding: '0 16px 24px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
            Los moderadores revisan la cola. No compartas datos personales innecesarios.
          </p>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label>Tipo</label>
              <select
                style={{ width: '100%', marginTop: 6, padding: 10 }}
                value={targetType}
                onChange={(e) => setTargetType(e.target.value)}
              >
                {TARGET_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Identificador del objetivo (targetId)</label>
              <input
                type="text"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                placeholder="Ej. 12/45 para post autor 12 post 45"
                required
                style={{ width: '100%', marginTop: 6, padding: 10 }}
              />
            </div>
            <div>
              <label>Motivo</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                required
                placeholder="Describe el problema (spam, odio, acoso...)"
                style={{ width: '100%', marginTop: 6, padding: 10 }}
              />
            </div>
            {msg && (
              <p style={{ fontSize: 14, color: msg.startsWith('Reporte') ? 'var(--text-primary)' : '#c00' }}>{msg}</p>
            )}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar reporte'}
            </button>
          </form>
        </div>
      )}
    </>
  )
}
