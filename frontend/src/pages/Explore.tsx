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
}

type Tab = 'posts' | 'news' | 'announcements'

export function Explore() {
  const [tab, setTab] = useState<Tab>('posts')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // 🔎 SEARCH (independiente del tab)
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setHasSearched(false)
      return
    }

    const timeout = setTimeout(() => {
      handleSearch()
    }, 500)

    return () => clearTimeout(timeout)
  }, [query])

  const handleSearch = async () => {
    if (!query.trim()) return

    setSearching(true)
    setHasSearched(true)

    try {
      const { data } = await api.get('/api/explore/search', {
        params: { q: query.trim() },
      })

      const items = data.data || data
      setResults(Array.isArray(items) ? items : [])
    } catch {
      setResults([])
    } finally {
      setSearching(false)
    }
  }

  // 📂 CARGA POR TAB
  const loadTabContent = async (selectedTab: Tab) => {
    setSearching(true)
    setHasSearched(false)
    setResults([])

    try {
      let url = ''

      // 🧱 POSTS (explorar general)
      if (selectedTab === 'posts') {
        url = '/api/explore/browse/posts'
      }

      // 📰 NOTICIAS (RSS PRIMERO / PRIMAFORMA ORIGINAL)
      if (selectedTab === 'news') {
        url = '/api/news/feed' // 👈 ESTE ES EL IMPORTANTE (Prensa Libre / RSS)
      }

      // 📢 ANUNCIOS (vacío por ahora)
      if (selectedTab === 'announcements') {
        setResults([])
        setSearching(false)
        return
      }

      const { data } = await api.get(url)

      const items = data.data || data
      setResults(Array.isArray(items) ? items : [])
    } catch {
      setResults([])
    } finally {
      setSearching(false)
    }
  }

  useEffect(() => {
    loadTabContent(tab)
  }, [tab])

  return (
    <>
      {/* HEADER */}
      <div className="page-header">
        <div style={{ padding: '8px 0' }}>
          <div className="search-bar" style={{ marginBottom: 0 }}>
            <span className="search-icon">&#128269;</span>
            <input
              type="text"
              placeholder="Buscar en El Pasillo"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
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

      {/* CONTENT */}
      {hasSearched ? (
        searching ? (
          <div className="loading-spinner">
            <div className="spinner" />
          </div>
        ) : results.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">Sin resultados</div>
            <p>Intenta con otra busqueda</p>
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
      ) : searching ? (
        <div className="loading-spinner">
          <div className="spinner" />
        </div>
      ) : results.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">
            {tab === 'announcements'
              ? 'Sin anuncios'
              : tab === 'news'
              ? 'Cargando noticias...'
              : 'Sin contenido'}
          </div>

          <p>
            {tab === 'announcements'
              ? 'Aún no hay anuncios disponibles'
              : tab === 'news'
              ? 'Cargando noticias desde fuentes externas...'
              : 'Explora contenido en esta sección'}
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