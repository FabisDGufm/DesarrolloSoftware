import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { PostCard } from '../components/PostCard'

interface Post {
  authorId: number
  postId: string
  text: string
  imageUrl?: string | null
  createdAt: string
  authorName?: string
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
          <div className="empty-state-title">Inicia sesion</div>
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
        <div className="empty-state">
          <div className="empty-state-title">Sin guardados</div>
          <p>Toca la estrella en un post para guardarlo y verlo aqui.</p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={`${post.authorId}-${post.postId}`}
            authorId={post.authorId}
            postId={post.postId}
            authorName={post.authorName}
            text={post.text}
            imageUrl={post.imageUrl}
            createdAt={post.createdAt}
          />
        ))
      )}
    </>
  )
}
