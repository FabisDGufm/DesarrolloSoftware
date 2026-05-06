import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { useAuthStore } from '../stores/authStore'

interface Debate {
  debateId: string
  text: string
  university: string
  createdAt: string
}

export function Debates() {
  const { user, isAuthenticated } = useAuthStore()
  const [debates, setDebates] = useState<Debate[]>([])
  const [loading, setLoading] = useState(true)
  const [composeText, setComposeText] = useState('')
  const [publishing, setPublishing] = useState(false)

  useEffect(() => {
    loadDebates()
  }, [])

  const loadDebates = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/debates')
      setDebates(data.data || [])
    } catch {
      setDebates([])
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async () => {
    if (!composeText.trim()) return
    setPublishing(true)
    try {
      await api.post('/api/debates', {
        text: composeText.trim(),
        university: (user as { university?: string })?.university || 'General'
      })
      setComposeText('')
      loadDebates()
    } catch (_e) {
      console.error(_e)
    } finally {
      setPublishing(false)
    }
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('es-GT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">Sin Filtro</div>
        <div style={{ padding: '8px 20px', fontSize: 13, color: 'var(--text-muted)' }}>
          Espacio anonimo para debatir sin filtros. Nadie sabe quien eres.
        </div>
      </div>

      {isAuthenticated && (
        <div className="compose-area">
          <div className="avatar" style={{ background: '#555', color: '#fff', fontSize: 18 }}>?</div>
          <div className="compose-input">
            <textarea
              value={composeText}
              onChange={(e) => setComposeText(e.target.value)}
              placeholder="Di lo que piensas... nadie sabra que fuiste tu."
              disabled={publishing}
            />
            <div className="compose-toolbar">
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {composeText.length}/500
              </div>
              <button
                className="compose-submit"
                onClick={handlePublish}
                disabled={publishing || !composeText.trim()}
              >
                {publishing ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : debates.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">Sin debates aun</div>
          <p>Se el primero en publicar algo en Sin Filtro.</p>
        </div>
      ) : (
        debates.map((debate) => (
          <div key={debate.debateId} className="post-card">
            <div className="post-header">
              <div className="avatar" style={{ background: '#555', color: '#fff', fontSize: 18 }}>?</div>
              <div className="post-meta">
                <span className="post-author">Anónimo</span>
                <span className="post-time">{formatTime(debate.createdAt)}</span>
              </div>
            </div>
            <div className="post-content">{debate.text}</div>
          </div>
        ))
      )}
    </>
  )
}