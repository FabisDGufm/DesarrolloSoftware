interface PromotionCardProps {
  title: string
  description: string
  imageUrl?: string | null
  price?: number | null
  contact: string
  university?: string | null
  createdAt: string
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = Math.floor((now - then) / 1000)

  if (diff < 60) return `${diff}s`
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`

  return new Date(dateStr).toLocaleDateString('es-GT')
}

export function PromotionCard({
  title,
  description,
  imageUrl,
  price,
  contact,
  university,
  createdAt,
}: PromotionCardProps) {
  return (
    <div
      style={{
        borderBottom: '1px solid var(--border-color)',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
        {imageUrl && (
        <div
            style={{
            borderRadius: 18,
            overflow: 'hidden',
            border: '1px solid var(--border-color)',
            background: '#111',
            }}
        >
            <img
            src={`${import.meta.env.VITE_S3_BASE_URL}/${imageUrl}`}
            alt={title}
            style={{
                width: '100%',
                height: 320,
                objectFit: 'contain',
                display: 'block',
                background: '#111',
            }}
            />
        </div>
        )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              marginBottom: 6,
            }}
          >
            {title}
          </div>

          {university && (
            <div
              style={{
                fontSize: 13,
                color: 'var(--accent)',
              }}
            >
              {university}
            </div>
          )}
        </div>

        {price !== undefined && price !== null && (
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: 'var(--accent)',
              whiteSpace: 'nowrap',
            }}
          >
            Q{price}
          </div>
        )}
      </div>

      <div
        style={{
          fontSize: 15,
          lineHeight: 1.5,
          color: 'var(--text-secondary)',
        }}
      >
        {description}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 4,
        }}
      >
        <div
          style={{
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          Contacto: {contact}
        </div>

        <div
          style={{
            color: 'var(--text-muted)',
            fontSize: 13,
          }}
        >
          {timeAgo(createdAt)}
        </div>
      </div>
    </div>
  )
}