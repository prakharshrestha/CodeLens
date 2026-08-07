export default function Badge({ children, variant = 'info', dot = false }) {
  return (
    <span className={`badge badge-${variant}`}>
      {dot && <span className={`status-dot ${variant === 'success' ? 'online' : variant === 'danger' ? 'offline' : 'warning'}`} />}
      {children}
    </span>
  )
}
