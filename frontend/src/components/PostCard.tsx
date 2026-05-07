import { useState, useEffect } from 'react'
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
}: PostCardProps) {
  const { isAuthenticated } = useAuthStore()
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(likesCount)
  const [saved, setSaved] = useState(false)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [comments, setComments] = useState<ApiComment[]>([])
  const [commentDraft, setCommentDraft] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  const [commentCount, setCommentCount] = useState(commentsCount)

  const interactionBody = { createdAt }
  const queryCreatedAt = encodeURIComponent(createdAt)

  useEffect(() => {
    setCommentCount(commentsCount)
  }, [commentsCount])

  useEffect(() => {
    let cancelled = false
    const base = `/api/interactions/posts/${authorId}/${postId}`

    const load = async () => {
      try {
        const [likesRes, savesRes] = await Promise.allSettled([
          api.get(`${base}/likes?createdAt=${queryCreatedAt}`),
          isAuthenticated
            ? api.get(`${base}/saves?createdAt=${queryCreatedAt}`)
            : Promise.resolve(null),
        ])
        if (cancelled) return
        if (likesRes.status === 'fulfilled') {
          const raw = likesRes.value.data
          const d = raw?.data ?? raw
          if (d && typeof d === 'object') {
            setLiked(Boolean((d as { likedByMe?: boolean }).likedByMe))
            const c = (d as { count?: number }).count
            setLikes((prev) => (typeof c === 'number' ? c : prev))
          }
        }
        if (
          isAuthenticated &&
          savesRes.status === 'fulfilled' &&
          savesRes.value
        ) {
          const raw = savesRes.value.data
          const d = raw?.data ?? raw
          if (d && typeof d === 'object') {
            setSaved(Boolean((d as { savedByMe?: boolean }).savedByMe))
          }
        }
      } catch {
        /* ignore */
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [authorId, postId, queryCreatedAt, isAuthenticated])

  useEffect(() => {
    setLikes(likesCount)
  }, [likesCount])

  const loadComments = async () => {
    setLoadingComments(true)
    try {
      const { data } = await api.get(
        `/api/interactions/posts/${authorId}/${postId}/comments?createdAt=${queryCreatedAt}`
      )
      const raw = data.data ?? data
      const list = Array.isArray(raw) ? raw : []
      setComments(
        list.map((c: Record<string, unknown>) => ({
          id: String(c.id ?? ''),
          userId: Number(c.userId),
          text: String(c.text ?? ''),
          createdAt:
            typeof c.createdAt === 'string'
              ? c.createdAt
              : String(c.createdAt ?? ''),
        }))
      )
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
    } catch {
      /* ignore */
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
    } catch {
      /* ignore */
    }
  }

  const handleRepost = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isAuthenticated) return
    try {
      await api.post(
        `/api/interactions/posts/${authorId}/${postId}/repost`,
        interactionBody
      )
    } catch {
      /* ignore */
    }
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isAuthenticated) return
    try {
      await api.post(
        `/api/interactions/posts/${authorId}/${postId}/share`,
        interactionBody
      )
    } catch {
      /* ignore */
    }
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
        { createdAt, text: commentDraft.trim() }
      )
      setCommentDraft('')
      await loadComments()
    } catch {
      /* ignore */
    }
  }

  const displayName = authorName || `Usuario ${authorId}`

  return (
    <div className="post-card">
      <Avatar name={displayName} />
      <div className="post-body">
        <div className="post-header">
          <span className="post-author">{displayName}</span>
          <span className="post-dot">·</span>
          <span className="post-time">{timeAgo(createdAt)}</span>
        </div>
        {text && <div className="post-text">{text}</div>}
        {imageUrl && (
          <div className="post-image">
            <img src={imageUrl} alt="" />
          </div>
        )}
        <div className="post-actions">
          <button
            type="button"
            className="post-action comment"
            onClick={toggleComments}
          >
            <span className="action-icon">&#128172;</span>
            {commentCount > 0 && <span>{commentCount}</span>}
          </button>
          <button className="post-action repost" onClick={handleRepost}>
            <span className="action-icon">&#8634;</span>
            {repostsCount > 0 && <span>{repostsCount}</span>}
          </button>
          <button
            type="button"
            className={`post-action like ${liked ? 'active' : ''}`}
            onClick={handleLike}
          >
            <span className="action-icon">{liked ? '\u2665' : '\u2661'}</span>
            {likes > 0 && <span>{likes}</span>}
          </button>
          <button
            type="button"
            className={`post-action save ${saved ? 'active' : ''}`}
            onClick={handleSave}
          >
            <span className="action-icon">{saved ? '\u2605' : '\u2606'}</span>
          </button>
          <button type="button" className="post-action share" onClick={handleShare}>
            <span className="action-icon">&#8599;</span>
          </button>
        </div>

        {commentsOpen && (
          <div
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTop: '1px solid var(--border-color)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {loadingComments ? (
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Cargando comentarios...
              </div>
            ) : comments.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Sin comentarios aun.
              </div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 12px' }}>
                {comments.map((c) => (
                  <li
                    key={c.id}
                    style={{
                      fontSize: 13,
                      marginBottom: 8,
                      lineHeight: 1.4,
                    }}
                  >
                    <strong style={{ color: 'var(--text-secondary)' }}>
                      Usuario {c.userId}
                    </strong>
                    : {c.text}
                  </li>
                ))}
              </ul>
            )}
            {isAuthenticated ? (
              <form onSubmit={submitComment} style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  placeholder="Escribe un comentario..."
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 'var(--r-sm)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: 14,
                  }}
                />
                <button type="submit" className="compose-submit" disabled={!commentDraft.trim()}>
                  Enviar
                </button>
              </form>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Inicia sesion para comentar.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
