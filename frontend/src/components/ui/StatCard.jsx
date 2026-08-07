export default function StatCard({ icon: Icon, iconColor, iconBg, value, label, change, changeType }) {
  return (
    <div className="stat-card">
      <div className="stat-card-icon" style={{ background: iconBg }}>
        {Icon && <Icon size={22} color={iconColor} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="stat-card-value">{value ?? '—'}</div>
        <div className="stat-card-label">{label}</div>
        {change !== undefined && (
          <div className={`stat-card-change ${changeType}`}>
            {changeType === 'positive' ? '↑' : '↓'} {change}
          </div>
        )}
      </div>
    </div>
  )
}
