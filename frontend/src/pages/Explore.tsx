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
  const [loading, setLoading] = useState(false)

  // 🔥 RESET AL CAMBIAR TAB
  useEffect(() => {
    setResults([])
    setQuery('')

    if (tab === 'news') {
      loadNews()
    }

    if (tab === 'announcements') {
      loadAnnouncements()
    }
  }, [tab])

  // 🔎 SEARCH SOLO POSTS
  useEffect(() => {
    if (tab !== 'posts') return

    if (!query.trim()) {
      setResults([])
      return
    }

    const timeout = setTimeout(() => {
      handleSearch()
    }, 400)

    return () => clearTimeout(timeout)
  }, [query, tab])

  const handleSearch = async () => {
    if (!query.trim()) return

    setLoading(true)

    try {
      const { data } = await api.get('/api/explore/search', {
        params: { q: query.trim() },
      })

      setResults(Array.isArray(data.data) ? data.data : [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  // 📰 NEWS (Prensa Libre / RSS backend)
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

  // 📢 ANNOUNCEMENTS
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

  const handleTab = (newTab: Tab) => {
    setTab(newTab)
  }

  return (
    <>
      {/* HEADER */}
      <div className="page-header">
        <div className="search-bar" style={{ marginBottom: 10 }}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar posts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={tab !== 'posts'}
          />
        </div>

        {/* TABS */}
        <div className="page-tabs">
          <button
            className={`page-tab ${tab === 'posts' ? 'active' : ''}`}
            onClick={() => handleTab('posts')}
          >
            Posts
          </button>

          <button
            className={`page-tab ${tab === 'news' ? 'active' : ''}`}
            onClick={() => handleTab('news')}
          >
            Noticias
          </button>

          <button
            className={`page-tab ${tab === 'announcements' ? 'active' : ''}`}
            onClick={() => handleTab('announcements')}
          >
            Anuncios
          </button>
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner" />
        </div>
      ) : results.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">
            {tab === 'posts'
              ? 'Busca posts'
              : tab === 'news'
              ? 'No hay noticias'
              : 'No hay anuncios'}
          </div>
          <p>
            {tab === 'posts'
              ? 'Escribe algo para buscar'
              : 'Intenta más tarde'}
          </p>
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