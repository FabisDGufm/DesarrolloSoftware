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
  title?: string
  description?: string
  text?: string
  imageUrl?: string
  url?: string
  publishedAt?: string
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
     POSTS SEARCH
  ========================= */
  useEffect(() => {
    if (tab !== 'posts') return

    const timeout = setTimeout(() => {
      if (!query.trim()) {
        loadAllPosts()
      } else {
        searchPosts()
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [query, tab])

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
     NEWS (SOLO DISPLAY LIMPIO)
  ========================= */
  const loadNews = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/news/guatemala')

      const normalized =
        (data.data || []).map((n: any) => ({
          title: n.title,
          description: n.description || n.text,
          imageUrl: n.imageUrl,
          url: n.url,
          publishedAt: n.publishedAt
        }))

      setResults(normalized)
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

  const isPost = (r: any): r is PostItem => 'postId' in r
  const isAnnouncement = (r: any): r is AnnouncementItem =>
    'announcementId' in r
  const isNews = (r: any): r is NewsItem =>
    'title' in r && !('postId' in r) && !('announcementId' in r)

  /* =========================
     UI
  ========================= */
  return (
    <>
      {/* HEADER (IDÉNTICO AL TUYO) */}
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

      {/* BOTÓN ANUNCIOS */}
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

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ borderRadius: '16px', padding: '18px' }}>
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

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)}>Cancelar</button>
              <button onClick={createAnnouncement}>Publicar</button>
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
        results.map((r, i) => {
          if (isPost(r)) {
            return (
              <PostCard
                key={`post-${r.authorId}-${r.postId}`}
                authorId={r.authorId}
                postId={r.postId}
                authorName={r.authorName}
                text={r.text}
                imageUrl={r.imageUrl}
                createdAt={r.createdAt}
              />
            )
          }

          if (isAnnouncement(r)) {
            return (
              <div key={`ann-${r.announcementId}`} className="post-card">
                <h3>{r.title}</h3>
                <p>{r.text}</p>
                {r.eventDate && <small>Fecha: {r.eventDate}</small>}
                <br />
                <small>Universidad: {r.university}</small>
              </div>
            )
          }

          if (isNews(r)) {
            return (
              <div key={`news-${i}`} className="post-card">
                <h3>{r.title}</h3>
                <p>{r.description}</p>

                {r.imageUrl && (
                  <img
                    src={r.imageUrl}
                    style={{ width: '100%', borderRadius: 12, marginTop: 10 }}
                  />
                )}

                {r.url && (
                  <a href={r.url} target="_blank">
                    Leer más
                  </a>
                )}

                {r.publishedAt && (
                  <small>{new Date(r.publishedAt).toLocaleString()}</small>
                )}
              </div>
            )
          }

          return null
        })
      )}
    </>
  )
}