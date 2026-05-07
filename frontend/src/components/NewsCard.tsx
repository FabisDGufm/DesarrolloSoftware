import { useState } from 'react'

interface NewsCardProps {
  title: string
  description?: string
  text?: string
  imageUrl?: string | null
  url?: string
  publishedAt?: string
  source?: string
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return ''

  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = Math.floor((now - then) / 1000)

  if (diff < 60) return `${diff}s`
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`

  const d = new Date(dateStr)
  return d.toLocaleDateString('es-GT', {
    month: 'short',
    day: 'numeric',
  })
}

export function NewsCard({
  title,
  description,
  text,
  imageUrl,
  url,
  publishedAt,
  source,
}: NewsCardProps) {
  const [imgError, setImgError] = useState(false)

  const content = description || text || ''

  return (
    <div className="post-card">
      {/* HEADER */}
      <div className="post-header">
        <span className="post-author">
          📰 {source || 'Noticias'}
        </span>

        {publishedAt && (
          <>
            <span className="post-dot">·</span>
            <span className="post-time">
              {timeAgo(publishedAt)}
            </span>
          </>
        )}
      </div>

      {/* TITLE */}
      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
          marginBottom: 6,
          color: 'var(--text-primary)',
        }}
      >
        {title}
      </div>

      {/* CONTENT */}
      {content && (
        <div className="post-text">
          {content}
        </div>
      )}

      {/* IMAGE */}
      {imageUrl && !imgError && (
        <div className="post-image">
          <img
            src={imageUrl}
            alt=""
            onError={() => setImgError(true)}
          />
        </div>
      )}

      {/* LINK */}
      {url && (
        <div style={{ marginTop: 10 }}>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            style={{
              color: 'var(--accent)',
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Leer noticia →
          </a>
        </div>
      )}
    </div>
  )
}