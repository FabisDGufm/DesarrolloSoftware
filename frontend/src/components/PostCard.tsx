import { useState } from 'react'
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

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isAuthenticated) return
    try {
      if (liked) {
        await api.delete(`/api/interactions/posts/${authorId}/${postId}/like`)
        setLikes((l) => l - 1)
      } else {
        await api.post(`/api/interactions/posts/${authorId}/${postId}/like`)
        setLikes((l) => l + 1)
      }
      setLiked(!liked)
    } catch {
      // silently fail
    }
  }

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isAuthenticated) return
    try {
      if (saved) {
        await api.delete(`/api/interactions/posts/${authorId}/${postId}/save`)
      } else {
        await api.post(`/api/interactions/posts/${authorId}/${postId}/save`)
      }
      setSaved(!saved)
    } catch {
      // silently fail
    }
  }

  const handleRepost = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isAuthenticated) return
    try {
      await api.post(`/api/interactions/posts/${authorId}/${postId}/repost`)
    } catch {
      // silently fail
    }
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isAuthenticated) return
    try {
      await api.post(`/api/interactions/posts/${authorId}/${postId}/share`)
    } catch {
      // silently fail
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
          <button className="post-action comment" onClick={(e) => e.stopPropagation()}>
            <span className="action-icon">&#128172;</span>
            {commentsCount > 0 && <span>{commentsCount}</span>}
          </button>
          <button className="post-action repost" onClick={handleRepost}>
            <span className="action-icon">&#8634;</span>
            {repostsCount > 0 && <span>{repostsCount}</span>}
          </button>
          <button className={`post-action like ${liked ? 'active' : ''}`} onClick={handleLike}>
            <span className="action-icon">{liked ? '\u2665' : '\u2661'}</span>
            {likes > 0 && <span>{likes}</span>}
          </button>
          <button className={`post-action save ${saved ? 'active' : ''}`} onClick={handleSave}>
            <span className="action-icon">{saved ? '\u2605' : '\u2606'}</span>
          </button>
          <button className="post-action share" onClick={handleShare}>
            <span className="action-icon">&#8599;</span>
          </button>
        </div>
      </div>
    </div>
  )
}
