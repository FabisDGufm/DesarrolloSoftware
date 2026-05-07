import { useState, useEffect, useRef } from 'react'
import { api } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { ReportModal } from './ReportModal'
import { IconComment, IconRepeat, IconHeart, IconHeartFilled, IconStar, IconStarFilled, IconShare, IconMoreHorizontal, IconFlag, IconLink, IconTrash } from './Icons'

interface PostCardProps {
  authorId: number
  postId: string
  authorName?: string
  authorPhoto?: string
  text: string
  imageUrl?: string | null
  createdAt: string
  likesCount?: number
  commentsCount?: number
  repostsCount?: number
  /** Mostrar franja "Republicaste" (ej. en perfil). */
  isRepost?: boolean
  repostedAt?: string
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

const S3_BASE = 'https://social-media-ufm-elpasillo.s3.amazonaws.com'

function Avatar({ name, photo }: { name?: string; photo?: string }) {
  const src = photo ? (photo.startsWith('http') ? photo : `${S3_BASE}/${photo}`) : undefined
  if (src) {
    return (
      <div className="avatar">
        <img src={src} alt={name || ''} />
      </div>
    )
  }
  const letter = (name || '?')[0]!.toUpperCase()
  return <div className="avatar">{letter}</div>
}

export function PostCard({
  authorId,
  postId,
  authorName,
  authorPhoto,
  text,
  imageUrl,
  createdAt,
  likesCount = 0,
  commentsCount = 0,
  repostsCount = 0,
  isRepost = false,
  repostedAt,
}: PostCardProps) {
  const { isAuthenticated, user } = useAuthStore()
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(likesCount)
  const [reposts, setReposts] = useState(repostsCount)
  const [hint, setHint] = useState<string | null>(null)
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [saved, setSaved] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [comments, setComments] = useState<ApiComment[]>([])
  const [commentDraft, setCommentDraft] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  const [commentCount, setCommentCount] = useState(commentsCount)

  const interactionBody = { createdAt }
  const queryCreatedAt = encodeURIComponent(createdAt)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  useEffect(() => {
    setCommentCount(commentsCount)
  }, [commentsCount])

  useEffect(() => {
    setReposts(repostsCount)
  }, [repostsCount])

  useEffect(() => {
    return () => {
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current)
    }
  }, [])

  const showHint = (msg: string) => {
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current)
    setHint(msg)
    hintTimerRef.current = setTimeout(() => setHint(null), 2800)
  }

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
      setReposts((n) => n + 1)
      showHint('Republicación registrada')
    } catch {
      showHint('No se pudo republicar')
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
      const snippet =
        text.trim().slice(0, 200) || 'Mira esto en El Pasillo'
      const origin = window.location.origin
      if (typeof navigator.share === 'function') {
        try {
          await navigator.share({
            title: 'El Pasillo',
            text: snippet,
            url: origin,
          })
          showHint('Compartido')
          return
        } catch (err: unknown) {
          if (
            err instanceof DOMException &&
            err.name === 'AbortError'
          ) {
            return
          }
        }
      }
      if (typeof navigator.clipboard?.writeText === 'function') {
        await navigator.clipboard.writeText(`${snippet}\n${origin}`)
        showHint('Copiado al portapapeles')
      } else {
        showHint('Compartido')
      }
    } catch {
      showHint('No se pudo compartir')
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
      <Avatar name={displayName} photo={authorPhoto} />
      <div className="post-body">
        {isRepost && repostedAt && (
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--repost)',
              marginBottom: 8,
              letterSpacing: '0.02em',
            }}
          >
            <IconRepeat size={14} /> Republicaste · {timeAgo(repostedAt)}
          </div>
        )}
        <div className="post-header">
          <span className="post-author">{displayName}</span>
          <span className="post-dot">·</span>
          <span className="post-time">{timeAgo(createdAt)}</span>
          <div className="post-menu-wrapper" ref={menuRef}>
            <button
              className="post-menu-trigger"
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen) }}
            >
              <IconMoreHorizontal size={16} />
            </button>
            {menuOpen && (
              <div className="post-menu-dropdown">
                {isAuthenticated && (
                  <button className="post-menu-item" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); setShowReport(true) }}>
                    <span className="post-menu-icon"><IconFlag size={15} /></span> Reportar
                  </button>
                )}
                <button className="post-menu-item" onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpen(false)
                  const url = `${window.location.origin}/post/${authorId}/${postId}`
                  navigator.clipboard?.writeText(url).then(() => showHint('Enlace copiado'))
                }}>
                  <span className="post-menu-icon"><IconLink size={15} /></span> Copiar enlace
                </button>
                {isAuthenticated && user && Number(user.id) === authorId && (
                  <button className="post-menu-item danger" onClick={async (e) => {
                    e.stopPropagation()
                    setMenuOpen(false)
                    try {
                      await api.delete(`/api/posts/${authorId}/${postId}`)
                      showHint('Post eliminado')
                    } catch { showHint('No se pudo eliminar') }
                  }}>
                    <span className="post-menu-icon"><IconTrash size={15} /></span> Eliminar
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        {text && <div className="post-text">{text}</div>}
        {imageUrl && (
  <div className="post-image">
    <img src={imageUrl.startsWith('http') ? imageUrl : `https://social-media-ufm-elpasillo.s3.us-east-1.amazonaws.com/${imageUrl}`} alt="" />
  </div>
)}
        <div className="post-actions">
          <button
            type="button"
            className="post-action comment"
            data-tooltip="Comentar"
            aria-label="Comentar"
            onClick={toggleComments}
          >
            <span className="action-icon"><IconComment size={16} /></span>
            {commentCount > 0 && <span>{commentCount}</span>}
          </button>
          <button
            type="button"
            className="post-action repost"
            data-tooltip="Republicar"
            aria-label="Republicar"
            onClick={handleRepost}
          >
            <span className="action-icon"><IconRepeat size={16} /></span>
            {reposts > 0 && <span>{reposts}</span>}
          </button>
          <button
            type="button"
            className={`post-action like ${liked ? 'active' : ''}`}
            data-tooltip={liked ? 'Quitar me gusta' : 'Me gusta'}
            aria-label={liked ? 'Quitar me gusta' : 'Me gusta'}
            onClick={handleLike}
          >
            <span className="action-icon">{liked ? <IconHeartFilled size={16} /> : <IconHeart size={16} />}</span>
            {likes > 0 && <span>{likes}</span>}
          </button>
          <button
            type="button"
            className={`post-action save ${saved ? 'active' : ''}`}
            data-tooltip={saved ? 'Quitar de guardados' : 'Guardar'}
            aria-label={saved ? 'Quitar de guardados' : 'Guardar'}
            onClick={handleSave}
          >
            <span className="action-icon">{saved ? <IconStarFilled size={16} /> : <IconStar size={16} />}</span>
          </button>
          <button
            type="button"
            className="post-action share"
            data-tooltip="Compartir"
            aria-label="Compartir"
            onClick={handleShare}
          >
            <span className="action-icon"><IconShare size={16} /></span>
          </button>
        </div>

        {hint && (
          <div
            role="status"
            style={{
              fontSize: 12,
              color: 'var(--accent)',
              marginTop: 8,
            }}
          >
            {hint}
          </div>
        )}

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
                Sin comentarios aún.
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
                Inicia sesión para comentar.
              </div>
            )}
          </div>
        )}
      </div>
      {showReport && (
        <ReportModal
          authorName={displayName}
          authorId={authorId}
          postId={postId}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  )
}
