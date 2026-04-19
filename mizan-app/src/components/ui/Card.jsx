const variantStyles = {
  default: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    boxShadow: 'var(--shadow-card)',
  },
  elevated: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-default)',
    boxShadow: 'var(--shadow-elevated)',
  },
  gold: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-gold)',
    boxShadow: 'var(--shadow-card), inset 0 0 24px var(--gold-glow)',
  },
  glass: {
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    background: 'rgba(22, 22, 31, 0.6)',
    border: '1px solid rgba(240, 237, 232, 0.06)',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
  },
}

export default function Card({ variant = 'default', children, style, ...props }) {
  return (
    <div
      style={{
        ...variantStyles[variant],
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-lg)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}
