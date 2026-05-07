import { useState, useEffect, useRef } from 'react'
import { api } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { useSearchParams } from 'react-router-dom'
import { IconArrowLeft, IconSend } from '../components/Icons'

interface SpaceMeta {
  slug: string
  title: string
  description: string
}

interface HelpMsg {
  id: string
  spaceSlug: string
  fromUserId: number
  fromUserName?: string
  text: string
  createdAt: string
}

export function AcademicHelp() {
  const { user } = useAuthStore()
  const [searchParams] = useSearchParams()
  const [spaces, setSpaces] = useState<SpaceMeta[]>([])
  const [selected, setSelected] = useState<SpaceMeta | null>(null)
  const [messages, setMessages] = useState<HelpMsg[]>([])
  const [newMsg, setNewMsg] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingSpaces, setLoadingSpaces] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [userNames, setUserNames] = useState<Record<number, string>>({})

  useEffect(() => {
    const load = async () => {
      setLoadingSpaces(true)
      try {
        const { data } = await api.get('/api/help-spaces')
        const list = data.data ?? data
        setSpaces(Array.isArray(list) ? list : [])
      } catch {
        setSpaces([])
      } finally {
        setLoadingSpaces(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    const slug = searchParams.get('slug')
    if (slug && spaces.length > 0) {
      const space = spaces.find(s => s.slug === slug)
      if (space) setSelected(space)
    }
  }, [spaces, searchParams])

  const resolveUserNames = async (msgs: HelpMsg[]) => {
    const ids = [...new Set(msgs.map(m => m.fromUserId))].filter(id => !userNames[id])
    if (ids.length === 0) return
    try {
      const { data } = await api.get('/api/users')
      const users = data.data ?? data
      if (Array.isArray(users)) {
        const map: Record<number, string> = {}
        users.forEach((u: { id: number; name?: string }) => {
          if (u.name) map[u.id] = u.name
        })
        setUserNames(prev => ({ ...prev, ...map }))
      }
    } catch { /* ignore */ }
  }

  useEffect(() => {
    if (!selected) return
    const loadMsgs = async () => {
      setLoadingMsgs(true)
      try {
        const { data } = await api.get(`/api/help-spaces/${selected.slug}/messages`)
        const payload = data.data ?? data
        const msgs = payload?.messages ?? payload
        const sorted = Array.isArray(msgs) ? msgs.sort((a: HelpMsg, b: HelpMsg) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        ) : []
        setMessages(sorted)
        resolveUserNames(sorted)
      } catch {
        setMessages([])
      } finally {
        setLoadingMsgs(false)
      }
    }
    loadMsgs()
  }, [selected])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!newMsg.trim() || !selected || !user) return
    setSending(true)
    try {
      await api.post(`/api/help-spaces/${selected.slug}/messages`, {
        text: newMsg.trim(),
      })
      setNewMsg('')
      const { data } = await api.get(`/api/help-spaces/${selected.slug}/messages`)
      const payload = data.data ?? data
      const msgs = payload?.messages ?? payload
      setMessages(Array.isArray(msgs) ? msgs.sort((a: HelpMsg, b: HelpMsg) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ) : [])
    } catch {
      /* ignore */
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          {selected ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                type="button"
                onClick={() => setSelected(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: 20,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                <IconArrowLeft size={18} />
              </button>
              {selected.title}
            </div>
          ) : (
            'Ayuda académica'
          )}
        </div>
      </div>

      {!selected && !loadingSpaces && spaces.length > 0 ? (
        <p style={{ padding: '0 16px 12px', margin: 0, fontSize: 14, color: 'var(--text-muted)' }}>
          Elige un espacio para abrir el chat de ese tema.
        </p>
      ) : null}

      {!selected ? (
        loadingSpaces ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : spaces.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">Sin espacios</div>
            <p>No hay espacios de ayuda disponibles.</p>
          </div>
        ) : (
          <div className="conversation-list">
            {spaces.map((s) => (
              <div
                key={s.slug}
                className="conversation-item"
                onClick={() => setSelected(s)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setSelected(s)
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="conversation-item-info">
                  <div className="conversation-item-name">{s.title}</div>
                  <div className="conversation-item-preview">{s.description}</div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="chat-area" style={{ height: 'calc(100vh - 57px)' }}>
          <p style={{ padding: '8px 16px', margin: 0, fontSize: 13, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
            {selected.description}
          </p>
          <div className="chat-messages">
            {loadingMsgs ? (
              <div className="loading-spinner" style={{ padding: 24 }}><div className="spinner" /></div>
            ) : messages.length === 0 ? (
              <div className="empty-state">
                <p>Sin mensajes aún. {user ? 'Sé el primero en pedir ayuda.' : 'Inicia sesión para escribir.'}</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`chat-bubble ${msg.fromUserId === Number(user?.id) ? 'sent' : 'received'}`}>
                  <div style={{ fontSize: 11, opacity: 0.75, marginBottom: 4 }}>{msg.fromUserName || userNames[msg.fromUserId] || `Usuario ${msg.fromUserId}`}</div>
                  {msg.text}
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>
          <div className="chat-input-area">
            {user ? (
              <>
                <input
                  type="text"
                  placeholder="Pedir ayuda o responder..."
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={sending}
                />
                <button type="button" className="chat-send-btn" onClick={handleSend} disabled={!newMsg.trim() || sending}>
                  <IconSend size={16} />
                </button>
              </>
            ) : (
              <p style={{ margin: 0, padding: '12px 16px', color: 'var(--text-muted)' }}>
                Inicia sesión para publicar en este espacio.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  )
}