import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { useNavigate } from 'react-router-dom'

interface Report {
  id: string
  reporterId: number
  targetType: string
  targetId: string
  reason: string
  status: string
  createdAt: string
}

export function ModerationPanel() {
  const { isAuthenticated, user } = useAuthStore()
  const navigate = useNavigate()
  const role = user?.role ?? 0
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sanctionUserId, setSanctionUserId] = useState('')
  const [suspendUntil, setSuspendUntil] = useState('')
  const [sanctionMsg, setSanctionMsg] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/api/moderation/reports')
      const list = data.data ?? data
      setReports(Array.isArray(list) ? list : [])
    } catch {
      setError('No se pudieron cargar los reportes (permisos o red).')
      setReports([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAuthenticated || role < 1) {
      setLoading(false)
      return
    }
    void load()
  }, [isAuthenticated, role])

  const resolve = async (id: string, status: 'DISMISSED' | 'ACTION_TAKEN') => {
    try {
      await api.patch(`/api/moderation/reports/${id}`, {
        status,
        resolutionNote: status === 'DISMISSED' ? 'Descartado desde panel' : 'Atendido desde panel',
      })
      await load()
    } catch {
      setError('Error al cerrar reporte.')
    }
  }

  const suspend = async () => {
    const id = Number(sanctionUserId)
    if (!Number.isFinite(id) || !suspendUntil) {
      setSanctionMsg('Usuario y fecha hasta requeridos.')
      return
    }
    const until = new Date(suspendUntil).toISOString()
    try {
      await api.post(`/api/moderation/users/${id}/suspend`, { until })
      setSanctionMsg(`Usuario ${id} suspendido.`)
      setSanctionUserId('')
      setSuspendUntil('')
    } catch (err: unknown) {
      const m =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null
      setSanctionMsg(m || 'Error al suspender.')
    }
  }

  const ban = async () => {
    const id = Number(sanctionUserId)
    if (!Number.isFinite(id)) {
      setSanctionMsg('Usuario requerido.')
      return
    }
    try {
      await api.post(`/api/moderation/users/${id}/ban`, {})
      setSanctionMsg(`Usuario ${id} inhabilitado (ban).`)
    } catch (err: unknown) {
      const m =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null
      setSanctionMsg(m || 'Error al banear.')
    }
  }

  const reinstate = async () => {
    const id = Number(sanctionUserId)
    if (!Number.isFinite(id)) {
      setSanctionMsg('Usuario requerido.')
      return
    }
    try {
      await api.post(`/api/moderation/users/${id}/reinstate`, {})
      setSanctionMsg(`Usuario ${id} reactivado.`)
    } catch (err: unknown) {
      const m =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null
      setSanctionMsg(m || 'Error al reactivar.')
    }
  }

  if (!isAuthenticated) {
    return (
      <>
        <div className="page-header">
          <div className="page-title">Moderacion</div>
        </div>
        <div className="empty-state">
          <p>Inicia sesión.</p>
          <button type="button" className="btn-primary" onClick={() => navigate('/login')}>
            Login
          </button>
        </div>
      </>
    )
  }

  if (role < 1) {
    return (
      <>
        <div className="page-header">
          <div className="page-title">Moderacion</div>
        </div>
        <div className="empty-state">
          <p>No tienes permisos de moderador. Un admin debe asignar `role` en la base (1 = moderador, 2 = admin).</p>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">Panel de moderacion</div>
      </div>

      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <section>
          <h2 style={{ fontSize: 16, marginBottom: 12 }}>Sanciones por usuario</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
            ID numerico del usuario en MySQL (tabla User).
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-end' }}>
            <input
              type="number"
              placeholder="user id"
              value={sanctionUserId}
              onChange={(e) => setSanctionUserId(e.target.value)}
              style={{ padding: 8, width: 120 }}
            />
            <input
              type="datetime-local"
              value={suspendUntil}
              onChange={(e) => setSuspendUntil(e.target.value)}
              style={{ padding: 8 }}
            />
            <button type="button" className="btn-primary" onClick={() => void suspend()}>
              Suspender
            </button>
            <button type="button" className="btn-primary" onClick={() => void ban()} style={{ background: '#8b2942' }}>
              Ban permanente
            </button>
            <button type="button" className="btn-primary" onClick={() => void reinstate()}>
              Reactivar
            </button>
          </div>
          {sanctionMsg ? <p style={{ marginTop: 8, fontSize: 14 }}>{sanctionMsg}</p> : null}
        </section>

        <section>
          <h2 style={{ fontSize: 16, marginBottom: 12 }}>Reportes abiertos</h2>
          {error ? <p style={{ color: '#c00' }}>{error}</p> : null}
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner" />
            </div>
          ) : reports.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No hay reportes abiertos.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {reports.map((r) => (
                <div
                  key={r.id}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: 12,
                  }}
                >
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {r.createdAt} · reporter {r.reporterId}
                  </div>
                  <div style={{ fontWeight: 600, marginTop: 4 }}>
                    {r.targetType}: {r.targetId}
                  </div>
                  <p style={{ margin: '8px 0', fontSize: 14 }}>{r.reason}</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" className="btn-primary" onClick={() => void resolve(r.id, 'DISMISSED')}>
                      Descartar
                    </button>
                    <button type="button" className="btn-primary" onClick={() => void resolve(r.id, 'ACTION_TAKEN')}>
                      Marcado atendido
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  )
}
