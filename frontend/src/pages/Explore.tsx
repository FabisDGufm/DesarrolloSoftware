import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { PostCard } from '../components/PostCard'

interface Item {
  authorId: number
  postId: string
  text: string
  imageUrl?: string | null
  createdAt: string
  authorName?: string
  type?: 'announcement'
}

type Tab = 'posts' | 'news' | 'announcements'

export function Explore() {
  const [tab, setTab] = useState<Tab>('posts')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)

  const [showModal, setShowModal] = useState(false)
  const [announcementText, setAnnouncementText] = useState('')

  useEffect(() => {
    setResults([])
    setQuery('')
    setShowModal(false)

    if (tab === 'news') {
      loadNews()
    }

    if (tab === 'announcements') {
      loadAnnouncements()
    }
  }, [tab])

  useEffect(() => {
    if (tab !== 'posts') return

    if (!query.trim()) {
      setResults([])
      return
    }

    const timeout = setTimeout(() => {
      searchPosts()
    }, 400)

    return () => clearTimeout(timeout)
  }, [query, tab])

  const searchPosts = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/explore/search', {
        params: { q: query }
      })

      setResults(Array.isArray(data.data) ? data.data : [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const loadNews = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/news/guatemala')
      setResults(Array.isArray(data.data) ? data.data : [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const loadAnnouncements = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/announcements')
      setResults(Array.isArray(data.data) ? data.data : [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const createAnnouncement = async () => {
    if (!announcementText.trim()) return

    setLoading(true)

    try {
      await api.post('/api/announcements', {
        text: announcementText,
        imageUrl: null
      })

      setAnnouncementText('')
      setShowModal(false)

      loadAnnouncements()
    } catch {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="page-header">

        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={tab !== 'posts'}
          />
        </div>

        <div className="page-tabs">
          <button
            className={`page-tab ${tab === 'posts' ? 'active' : ''}`}
            onClick={() => setTab('posts')}
          >
            Posts
          </button>

          <button
            className={`page-tab ${tab === 'news' ? 'active' : ''}`}
            onClick={() => setTab('news')}
          >
            Noticias
          </button>

          <button
            className={`page-tab ${tab === 'announcements' ? 'active' : ''}`}
            onClick={() => setTab('announcements')}
          >
            Anuncios
          </button>
        </div>
      </div>

      {tab === 'announcements' && (
        <div style={{ padding: '10px 0', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="page-tab active"
            style={{
              cursor: 'pointer',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '10px'
            }}
            onClick={() => setShowModal(true)}
          >
            + Publicar anuncio
          </button>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <textarea
              placeholder="Escribe tu anuncio..."
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              style={{ width: '100%', minHeight: '120px' }}
            />

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button onClick={createAnnouncement}>
                Publicar
              </button>

              <button onClick={() => setShowModal(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner" />
        </div>
      ) : results.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">Sin resultados</div>
        </div>
      ) : (
        results.map((r) => (
          <PostCard
            key={`${r.authorId}-${r.postId}`}
            authorId={r.authorId}
            postId={r.postId}
            authorName={r.authorName}
            text={r.text}
            imageUrl={r.imageUrl}
            createdAt={r.createdAt}
          />
        ))
      )}
    </>
  )
}