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

type Tab = 'posts' | 'news' | 'announcements'

export function Explore() {
  const [tab, setTab] = useState<Tab>('posts')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const [showModal, setShowModal] = useState(false)
  const [announcementTitle, setAnnouncementTitle] = useState('')
  const [announcementText, setAnnouncementText] = useState('')
  const [eventDate, setEventDate] = useState('')

  /* ================= LOAD ================= */
  useEffect(() => {
    setResults([])
    setQuery('')
    setShowModal(false)

    if (tab === 'news') loadNews()
    if (tab === 'announcements') loadAnnouncements()
  }, [tab])

  /* ================= SEARCH POSTS ================= */
  useEffect(() => {
    if (tab !== 'posts') return

    const timeout = setTimeout(() => {
      searchPosts()
    }, 300)

    return () => clearTimeout(timeout)
  }, [query])

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

  const loadNews = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/news/guatemala')
      setResults(Array.isArray(data.data) ? data.data : [])
    } finally {
      setLoading(false)
    }
  }

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
    if (!announcementTitle || !announcementText) return

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

  /* ================= RENDER ================= */
  return (
    <>
      {/* HEADER */}
      <div className="page-header">

        {tab === 'posts' && (
          <div className="search-bar">
            <span>🔍</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar posts..."
            />
          </div>
        )}

        <div className="page-tabs">
          <button onClick={() => setTab('posts')}>Posts</button>
          <button onClick={() => setTab('news')}>Noticias</button>
          <button onClick={() => setTab('announcements')}>Anuncios</button>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">

            <input
              placeholder="Título"
              value={announcementTitle}
              onChange={(e) => setAnnouncementTitle(e.target.value)}
            />

            <textarea
              placeholder="Texto"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
            />

            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />

            <button onClick={createAnnouncement}>Publicar</button>
            <button onClick={() => setShowModal(false)}>Cancelar</button>

          </div>
        </div>
      )}

      {/* CONTENT */}
      {loading ? (
        <div>Cargando...</div>
      ) : results.length === 0 ? (
        <div>Sin resultados</div>
      ) : tab === 'posts' ? (
        /* ================= POSTS ================= */
        results.map((r: PostItem) => (
          <PostCard
            key={r.postId}
            authorId={r.authorId}
            postId={r.postId}
            authorName={r.authorName}
            text={r.text}
            imageUrl={r.imageUrl}
            createdAt={r.createdAt}
          />
        ))
      ) : tab === 'news' ? (
        /* ================= NEWS (SIN POSTCARD) ================= */
        results.map((r: any) => (
          <div key={r.createdAt} className="post-card">

            <div className="post-header">
              <span className="post-author">
                {typeof r.authorName === 'string' ? r.authorName : 'Noticia'}
              </span>

              <span className="post-time">
                {new Date(r.createdAt).toLocaleString()}
              </span>
            </div>

            <div className="post-text">{r.text}</div>

            {r.imageUrl && (
              <div className="post-image">
                <img src={r.imageUrl} />
              </div>
            )}
          </div>
        ))
      ) : (
        /* ================= ANNOUNCEMENTS ================= */
        results.map((r: AnnouncementItem) => (
          <div key={r.announcementId} className="post-card">
            <h3>{r.title}</h3>
            <p>{r.text}</p>
            {r.eventDate && <small>{r.eventDate}</small>}
            <small>{r.university}</small>
          </div>
        ))
      )}
    </>
  )
}