import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { PostCard } from '../components/PostCard'

/* =========================
   POSTS
========================= */
interface PostItem {
  authorId: number
  postId: string
  text: string
  imageUrl?: string | null
  createdAt: string
  authorName?: string
}

/* =========================
   ANNOUNCEMENTS
========================= */
interface AnnouncementItem {
  university: string
  announcementId: string
  title: string
  text: string
  imageUrl?: string | null
  eventDate?: string
  createdAt: string
  createdBy: number
}

/* =========================
   UNION TYPE
========================= */
type Item = PostItem | AnnouncementItem

type Tab = 'posts' | 'news' | 'announcements'

export function Explore() {
  const [tab, setTab] = useState<Tab>('posts')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)

  const [showModal, setShowModal] = useState(false)

  const [announcementTitle, setAnnouncementTitle] = useState('')
  const [announcementText, setAnnouncementText] = useState('')
  const [eventDate, setEventDate] = useState('')

  /* =========================
     EFFECT: TAB CHANGE
  ========================= */
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

  /* =========================
     SEARCH POSTS ONLY
  ========================= */
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

  /* =========================
     POSTS SEARCH
  ========================= */
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

  /* =========================
     NEWS
  ========================= */
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

  /* =========================
     ANNOUNCEMENTS
  ========================= */
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

  /* =========================
     CREATE ANNOUNCEMENT
  ========================= */
  const createAnnouncement = async () => {
    if (!announcementTitle.trim() || !announcementText.trim()) return

    setLoading(true)

    try {
      await api.post('/api/announcements', {
        title: announcementTitle,
        text: announcementText,
        eventDate: eventDate || undefined,
        imageUrl: null
      })

      setAnnouncementTitle('')
      setAnnouncementText('')
      setEventDate('')
      setShowModal(false)

      loadAnnouncements()
    } catch {
      setLoading(false)
    }
  }

  /* =========================
     TYPE GUARD
  ========================= */
  const isPost = (r: any): r is PostItem => {
    return 'postId' in r
  }

  const isAnnouncement = (r: any): r is AnnouncementItem => {
    return 'announcementId' in r
  }

  /* =========================
     UI
  ========================= */
  return (
    <>
      {/* HEADER */}
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

      {/* BUTTON CREATE */}
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

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">

            <input
              placeholder="Título del anuncio"
              value={announcementTitle}
              onChange={(e) => setAnnouncementTitle(e.target.value)}
            />

            <textarea
              placeholder="Escribe tu anuncio..."
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
            />

            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
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

      {/* LOADING */}
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner" />
        </div>
      ) : results.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">Sin resultados</div>
        </div>
      ) : (
        results.map((r) => {
          /* =========================
             POSTS
          ========================= */
          if (isPost(r)) {
            return (
              <PostCard
                key={`${r.authorId}-${r.postId}`}
                authorId={r.authorId}
                postId={r.postId}
                authorName={r.authorName}
                text={r.text}
                imageUrl={r.imageUrl}
                createdAt={r.createdAt}
              />
            )
          }

          /* =========================
             ANNOUNCEMENTS
          ========================= */
          if (isAnnouncement(r)) {
            return (
              <div key={r.announcementId} className="post-card">
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                  {r.title}
                </div>

                <div style={{ marginBottom: '10px' }}>
                  {r.text}
                </div>

                {r.eventDate && (
                  <div style={{ fontSize: '12px', opacity: 0.7 }}>
                    Fecha: {r.eventDate}
                  </div>
                )}

                <div style={{ fontSize: '12px', opacity: 0.6 }}>
                  Universidad: {r.university}
                </div>
              </div>
            )
          }

          return null
        })
      )}
    </>
  )
}