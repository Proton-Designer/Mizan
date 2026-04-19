export default function Badge({ children, color = 'var(--gold-mid)', style, ...props }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: 'var(--radius-pill)',
        fontSize: '11px',
        fontWeight: 500,
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: '0.04em',
        color: color,
        background: `${color}15`,
        border: `1px solid ${color}30`,
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  )
}
