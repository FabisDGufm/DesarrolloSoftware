import { useState, useEffect, useRef } from 'react'
import { api } from '../services/api'
import { useAuthStore } from '../stores/authStore'

interface Friend {
  id: number
  name: string
}

interface Message {
  senderId: number
  receiverId: number
  content: string
  createdAt: string
}

function Avatar({ name, size }: { name?: string; size?: string }) {
  const letter = (name || '?')[0]!.toUpperCase()
  return <div className={`avatar ${size || ''}`}>{letter}</div>
}

export function Messages() {
  const { user } = useAuthStore()
  const [friends, setFriends] = useState<Friend[]>([])
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMsg, setNewMsg] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) loadFriends()
  }, [user])

  useEffect(() => {
    if (selectedFriend) loadConversation(selectedFriend.id)
  }, [selectedFriend])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadFriends = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/api/users/${user!.id}/friends`)
      const list = data.data || data
      setFriends(Array.isArray(list) ? list : [])
    } catch {
      setFriends([])
    } finally {
      setLoading(false)
    }
  }

  const loadConversation = async (otherUserId: number) => {
    try {
      const { data } = await api.get(`/api/messages/with/${otherUserId}`)
      const msgs = data.data || data
      setMessages(Array.isArray(msgs) ? msgs : [])
    } catch {
      setMessages([])
    }
  }

  const handleSend = async () => {
    if (!newMsg.trim() || !selectedFriend || !user) return
    setSending(true)
    try {
      await api.post('/api/messages', {
        receiverId: selectedFriend.id,
        content: newMsg.trim(),
      })
      setNewMsg('')
      loadConversation(selectedFriend.id)
    } catch {
      // silently fail
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

  if (!user) {
    return (
      <>
        <div className="page-header">
          <div className="page-title">Mensajes</div>
        </div>
        <div className="empty-state">
          <div className="empty-state-title">Inicia sesion</div>
          <p>Necesitas iniciar sesion para ver tus mensajes</p>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          {selectedFriend ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={() => setSelectedFriend(null)}
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
                &#8592;
              </button>
              {selectedFriend.name}
            </div>
          ) : (
            'Mensajes'
          )}
        </div>
      </div>

      {!selectedFriend ? (
        /* Conversation list */
        loading ? (
          <div className="loading-spinner">
            <div className="spinner" />
          </div>
        ) : friends.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">Sin conversaciones</div>
            <p>Agrega amigos para empezar a chatear</p>
          </div>
        ) : (
          <div className="conversation-list">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="conversation-item"
                onClick={() => setSelectedFriend(friend)}
              >
                <Avatar name={friend.name} size="avatar-lg" />
                <div className="conversation-item-info">
                  <div className="conversation-item-name">{friend.name}</div>
                  <div className="conversation-item-preview">Toca para chatear</div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Chat area */
        <div className="chat-area" style={{ height: 'calc(100vh - 57px)' }}>
          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="empty-state">
                <p>Inicia la conversacion con {selectedFriend.name}</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chat-bubble ${msg.senderId === Number(user.id) ? 'sent' : 'received'}`}
              >
                {msg.content}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="chat-input-area">
            <input
              type="text"
              placeholder="Escribe un mensaje..."
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
            />
            <button
              className="chat-send-btn"
              onClick={handleSend}
              disabled={!newMsg.trim() || sending}
            >
              &#10148;
            </button>
          </div>
        </div>
      )}
    </>
  )
}
