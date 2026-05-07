import { useState, useEffect, useRef } from 'react'
import { api } from '../services/api'
import { useAuthStore } from '../stores/authStore'

interface Friend {
  id: number
  name: string
  profilePhoto?: string
}

interface Message {
  id: string
  fromUserId: number
  toUserId: number
  text: string
  createdAt: string
}

const S3_BASE = 'https://social-media-ufm-elpasillo.s3.amazonaws.com'

function Avatar({ name, photo, size }: { name?: string; photo?: string; size?: string }) {
  const src = photo ? (photo.startsWith('http') ? photo : `${S3_BASE}/${photo}`) : undefined
  if (src) {
    return (
      <div className={`avatar ${size || ''}`}>
        <img src={src} alt={name || ''} />
      </div>
    )
  }
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

  useEffect(() => {
  if (!selectedFriend) return
  const interval = setInterval(() => {
    loadConversation(selectedFriend.id)
  }, 1000)
  return () => clearInterval(interval)
}, [selectedFriend])

  const loadFriends = async () => {
    setLoading(true)
    try {
      const [relRes, usersRes] = await Promise.all([
        api.get(`/api/user-relations/${Number(user!.id)}/friends`),
        api.get('/api/users')
      ])
      const friendIds: number[] = relRes.data.data || relRes.data || []
      const allUsers = usersRes.data.data || []
      const friendUsers = allUsers.filter((u: Friend) => friendIds.includes(u.id))
      setFriends(friendUsers)
    } catch {
      setFriends([])
    } finally {
      setLoading(false)
    }
  }

  const loadConversation = async (otherUserId: number) => {
    try {
      const { data } = await api.get(`/api/messages/with/${otherUserId}`)
      const payload = data.data ?? data
      const msgs = payload?.messages ?? payload
      setMessages(Array.isArray(msgs) ? msgs.sort((a: Message, b: Message) => 
  new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
) : [])
    } catch {
      setMessages([])
    }
  }

  const handleSend = async () => {
    if (!newMsg.trim() || !selectedFriend || !user) return
    setSending(true)
    try {
      await api.post('/api/messages', {
        toUserId: selectedFriend.id,
        text: newMsg.trim(),
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
                <Avatar name={friend.name} photo={friend.profilePhoto} size="avatar-lg" />
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
                className={`chat-bubble ${msg.fromUserId === Number(user.id) ? 'sent' : 'received'}`}
              >
                {msg.text}
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
