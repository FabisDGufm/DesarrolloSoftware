import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { useAuthStore } from '../stores/authStore'

interface Debate {
  debateId: string
  text: string
  university: string
  createdAt: string
}

interface Reply {
  replyId: string
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
  const [replies, setReplies] = useState<Record<string, Reply[]>>({})
  const [replyText, setReplyText] = useState<Record<string, string>>({})
  const [openReply, setOpenReply] = useState<string | null>(null)
  const [loadingReplies, setLoadingReplies] = useState<Record<string, boolean>>({})

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
}    finally {
      setLoading(false)
    }
  }

  const loadReplies = async (debateId: string) => {
    setLoadingReplies(prev => ({ ...prev, [debateId]: true }))
    try {
      const { data } = await api.get(`/api/debates/${debateId}/replies`)
      setReplies(prev => ({ ...prev, [debateId]: data.data || [] }))
    } catch {
  setReplies(prev => ({ ...prev, [debateId]: [] }))
} finally {
      setLoadingReplies(prev => ({ ...prev, [debateId]: false }))
    }
  }

  const toggleReplies = (debateId: string) => {
    if (openReply === debateId) {
      setOpenReply(null)
    } else {
      setOpenReply(debateId)
      if (!replies[debateId]) loadReplies(debateId)
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

  const handleReply = async (debateId: string) => {
    const text = replyText[debateId]?.trim()
    if (!text) return
    try {
      await api.post(`/api/debates/${debateId}/replies`, {
        text,
        university: (user as { university?: string })?.university || 'General'
      })
      setReplyText(prev => ({ ...prev, [debateId]: '' }))
      loadReplies(debateId)
    } catch (_e) {
      console.error(_e)
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
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{composeText.length}/500</div>
              <button className="compose-submit" onClick={handlePublish} disabled={publishing || !composeText.trim()}>
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
            <div className="post-actions" style={{ marginTop: 8 }}>
              <button
                onClick={() => toggleReplies(debate.debateId)}
                style={{ fontSize: 13, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                💬 {openReply === debate.debateId ? 'Cerrar' : 'Responder'}
              </button>
            </div>

            {openReply === debate.debateId && (
              <div style={{ marginTop: 12, paddingLeft: 16, borderLeft: '2px solid var(--border-color)' }}>
                {loadingReplies[debate.debateId] ? (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Cargando...</div>
                ) : (
                  (replies[debate.debateId] || []).map(reply => (
                    <div key={reply.replyId} style={{ marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Anónimo · {formatTime(reply.createdAt)}</span>
                      <div style={{ fontSize: 14 }}>{reply.text}</div>
                    </div>
                  ))
                )}

                {isAuthenticated && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <input
                      type="text"
                      value={replyText[debate.debateId] || ''}
                      onChange={(e) => setReplyText(prev => ({ ...prev, [debate.debateId]: e.target.value }))}
                      placeholder="Responde anonimamente..."
                      style={{ flex: 1, padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 13 }}
                    />
                    <button
                      onClick={() => handleReply(debate.debateId)}
                      className="compose-submit"
                      style={{ padding: '6px 14px', fontSize: 13 }}
                    >
                      Enviar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </>
  )
}