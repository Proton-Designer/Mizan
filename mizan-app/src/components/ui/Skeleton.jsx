export default function Skeleton({ width = '100%', height = 16, radius = 'var(--radius-sm)', style, count = 1 }) {
  if (count > 1) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, ...style }}>
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="skeleton" style={{ width: i === count - 1 ? '60%' : width, height, borderRadius: radius }} />
        ))}
      </div>
    )
  }
  return <div className="skeleton" style={{ width, height, borderRadius: radius, ...style }} />
}
