import { useState, useEffect, useRef } from 'react'
import { api } from '../services/api'
import { useAuthStore } from '../stores/authStore'

interface PostCardProps {
  authorId: number
  postId: string
  authorName?: string
  text: string
  imageUrl?: string | null
  createdAt: string
  likesCount?: number
  commentsCount?: number
  repostsCount?: number
  isRepost?: boolean
  repostedAt?: string

  // 🔥 NUEVO
  variant?: 'post' | 'news'
}

interface ApiComment {
  id: string
  userId: number
  text: string
  createdAt: string
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = Math.floor((now - then) / 1000)
  if (diff < 60) return `${diff}s`
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-GT', { month: 'short', day: 'numeric' })
}

function Avatar({ name }: { name?: string }) {
  const letter = (name || '?')[0]!.toUpperCase()
  return <div className="avatar">{letter}</div>
}

export function PostCard({
  authorId,
  postId,
  authorName,
  text,
  imageUrl,
  createdAt,
  likesCount = 0,
  commentsCount = 0,
  repostsCount = 0,
  isRepost = false,
  repostedAt,
  variant = 'post' // 🔥 DEFAULT IMPORTANTE
}: PostCardProps) {
  const { isAuthenticated } = useAuthStore()

  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(likesCount)
  const [reposts, setReposts] = useState(repostsCount)
  const [saved, setSaved] = useState(false)

  const [commentsOpen, setCommentsOpen] = useState(false)
  const [comments, setComments] = useState<ApiComment[]>([])
  const [commentDraft, setCommentDraft] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  const [commentCount, setCommentCount] = useState(commentsCount)

  const [hint, setHint] = useState<string | null>(null)
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const interactionBody = { createdAt }
  const queryCreatedAt = encodeURIComponent(createdAt)

  useEffect(() => setCommentCount(commentsCount), [commentsCount])
  useEffect(() => setLikes(likesCount), [likesCount])
  useEffect(() => setReposts(repostsCount), [repostsCount])

  useEffect(() => {
    return () => {
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current)
    }
  }, [])

  const showHint = (msg: string) => {
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current)
    setHint(msg)
    hintTimerRef.current = setTimeout(() => setHint(null), 2500)
  }

  const loadComments = async () => {
    setLoadingComments(true)
    try {
      const { data } = await api.get(
        `/api/interactions/posts/${authorId}/${postId}/comments?createdAt=${queryCreatedAt}`
      )

      const raw = data.data ?? data
      const list = Array.isArray(raw) ? raw : []

      setComments(list)
      setCommentCount(list.length)
    } catch {
      setComments([])
    } finally {
      setLoadingComments(false)
    }
  }

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isAuthenticated) return

    try {
      if (liked) {
        await api.delete(
          `/api/interactions/posts/${authorId}/${postId}/like`,
          { data: interactionBody }
        )
        setLikes((l) => Math.max(0, l - 1))
      } else {
        await api.post(
          `/api/interactions/posts/${authorId}/${postId}/like`,
          interactionBody
        )
        setLikes((l) => l + 1)
      }

      setLiked(!liked)
    } catch {}
  }

  const handleRepost = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isAuthenticated) return

    try {
      await api.post(
        `/api/interactions/posts/${authorId}/${postId}/repost`,
        interactionBody
      )
      setReposts((n) => n + 1)
      showHint('Republicado')
    } catch {
      showHint('Error al republicar')
    }
  }

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isAuthenticated) return

    try {
      if (saved) {
        await api.delete(
          `/api/interactions/posts/${authorId}/${postId}/save`,
          { data: interactionBody }
        )
      } else {
        await api.post(
          `/api/interactions/posts/${authorId}/${postId}/save`,
          interactionBody
        )
      }

      setSaved(!saved)
    } catch {}
  }

  const toggleComments = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!commentsOpen) {
      setCommentsOpen(true)
      await loadComments()
    } else {
      setCommentsOpen(false)
    }
  }

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated || !commentDraft.trim()) return

    try {
      await api.post(
        `/api/interactions/posts/${authorId}/${postId}/comments`,
        { createdAt, text: commentDraft }
      )

      setCommentDraft('')
      await loadComments()
    } catch {}
  }

  const displayName = authorName || `Usuario ${authorId}`

  return (
    <div className="post-card">
      <Avatar name={displayName} />

      <div className="post-body">
        {isRepost && repostedAt && (
          <div style={{ fontSize: 12, marginBottom: 8 }}>
            Republicado · {timeAgo(repostedAt)}
          </div>
        )}

        <div className="post-header">
          <span className="post-author">{displayName}</span>
          <span className="post-time">{timeAgo(createdAt)}</span>
        </div>

        {text && <div className="post-text">{text}</div>}

        {imageUrl && (
          <div className="post-image">
            <img src={imageUrl} alt="" />
          </div>
        )}

        {/* 🔥 SOLO POSTS TIENEN ACCIONES */}
        {variant === 'post' && (
          <div className="post-actions">
            <button onClick={toggleComments}>
              💬 {commentCount}
            </button>

            <button onClick={handleRepost}>
              🔁 {reposts}
            </button>

            <button onClick={handleLike}>
              {liked ? '❤️' : '🤍'} {likes}
            </button>

            <button onClick={handleSave}>
              ⭐
            </button>

            <button>
              ↗
            </button>
          </div>
        )}

        {hint && (
          <div style={{ fontSize: 12, marginTop: 8 }}>
            {hint}
          </div>
        )}

        {commentsOpen && (
          <div style={{ marginTop: 12 }}>
            {loadingComments ? (
              <div>Cargando comentarios...</div>
            ) : (
              comments.map((c) => (
                <div key={c.id}>
                  <strong>Usuario {c.userId}</strong>: {c.text}
                </div>
              ))
            )}

            {isAuthenticated && (
              <form onSubmit={submitComment}>
                <input
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  placeholder="Escribe un comentario..."
                />
                <button type="submit">Enviar</button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}