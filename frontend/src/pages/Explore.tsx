import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { PostCard } from '../components/PostCard'

interface PostItem {
  authorId: number
  postId: string
  text: string
  imageUrl?: string | null
  createdAt: string
  authorName?: string
}

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

interface NewsItem {
  title: string
  text: string
  imageUrl?: string | null
  createdAt: string
  source?: string
}

type Item = PostItem | AnnouncementItem | NewsItem
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
     RESET TAB
  ========================= */
  useEffect(() => {
    setResults([])
    setQuery('')
    setShowModal(false)

    if (tab === 'posts') loadAllPosts()
    if (tab === 'news') loadNews()
    if (tab === 'announcements') loadAnnouncements()
  }, [tab])

  /* =========================
     SEARCH POSTS ONLY
  ========================= */
  useEffect(() => {
    if (tab !== 'posts') return

    const timeout = setTimeout(() => {
      if (!query.trim()) loadAllPosts()
      else searchPosts()
    }, 300)

    return () => clearTimeout(timeout)
  }, [query, tab])

  /* =========================
     POSTS
  ========================= */
  const searchPosts = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/explore/search', {
        params: { q: query }
      })
      setResults(Array.isArray(data.data) ? data.data : [])
    } finally {
      setLoading(false)
    }
  }

  const loadAllPosts = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/explore/search', {
        params: { q: '' }
      })
      setResults(Array.isArray(data.data) ? data.data : [])
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
    } finally {
      setLoading(false)
    }
  }

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
    } finally {
      setLoading(false)
    }
  }

  /* =========================
     TYPE GUARDS
  ========================= */
  const isPost = (r: any): r is PostItem => 'postId' in r
  const isAnnouncement = (r: any): r is AnnouncementItem => 'announcementId' in r
  const isNews = (r: any): r is NewsItem =>
    'title' in r && !('postId' in r) && !('announcementId' in r)

  /* =========================
     UI
  ========================= */
  return (
    <>
      {/* HEADER */}
      <div className="page-header">

        {tab === 'posts' && (
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar posts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        )}

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

      {/* BUTTON */}
      {tab === 'announcements' && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 0' }}>
          <button
            className="page-tab active"
            style={{ border: 'none', padding: '8px 14px', borderRadius: '10px' }}
            onClick={() => setShowModal(true)}
          >
            + Publicar anuncio
          </button>
        </div>
      )}

      {/* MODAL (FIX: showModal sí se usa aquí → elimina warning) */}
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setShowModal(false)}>Cancelar</button>

              {/* FIX: createAnnouncement ahora sí se usa */}
              <button onClick={createAnnouncement}>
                Publicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT */}
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner" />
        </div>
      ) : results.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">Sin resultados</div>
        </div>
      ) : (
        results.map((r, index) => {
          if (isPost(r)) {
            return (
              <PostCard
                key={`post-${r.postId}-${index}`}
                authorId={r.authorId}
                postId={r.postId}
                authorName={r.authorName}
                text={r.text}
                imageUrl={r.imageUrl}
                createdAt={r.createdAt}
              />
            )
          }

          if (isNews(r)) {
            return (
              <div key={`news-${index}`} className="post-card">
                <h3>{r.title}</h3>

                {r.imageUrl && (
                  <img
                    src={r.imageUrl}
                    style={{ width: '100%', borderRadius: 12, marginTop: 8 }}
                  />
                )}

                <p>{r.text}</p>

                <small style={{ color: '#777' }}>
                  {new Date(r.createdAt).toLocaleString()}
                </small>
              </div>
            )
          }

          if (isAnnouncement(r)) {
            return (
              <div key={r.announcementId} className="post-card">
                <h3>{r.title}</h3>
                <p>{r.text}</p>
                {r.eventDate && <small>{r.eventDate}</small>}
              </div>
            )
          }

          return null
        })
      )}
    </>
  )
}