export default function StatusBadge({ status, children, style }) {
  const cls = `badge-${status || 'teal'}`
  return <span className={cls} style={style}>{children}</span>
}
