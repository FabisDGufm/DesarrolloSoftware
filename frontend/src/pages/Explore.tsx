import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { PostCard } from '../components/PostCard'

interface SearchResult {
  authorId: number
  postId: string
  text: string
  imageUrl?: string | null
  createdAt: string
  authorName?: string
  type?: 'post' | 'news' | 'announcement'
}

type Tab = 'posts' | 'news' | 'announcements'

export function Explore() {
  const [tab, setTab] = useState<Tab>('posts')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // 🔥 RESET TOTAL al cambiar tab (evita “sticky results”)
  useEffect(() => {
    setResults([])
    setQuery('')
    setHasSearched(false)

    if (tab === 'news') {
      loadNews()
    }
  }, [tab])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setHasSearched(false)
      return
    }

    const timeout = setTimeout(() => {
      handleSearch()
    }, 400)

    return () => clearTimeout(timeout)
  }, [query])

  // 🔎 SEARCH POSTS
  const handleSearch = async () => {
    if (!query.trim()) return

    setSearching(true)
    setHasSearched(true)

    try {
      const { data } = await api.get('/api/explore/search', {
        params: { q: query.trim() },
      })

      setResults(Array.isArray(data.data) ? data.data : [])
    } catch {
      setResults([])
    } finally {
      setSearching(false)
    }
  }

  // 📰 NEWS (RSS / Prensa Libre backend)
  const loadNews = async () => {
    setSearching(true)
    setHasSearched(true)

    try {
      const { data } = await api.get('/api/news/guatemala')
      setResults(Array.isArray(data.data) ? data.data : [])
    } catch {
      setResults([])
    } finally {
      setSearching(false)
    }
  }

  // 📢 ANNOUNCEMENTS (vacío backend por ahora)
  const loadAnnouncements = async () => {
    setSearching(true)
    setHasSearched(true)

    try {
      const { data } = await api.get('/api/explore/announcements')
      setResults(Array.isArray(data.data) ? data.data : [])
    } catch {
      setResults([])
    } finally {
      setSearching(false)
    }
  }

  const handleTabClick = (t: Tab) => {
    setTab(t)

    if (t === 'announcements') {
      loadAnnouncements()
    }
  }

  return (
    <>
      {/* HEADER */}
      <div className="page-header">
        <div style={{ padding: '8px 0' }}>
          <div className="search-bar">
            <span className="search-icon">&#128269;</span>
            <input
              type="text"
              placeholder="Buscar en El Pasillo..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* SOLO 3 TABS */}
        <div className="page-tabs">
          <button
            className={`page-tab ${tab === 'posts' ? 'active' : ''}`}
            onClick={() => handleTabClick('posts')}
          >
            Posts
          </button>

          <button
            className={`page-tab ${tab === 'news' ? 'active' : ''}`}
            onClick={() => handleTabClick('news')}
          >
            Noticias
          </button>

          <button
            className={`page-tab ${tab === 'announcements' ? 'active' : ''}`}
            onClick={() => handleTabClick('announcements')}
          >
            Anuncios
          </button>
        </div>
      </div>

      {/* CONTENT */}
      {hasSearched ? (
        searching ? (
          <div className="loading-spinner">
            <div className="spinner" />
          </div>
        ) : results.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">Sin resultados</div>
            <p>No hay contenido disponible</p>
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
        )
      ) : (
        <div className="empty-state">
          <div className="empty-state-title">
            Explora contenido en El Pasillo
          </div>
          <p>Busca posts, noticias o anuncios</p>
        </div>
      )}
    </>
  )
}