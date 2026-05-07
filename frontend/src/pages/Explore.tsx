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
     RESET POR TAB
  ========================= */
  useEffect(() => {
    setResults([])
    setQuery('')
    setShowModal(false)

    if (tab === 'news') loadNews()
    if (tab === 'announcements') loadAnnouncements()
  }, [tab])

  /* =========================
     SEARCH POSTS (REAL BACKEND)
  ========================= */
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
      const { data } = await api.get('/api/posts/search', {
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
  const isAnnouncement = (r: any): r is AnnouncementItem => 'announcementId' in r

  /* =========================
     UI
  ========================= */
  return (
    <>
      {/* HEADER */}
      <div className="page-header">

        {/* SEARCH SOLO POSTS */}
        {tab === 'posts' && (
          <div className="search-bar">
            <span>🔍</span>
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
            className={tab === 'posts' ? 'active' : ''}
            onClick={() => setTab('posts')}
          >
            Posts
          </button>

          <button
            className={tab === 'news' ? 'active' : ''}
            onClick={() => setTab('news')}
          >
            Noticias
          </button>

          <button
            className={tab === 'announcements' ? 'active' : ''}
            onClick={() => setTab('announcements')}
          >
            Anuncios
          </button>
        </div>
      </div>

      {/* BOTÓN CREAR ANUNCIO */}
      {tab === 'announcements' && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 0' }}>
          <button onClick={() => setShowModal(true)}>
            + Publicar anuncio
          </button>
        </div>
      )}

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
              placeholder="Texto del anuncio"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
            />

            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowModal(false)}>
                Cancelar
              </button>

              <button onClick={createAnnouncement}>
                Publicar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CONTENT */}
      {loading ? (
        <div>Cargando...</div>
      ) : results.length === 0 ? (
        <div>Sin resultados</div>
      ) : (
        results.map((r) => {
          if (isPost(r)) {
            return (
              <PostCard
                key={r.postId}
                authorId={r.authorId}
                postId={r.postId}
                authorName={r.authorName}
                text={r.text}
                imageUrl={r.imageUrl}
                createdAt={r.createdAt}
                variant={tab === 'news' ? 'news' : 'post'}
              />
            )
          }

          if (isAnnouncement(r)) {
            return (
              <div key={r.announcementId} className="post-card">
                <h3>{r.title}</h3>
                <p>{r.text}</p>

                {r.eventDate && <small>{r.eventDate}</small>}
                <small>{r.university}</small>
              </div>
            )
          }

          return null
        })
      )}
    </>
  )
}