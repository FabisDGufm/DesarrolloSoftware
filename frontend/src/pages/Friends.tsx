import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { useAuthStore } from '../stores/authStore'

interface User {
  id: number
  name: string
  university?: string
}

interface FriendRequest {
  id: string
  requesterId: number
  receiverId: number
  status: string
  requesterName?: string
}

export function Friends() {
  const { user } = useAuthStore()
  const [users, setUsers] = useState<User[]>([])
  const [requests, setRequests] = useState<FriendRequest[]>([])
  const [friends, setFriends] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'discover' | 'requests' | 'friends'>('discover')
  const [sending, setSending] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [sentRequests, setSentRequests] = useState<number[]>([])

  useEffect(() => {
    loadAll()
  }, [])

  

  const loadAll = async () => {
    setLoading(true)
    try {
      const [usersRes, requestsRes, friendsRes, sentRes] = await Promise.all([
        api.get('/api/users'),
        api.get(`/api/user-relations/${Number(user?.id)}/friend-requests/received`),
api.get(`/api/user-relations/${Number(user?.id)}/friends`),
api.get(`/api/user-relations/${Number(user?.id)}/friend-requests/sent`),
      ])

      const allUsers: User[] = usersRes.data.data || []
      setUsers(allUsers.filter((u: User) => u.id !== Number(user?.id)))
      setRequests(requestsRes.data.data || requestsRes.data || [])

      const friendIds: number[] = friendsRes.data.data || friendsRes.data || []
      const friendUsers = allUsers.filter((u: User) => friendIds.includes(u.id))
      setFriends(friendUsers)

      const sentIds = (sentRes.data.data || sentRes.data || []).map((r: FriendRequest) => r.receiverId)
      setSentRequests(sentIds)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const sendRequest = async (targetId: number) => {
    setSending(targetId)
    try {
      await api.post(`/api/user-relations/${Number(user?.id)}/friend-request/${targetId}`)
      setSentRequests(prev => [...prev, targetId])
    } catch (e) {
      console.error(e)
    } finally {
      setSending(null)
    }
  }

  const acceptRequest = async (requestId: string) => {
    try {
      await api.post(`/api/user-relations/friend-request/${requestId}/accept`)
      loadAll()
    } catch (e) {
      console.error(e)
    }
  }

  const rejectRequest = async (requestId: string) => {
    try {
      await api.post(`/api/user-relations/friend-request/${requestId}/reject`)
      loadAll()
    } catch (e) {
      console.error(e)
    }
  }

  const isFriend = (id: number) => friends.some((f) => f.id === id)
  const hasSentRequest = (id: number) => sentRequests.includes(id)

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    (u.university || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <div className="page-header">
        <div className="page-title">Amigos</div>
        <div className="page-tabs">
          <button className={`page-tab ${tab === 'discover' ? 'active' : ''}`} onClick={() => setTab('discover')}>
            Descubrir
          </button>
          <button className={`page-tab ${tab === 'requests' ? 'active' : ''}`} onClick={() => setTab('requests')}>
            Solicitudes {requests.length > 0 && `(${requests.length})`}
          </button>
          <button className={`page-tab ${tab === 'friends' ? 'active' : ''}`} onClick={() => setTab('friends')}>
            Mis Amigos
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : tab === 'discover' ? (
        <div>
          <div style={{ padding: '12px 16px' }}>
            <input
              type="text"
              placeholder="Buscar por nombre o universidad..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 14, boxSizing: 'border-box' }}
            />
          </div>
          {filteredUsers.map((u) => (
            <div key={u.id} className="post-card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="avatar">{(u.name || '?')[0].toUpperCase()}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{u.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.university || 'Universidad'}</div>
              </div>
              {isFriend(u.id) ? (
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Amigos</span>
              ) : hasSentRequest(u.id) ? (
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Enviado</span>
              ) : (
                <button className="btn-follow follow" onClick={() => sendRequest(u.id)} disabled={sending === u.id}>
                  {sending === u.id ? '...' : 'Agregar'}
                </button>
              )}
            </div>
          ))}
        </div>
      ) : tab === 'requests' ? (
        <div>
          {requests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-title">Sin solicitudes</div>
              <p>No tienes solicitudes pendientes.</p>
            </div>
          ) : (
            requests.map((r) => (
              <div key={r.id} className="post-card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="avatar">{(r.requesterName || '?')[0].toUpperCase()}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{r.requesterName || `Usuario ${r.requesterId}`}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Quiere ser tu amigo</div>
                </div>
                <button className="btn-follow follow" onClick={() => acceptRequest(r.id)} style={{ marginRight: 8 }}>
                  Aceptar
                </button>
                <button className="btn-follow" onClick={() => rejectRequest(r.id)}>
                  Rechazar
                </button>
              </div>
            ))
          )}
        </div>
      ) : (
        <div>
          {friends.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-title">Sin amigos aún</div>
              <p>Agrega amigos desde Descubrir.</p>
            </div>
          ) : (
            friends.map((f) => (
              <div key={f.id} className="post-card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="avatar">{(f.name || '?')[0].toUpperCase()}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{f.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{f.university || 'Universidad'}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </>
  )
}