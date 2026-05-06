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

const CATEGORIES = [
  { type: 'trending', label: 'Tendencias', desc: 'Lo mas popular ahora' },
  { type: 'university', label: 'Universidades', desc: 'Noticias universitarias' },
  { type: 'tech', label: 'Tecnologia', desc: 'Desarrollo, ciencia e innovacion' },
  { type: 'sports', label: 'Deportes', desc: 'Deporte universitario' },
  { type: 'entertainment', label: 'Entretenimiento', desc: 'Cultura, musica y arte' },
]

export function Explore() {
  const [tab, setTab] = useState('foryou')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

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

  const handleBrowse = async (type: string) => {
    setSearching(true)
    setHasSearched(true)
    setQuery('')
    try {
      const { data } = await api.get(`/api/explore/browse/${type}`)
      const items = data.data || data
      setResults(Array.isArray(items) ? items : [])
    } catch {
      setResults([])
    } finally {
      setSearching(false)
    }
  }

  return (
    <>
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
          {['foryou', 'trending', 'news', 'sports', 'entertainment'].map((t) => (
            <button
              key={t}
              className={`page-tab ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'foryou' && 'Para ti'}
              {t === 'trending' && 'Tendencias'}
              {t === 'news' && 'Noticias'}
              {t === 'sports' && 'Deportes'}
              {t === 'entertainment' && 'Entretenimiento'}
            </button>
          ))}
        </div>
      </div>

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
      ) : (
        <>
          {CATEGORIES.map((cat) => (
            <div
              key={cat.type}
              className="explore-category"
              onClick={() => handleBrowse(cat.type)}
            >
              <div className="explore-category-title">{cat.label}</div>
              <div className="explore-category-desc">{cat.desc}</div>
            </div>
          ))}
        </>
      )}
    </>
  )
}
