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
  }
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
