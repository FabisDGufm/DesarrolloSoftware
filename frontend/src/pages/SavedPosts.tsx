import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { PostCard } from '../components/PostCard'
import { IconStar } from '../components/Icons'

interface Post {
  authorId: number
  postId: string
  text: string
  imageUrl?: string | null
  createdAt: string
  authorName?: string
  authorPhoto?: string
}

export function SavedPosts() {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api.get('/api/interactions/me/saved-posts')
        const raw = data.data ?? data
        if (!cancelled) setPosts(Array.isArray(raw) ? raw : [])
      } catch {
        if (!cancelled) setPosts([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

  return (
    <>
      <div className="page-header">
        <div className="page-title">Guardados</div>
      </div>

      {!isAuthenticated ? (
        <div className="empty-state">
          <div className="empty-state-title">Inicia sesión</div>
          <p>Aqui aparecen los posts que marcaste con la estrella.</p>
          <button type="button" className="btn-primary" onClick={() => navigate('/login')}>
            Ir a login
          </button>
        </div>
      ) : loading ? (
        <div className="loading-spinner">
          <div className="spinner" />
        </div>
      ) : posts.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', textAlign: 'center' }}>
          <div style={{ marginBottom: 16, color: 'var(--text-tertiary)' }}><IconStar size={48} /></div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Aún no guardas nada</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 320, lineHeight: 1.5 }}>Cuando veas un post que quieras volver a leer, toca la estrella y aparecerá aquí.</div>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={`${post.authorId}-${post.postId}`}
            authorId={post.authorId}
            postId={post.postId}
            authorName={post.authorName}
            authorPhoto={post.authorPhoto}
            text={post.text}
            imageUrl={post.imageUrl}
            createdAt={post.createdAt}
          />
        ))
      )}
    </>
  )
}
