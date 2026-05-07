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
  if (diff < 60) return `hace ${diff}s`
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-GT', { month: 'short', day: 'numeric' })
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
    <>
      <style>{`
        .news-card {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--r-md);
          overflow: hidden;
          max-width: 480px;
          transition: background 0.15s, border-color 0.15s;
          position: relative;
        }

        .news-card:hover {
          background: var(--bg-surface);
          border-color: var(--border-strong);
        }

        .news-card-image-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 16/9;
          overflow: hidden;
          background: var(--bg-surface);
        }

        .news-card-image-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.4s ease;
        }

        .news-card:hover .news-card-image-wrap img {
          transform: scale(1.03);
        }

        .news-card-image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(15, 15, 18, 0.4) 0%, transparent 55%);
          pointer-events: none;
        }

        .news-card-body {
          padding: 16px 18px 18px;
        }

        .news-card-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
        }

        .news-card-source-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: var(--accent-soft);
          border: 1px solid rgba(232, 168, 56, 0.2);
          border-radius: var(--r-sm);
          padding: 3px 10px;
          font-size: 11px;
          font-weight: 700;
          color: var(--accent);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .news-card-source-badge svg {
          flex-shrink: 0;
          opacity: 0.8;
        }

        .news-card-dot {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: var(--text-muted);
          flex-shrink: 0;
        }

        .news-card-time {
          font-size: 12px;
          color: var(--text-muted);
          font-weight: 500;
          letter-spacing: 0.02em;
        }

        .news-card-title {
          font-family: var(--font-display);
          font-size: 17px;
          font-weight: 700;
          line-height: 1.35;
          color: var(--text-primary);
          margin: 0 0 9px 0;
          letter-spacing: -0.01em;
        }

        .news-card-desc {
          font-size: 13.5px;
          line-height: 1.6;
          color: var(--text-secondary);
          margin: 0 0 14px 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .news-card-divider {
          height: 1px;
          background: var(--border-color);
          margin: 12px 0;
        }

        .news-card-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: var(--accent);
          font-size: 12.5px;
          font-weight: 600;
          text-decoration: none;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          transition: gap 0.2s ease, color 0.2s ease;
        }

        .news-card-link:hover {
          color: var(--accent-hover);
          gap: 8px;
        }

        .news-card-link svg {
          transition: transform 0.2s ease;
        }

        .news-card-link:hover svg {
          transform: translateX(2px);
        }
      `}</style>

      <div className="news-card">
        {/* IMAGEN */}
        {imageUrl && !imgError && (
          <div className="news-card-image-wrap">
            <img
              src={imageUrl}
              alt={title}
              onError={() => setImgError(true)}
            />
            <div className="news-card-image-overlay" />
          </div>
        )}

        <div className="news-card-body">
          {/* META: FUENTE + TIEMPO */}
          <div className="news-card-meta">
            <span className="news-card-source-badge">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
                <path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/>
              </svg>
              {source || 'Prensa Libre'}
            </span>

            {publishedAt && (
              <>
                <span className="news-card-dot" />
                <span className="news-card-time">{timeAgo(publishedAt)}</span>
              </>
            )}
          </div>

          {/* TITULO */}
          <h2 className="news-card-title">{title}</h2>

          {/* DESCRIPCION */}
          {content && (
            <p className="news-card-desc">{content}</p>
          )}

          {/* LINK */}
          {url && (
            <>
              <div className="news-card-divider" />
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="news-card-link"
              >
                Leer noticia
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </>
          )}
        </div>
      </div>
    </>
  )
}
