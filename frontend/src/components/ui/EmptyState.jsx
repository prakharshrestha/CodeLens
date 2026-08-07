export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="empty-state">
      {Icon && (
        <div className="empty-state-icon">
          <Icon size={48} color="var(--color-text-muted)" />
        </div>
      )}
      <div className="empty-state-title">{title}</div>
      {description && <p className="empty-state-text">{description}</p>}
      {action && <div style={{ marginTop: '16px' }}>{action}</div>}
    </div>
  )
}
