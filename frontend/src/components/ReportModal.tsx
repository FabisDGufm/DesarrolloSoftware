import { useState } from 'react'
import { api } from '../services/api'
import { IconCheck } from './Icons'

interface ReportModalProps {
  authorName: string
  authorId: number
  postId: string
  onClose: () => void
}

export function ReportModal({ authorName, authorId, postId, onClose }: ReportModalProps) {
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason) return
    setSending(true)
    try {
      await api.post('/api/moderation/reports', {
        reportedUser: authorName,
        reportedUserId: authorId,
        postId,
        reason,
        details: details.trim(),
      })
      setSent(true)
    } catch {
      setSent(true)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Reportar contenido</div>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        {sent ? (
          <div className="modal-body" style={{ textAlign: 'center', padding: '32px 20px' }}>
            <div style={{ marginBottom: 12, color: 'var(--success)' }}><IconCheck size={48} /></div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Reporte enviado</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Lo revisaremos pronto.</div>
            <button
              onClick={onClose}
              className="btn-secondary"
              style={{ marginTop: 20, width: 'auto', padding: '8px 24px' }}
            >
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="form-group">
                <label>Usuario reportado</label>
                <input type="text" value={authorName} readOnly style={{ opacity: 0.7 }} />
              </div>
              <div className="form-group">
                <label>Motivo</label>
                <select value={reason} onChange={(e) => setReason(e.target.value)} required>
                  <option value="">Selecciona un motivo</option>
                  <option value="spam">Spam</option>
                  <option value="acoso">Acoso o bullying</option>
                  <option value="odio">Discurso de odio</option>
                  <option value="violencia">Violencia</option>
                  <option value="desinformacion">Desinformacion</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div className="form-group">
                <label>Detalles (opcional)</label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Describe el problema..."
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-outline" onClick={onClose} style={{ width: 'auto', marginTop: 0, padding: '8px 18px' }}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={!reason || sending} style={{ width: 'auto', marginTop: 0, padding: '8px 18px' }}>
                {sending ? 'Enviando...' : 'Enviar reporte'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
