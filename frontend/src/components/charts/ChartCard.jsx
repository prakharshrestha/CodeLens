export default function ChartCard({ title, subtitle, children, extra, height = 280 }) {
  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div>
          <div className="chart-card-title">{title}</div>
          {subtitle && <div className="chart-card-subtitle">{subtitle}</div>}
        </div>
        {extra && <div>{extra}</div>}
      </div>
      <div style={{ height }}>
        {children}
      </div>
    </div>
  )
}
