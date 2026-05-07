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
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Source+Sans+3:wght@400;500;600&display=swap');

        .news-card {
          font-family: 'Source Sans 3', sans-serif;
          background: #fff;
          border: 1px solid #e8e3da;
          border-radius: 4px;
          overflow: hidden;
          max-width: 480px;
          transition: box-shadow 0.25s ease, transform 0.25s ease;
          position: relative;
        }

        .news-card:hover {
          box-shadow: 0 8px 32px rgba(0,0,0,0.10);
          transform: translateY(-2px);
        }

        .news-card-image-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 16/9;
          overflow: hidden;
          background: #f0ece4;
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
          background: linear-gradient(to top, rgba(20,16,10,0.28) 0%, transparent 55%);
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
          background: #f5f1eb;
          border: 1px solid #e0d9cf;
          border-radius: 3px;
          padding: 2px 8px;
          font-size: 11px;
          font-weight: 600;
          color: #5a4e3c;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .news-card-source-badge svg {
          flex-shrink: 0;
          opacity: 0.7;
        }

        .news-card-dot {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #bbb4a8;
          flex-shrink: 0;
        }

        .news-card-time {
          font-size: 12px;
          color: #9e9488;
          font-weight: 500;
          letter-spacing: 0.02em;
        }

        .news-card-title {
          font-family: 'Playfair Display', serif;
          font-size: 17px;
          font-weight: 700;
          line-height: 1.35;
          color: #1a1510;
          margin: 0 0 9px 0;
          letter-spacing: -0.01em;
        }

        .news-card-desc {
          font-size: 13.5px;
          line-height: 1.6;
          color: #6b6358;
          margin: 0 0 14px 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .news-card-divider {
          height: 1px;
          background: #ede8e1;
          margin: 12px 0;
        }

        .news-card-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #b84a00;
          font-size: 12.5px;
          font-weight: 600;
          text-decoration: none;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          transition: gap 0.2s ease, color 0.2s ease;
        }

        .news-card-link:hover {
          color: #8c3800;
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

          {/* TÍTULO */}
          <h2 className="news-card-title">{title}</h2>

          {/* DESCRIPCIÓN */}
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
