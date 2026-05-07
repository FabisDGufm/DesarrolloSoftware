import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { PostCard } from '../components/PostCard'
import { NewsCard } from '../components/NewsCard'
import { IconSearch } from '../components/Icons'

const MONTHS_ES = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC']

function parseDate(dateStr: string) {
  const d = new Date(dateStr)
  return {
    day: String(d.getDate()).padStart(2, '0'),
    month: MONTHS_ES[d.getMonth()] || '',
    full: d.toLocaleDateString('es-GT', { day: 'numeric', month: 'long', year: 'numeric' }),
  }
}

interface PostItem {
  authorId: number
  postId: string
  text: string
  imageUrl?: string | null
  createdAt: string
  authorName?: string
  authorPhoto?: string
  type?: 'normal' | 'news' | 'announcement'
  university?: string | null
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
  const [allPosts, setAllPosts] = useState<PostItem[]>([])   // cache completo
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
     BÚSQUEDA EN TIEMPO REAL
     Filtra sobre el cache local, sin llamadas extra
  ========================= */
  useEffect(() => {
    if (tab !== 'posts') return

    const q = query.trim().toLowerCase()

    if (!q) {
      setResults(allPosts)
      return
    }

    const filtered = allPosts.filter((p) =>
      p.text?.toLowerCase().includes(q) ||
      p.authorName?.toLowerCase().includes(q)
    )

    setResults(filtered)
  }, [query, allPosts, tab])

  /* =========================
     POSTS — carga desde /api/posts/
     que usa getAllPosts → repo.findAll()
  ========================= */
  const loadAllPosts = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/posts/')
      
      // Filtrar solo posts normales (excluir news/announcements internos)
      const posts: PostItem[] = (
        Array.isArray(data.data) ? data.data : []
      ).filter(
        (p: PostItem) => p.type === 'normal' || !p.type
      )

      setAllPosts(posts)
      setResults(posts)
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

      const normalized = (data.data || []).map((n: any) => ({
        title: n.title,
        description: n.description || n.text,
        imageUrl: n.imageUrl,
        url: n.url,
        publishedAt: n.publishedAt,
        source: n.source,
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
        imageUrl: null,
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
            <span className="search-icon"><IconSearch size={16} /></span>
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

      {/* BOTON ANUNCIOS */}
      {tab === 'announcements' && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 20px' }}>
          <button
            onClick={() => setShowModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              border: '1px solid var(--accent)',
              borderRadius: 'var(--r-md)',
              background: 'transparent',
              color: 'var(--accent)',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-soft)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            + Publicar anuncio
          </button>
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Publicar anuncio</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Titulo</label>
                <input
                  placeholder="Titulo del anuncio"
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  placeholder="Escribe tu anuncio..."
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className="form-group">
                <label>Fecha del evento (opcional)</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setShowModal(false)} style={{ width: 'auto', marginTop: 0, padding: '8px 18px' }}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={createAnnouncement} disabled={!announcementTitle.trim() || !announcementText.trim()} style={{ width: 'auto', marginTop: 0, padding: '8px 18px' }}>
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
          <div className="empty-state-title">
            {tab === 'posts' && query
              ? `Sin resultados para "${query}"`
              : 'Sin resultados'}
          </div>
        </div>
      ) : (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {results.map((r, i) => {
            if (isPost(r)) {
              return (
                <PostCard
                  key={`post-${r.authorId}-${r.postId}`}
                  authorId={r.authorId}
                  postId={r.postId}
                  authorName={r.authorName}
                  authorPhoto={r.authorPhoto}
                  text={r.text}
                  imageUrl={r.imageUrl}
                  createdAt={r.createdAt}
                />
              )
            }

            if (isAnnouncement(r)) {
              const date = r.eventDate ? parseDate(r.eventDate) : r.createdAt ? parseDate(r.createdAt) : null
              return (
                <div
                  key={`ann-${r.announcementId}`}
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--r-md)',
                    padding: '16px 20px',
                    transition: 'background 0.15s, border-color 0.15s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-surface)'
                    e.currentTarget.style.borderColor = 'var(--border-strong)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--bg-tertiary)'
                    e.currentTarget.style.borderColor = 'var(--border-color)'
                  }}
                >
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    {date && (
                      <div style={{
                        flexShrink: 0,
                        width: 56,
                        height: 56,
                        borderRadius: 'var(--r-sm)',
                        background: 'var(--accent-soft)',
                        border: '1px solid rgba(232, 168, 56, 0.25)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 4,
                      }}>
                        <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>{date.day}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>{date.month}</span>
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 17,
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        margin: 0,
                        letterSpacing: '-0.01em',
                        lineHeight: 1.3,
                      }}>{r.title}</h3>
                      <p style={{
                        fontSize: 14,
                        color: 'var(--text-secondary)',
                        margin: '4px 0 0',
                        lineHeight: 1.45,
                      }}>{r.text}</p>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 16,
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: '1px solid var(--border-color)',
                  }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                      {r.university}
                    </span>
                    {date && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                        {date.full}
                      </span>
                    )}
                  </div>
                </div>
              )
            }

            if (isNews(r)) {
              return (
                <NewsCard
                  key={`news-${i}`}
                  title={r.title ?? ''}
                  description={r.description}
                  imageUrl={r.imageUrl}
                  url={r.url}
                  publishedAt={r.publishedAt}
                  source={r.source}
                />
              )
            }

            return null
          })}
        </div>
      )}
    </>
  )
}