import { useQuery } from '@tanstack/react-query'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  GitBranch, Container, Wrench, Radio, Activity,
  TrendingUp, AlertTriangle, CheckCircle, XCircle,
  Server, GitCommit, Users, Image
} from 'lucide-react'
import { dashboardService } from '../services/dashboardService'
import StatCard from '../components/ui/StatCard'
import ChartCard from '../components/charts/ChartCard'
import Loader from '../components/ui/Loader'
import { formatRelativeTime, formatPercent } from '../utils/formatters'
import { CHART_COLORS } from '../utils/constants'
import { REFRESH_INTERVALS } from '../utils/constants'

// Mock chart data for trends
const generateCommitData = () => [
  { day: 'Mon', commits: 12 }, { day: 'Tue', commits: 19 },
  { day: 'Wed', commits: 8 }, { day: 'Thu', commits: 24 },
  { day: 'Fri', commits: 16 }, { day: 'Sat', commits: 5 },
  { day: 'Sun', commits: 9 },
]

const generateBuildData = () => [
  { month: 'Mar', success: 42, failed: 8 }, { month: 'Apr', success: 55, failed: 5 },
  { month: 'May', success: 48, failed: 12 }, { month: 'Jun', success: 61, failed: 7 },
  { month: 'Jul', success: 58, failed: 4 }, { month: 'Aug', success: 67, failed: 6 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1e2030', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 14px', fontSize: '0.8rem' }}>
      <p style={{ color: '#94a3b8', marginBottom: '6px' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { data: statsRes, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getStats,
    refetchInterval: REFRESH_INTERVALS.stats,
  })

  const { data: alertsRes } = useQuery({
    queryKey: ['dashboard-alerts'],
    queryFn: () => dashboardService.getAlerts(5),
    refetchInterval: 30000,
  })

  const stats = statsRes?.data || {}
  const alerts = alertsRes?.data || []

  if (isLoading) return <Loader text="Loading dashboard..." />

  const healthScore = stats.healthScore ?? 0
  const healthColor = healthScore >= 80 ? CHART_COLORS.success : healthScore >= 50 ? CHART_COLORS.warning : CHART_COLORS.danger

  const apiPieData = [
    { name: 'Healthy', value: Number(stats.healthyApis || 0), color: CHART_COLORS.success },
    { name: 'Down', value: Number(stats.downApis || 0), color: CHART_COLORS.danger },
    { name: 'Monitored', value: Math.max(0, Number(stats.totalMonitoredApis || 0) - Number(stats.healthyApis || 0) - Number(stats.downApis || 0)), color: CHART_COLORS.warning },
  ].filter(d => d.value > 0)

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Real-time overview of your DevOps infrastructure</p>
        </div>
        <div className="page-header-right">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: healthColor, boxShadow: `0 0 8px ${healthColor}` }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>System Health: {healthScore}%</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <StatCard
          icon={GitBranch}
          iconBg="rgba(99,102,241,0.15)"
          iconColor="#818cf8"
          value={String(stats.totalRepositories ?? 0)}
          label="GitBranch Repositories"
        />
        <StatCard
          icon={Container}
          iconBg="rgba(6,182,212,0.15)"
          iconColor="#06b6d4"
          value={String(stats.runningContainers ?? 0)}
          label="Running Containers"
          change={stats.stoppedContainers ? `${stats.stoppedContainers} stopped` : undefined}
          changeType="negative"
        />
        <StatCard
          icon={Wrench}
          iconBg="rgba(245,158,11,0.15)"
          iconColor="#f59e0b"
          value={String(stats.totalJobs ?? 0)}
          label="Jenkins Jobs"
          change={stats.buildSuccessRate ? `${Math.round(stats.buildSuccessRate)}% success rate` : undefined}
          changeType="positive"
        />
        <StatCard
          icon={Radio}
          iconBg="rgba(16,185,129,0.15)"
          iconColor="#10b981"
          value={String(stats.totalMonitoredApis ?? 0)}
          label="Monitored APIs"
          change={stats.healthyApis ? `${stats.healthyApis} healthy` : undefined}
          changeType="positive"
        />
        <StatCard
          icon={CheckCircle}
          iconBg="rgba(16,185,129,0.15)"
          iconColor="#10b981"
          value={String(stats.successfulBuilds ?? 0)}
          label="Successful Builds"
        />
        <StatCard
          icon={XCircle}
          iconBg="rgba(239,68,68,0.15)"
          iconColor="#ef4444"
          value={String(stats.failedBuilds ?? 0)}
          label="Failed Builds"
        />
        <StatCard
          icon={Image}
          iconBg="rgba(139,92,246,0.15)"
          iconColor="#8b5cf6"
          value={String(stats.totalImages ?? 0)}
          label="Docker Images"
        />
        <StatCard
          icon={AlertTriangle}
          iconBg={stats.downApis > 0 ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)"}
          iconColor={stats.downApis > 0 ? "#ef4444" : "#10b981"}
          value={String(stats.downApis ?? 0)}
          label="APIs Down"
        />
      </div>

      {/* Integration Status */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { label: 'GitHub', status: stats.githubStatus, icon: GitBranch },
          { label: 'Docker', status: stats.dockerStatus, icon: Container },
          { label: 'Jenkins', status: stats.jenkinsStatus, icon: Wrench },
          { label: 'API Monitor', status: stats.apiMonitorStatus, icon: Radio },
        ].map(item => (
          <div key={item.label} className="connection-badge" style={{ padding: '8px 14px', borderRadius: '8px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <item.icon size={15} />
            <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{item.label}</span>
            <span className={item.status === 'CONNECTED' || item.status === 'ACTIVE' ? 'badge badge-success' : 'badge badge-danger'} style={{ fontSize: '0.65rem', padding: '2px 7px' }}>
              {item.status || 'N/A'}
            </span>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        {/* Commits Over Time */}
        <ChartCard title="Commit Activity" subtitle="Last 7 days">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={generateCommitData()} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="commitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="commits" name="Commits" stroke={CHART_COLORS.primary} strokeWidth={2} fill="url(#commitGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Build Success Rate */}
        <ChartCard title="Build History" subtitle="Success vs Failed (6 months)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={generateBuildData()} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '0.75rem', color: '#94a3b8' }} />
              <Bar dataKey="success" name="Success" fill={CHART_COLORS.success} radius={[4, 4, 0, 0]} />
              <Bar dataKey="failed" name="Failed" fill={CHART_COLORS.danger} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* API Health Pie */}
        <ChartCard title="API Health Distribution" subtitle="Current status">
          {apiPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={apiPieData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4} dataKey="value">
                  {apiPieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '0.75rem', color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)', flexDirection: 'column', gap: '12px' }}>
              <Radio size={40} style={{ opacity: 0.3 }} />
              <span style={{ fontSize: '0.875rem' }}>No APIs configured yet</span>
            </div>
          )}
        </ChartCard>

        {/* Recent Alerts */}
        <ChartCard title="Recent Alerts" subtitle="Latest system notifications">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', height: '100%' }}>
            {alerts.length > 0 ? alerts.map(alert => (
              <div key={alert.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px', background: 'var(--color-bg-input)', borderRadius: '8px', borderLeft: `3px solid ${ alert.severity === 'CRITICAL' ? '#ef4444' : alert.severity === 'WARNING' ? '#f59e0b' : '#6366f1'}` }}>
                <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '2px', color: alert.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{alert.title}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>{formatRelativeTime(alert.createdAt)}</div>
                </div>
              </div>
            )) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '8px', color: 'var(--color-text-muted)' }}>
                <CheckCircle size={32} style={{ opacity: 0.3, color: CHART_COLORS.success }} />
                <span style={{ fontSize: '0.875rem' }}>No recent alerts</span>
              </div>
            )}
          </div>
        </ChartCard>
      </div>
    </div>
  )
}
