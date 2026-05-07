import { useNavigate } from 'react-router-dom'

const communities = [
  {
    title: 'Ayuda academica',
    description: 'Pedi ayuda o ayuda a otros en General, Matematicas, Programacion y Redaccion.',
    icon: '\u270E',
    path: '/ayuda',
  },
  {
    title: 'Sin Filtro',
    description: 'Debates anonimos. Deci lo que pensas, con reglas claras.',
    icon: '\uD83D\uDCAC',
    path: '/debates',
  },
  {
    title: 'Emprendimientos',
    description: 'Descubri y promociona negocios creados por estudiantes.',
    icon: '\uD83D\uDECD',
    path: '/promotions',
  },
]

export function Communities() {
  const navigate = useNavigate()

  return (
    <>
      <div className="page-header">
        <div className="page-title">Comunidades</div>
      </div>

      <div style={{ padding: '16px 20px' }}>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>
          Espacios para conectar, debatir y crecer junto a otros estudiantes.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {communities.map((c) => (
            <div
              key={c.path}
              onClick={() => navigate(c.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '18px 20px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--r-lg)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)'
                e.currentTarget.style.background = 'var(--bg-surface-elevated)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)'
                e.currentTarget.style.background = 'var(--bg-tertiary)'
              }}
            >
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--r-md)',
                background: 'var(--primary-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                flexShrink: 0,
              }}>
                {c.icon}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{c.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{c.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
