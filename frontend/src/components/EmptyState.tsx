interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '64px 24px',
      textAlign: 'center',
    }}>
      <div style={{
        fontSize: 48,
        marginBottom: 16,
        color: 'var(--text-tertiary)',
        lineHeight: 1,
      }}>
        {icon}
      </div>
      <div style={{
        fontSize: 18,
        fontWeight: 600,
        color: 'var(--text-primary)',
        marginBottom: 6,
      }}>
        {title}
      </div>
      <div style={{
        fontSize: 14,
        color: 'var(--text-secondary)',
        maxWidth: 320,
        lineHeight: 1.5,
      }}>
        {description}
      </div>
      {action && (
        <button
          className="btn-secondary"
          onClick={action.onClick}
          style={{ marginTop: 20, width: 'auto', padding: '8px 20px' }}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
