import { useState } from 'react'
import { api } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { useNavigate } from 'react-router-dom'

export function ReportContent() {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [motivo, setMotivo] = useState('')
  const [reportedUserName, setReportedUserName] = useState('')
  const [razon, setRazon] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg('')
    setLoading(true)
    const motivoT = motivo.trim()
    const nameT = reportedUserName.trim()
    const razonT = razon.trim()
    const reason = `${motivoT}\n\nRazón:\n${razonT}`
    try {
      await api.post('/api/moderation/reports', {
        targetType: 'user',
        reportedUserName: nameT,
        reason,
      })
      setMsg('Reporte enviado. Gracias.')
      setMotivo('')
      setReportedUserName('')
      setRazon('')
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
            Los moderadores revisan la cola. Escribi el nombre exacto que figura en el perfil de la
            persona. No compartas datos personales innecesarios.
          </p>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label>Motivo</label>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                rows={3}
                required
                placeholder="Ej. acoso, spam, contenido ofensivo..."
                style={{ width: '100%', marginTop: 6, padding: 10 }}
              />
            </div>
            <div>
              <label htmlFor="report-username">Nombre de usuario a reportar</label>
              <input
                id="report-username"
                type="text"
                value={reportedUserName}
                onChange={(e) => setReportedUserName(e.target.value)}
                placeholder="Nombre que aparece en el perfil (no es el correo)"
                required
                autoComplete="off"
                style={{ width: '100%', marginTop: 6, padding: 10 }}
              />
            </div>
            <div>
              <label>Razón</label>
              <textarea
                value={razon}
                onChange={(e) => setRazon(e.target.value)}
                rows={4}
                required
                placeholder="Contá qué pasó con el detalle que puedas."
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
