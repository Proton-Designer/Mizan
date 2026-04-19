export default function Divider({ color = 'var(--border-subtle)', style, ...props }) {
  return (
    <div
      style={{
        height: '1px',
        background: color,
        width: '100%',
        ...style,
      }}
      {...props}
    />
  )
}
