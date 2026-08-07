import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Radio, Plus, Edit2, Trash2, RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle, Zap } from 'lucide-react'
import { monitorService } from '../../services/monitorService'
import StatCard from '../../components/ui/StatCard'
import ChartCard from '../../components/charts/ChartCard'
import Loader from '../../components/ui/Loader'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import { formatRelativeTime, formatPercent, getApiStatusColor } from '../../utils/formatters'
import { CHART_COLORS, HTTP_METHODS, REFRESH_INTERVALS } from '../../utils/constants'
import toast from 'react-hot-toast'

const STATUS_BADGE = {
  HEALTHY: 'success', DOWN: 'danger', SLOW: 'warning', UNKNOWN: 'gray'
}

const defaultForm = { name: '', url: 'https://', method: 'GET', expectedStatusCode: 200, checkIntervalSeconds: 60, timeoutMs: 10000, tags: '' }

export default function ApiMonitor() {
  const [showForm, setShowForm] = useState(false)
  const [editApi, setEditApi] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [selectedApi, setSelectedApi] = useState(null)
  const queryClient = useQueryClient()

  const { data: statsRes } = useQuery({
    queryKey: ['monitor-stats'],
    queryFn: monitorService.getStats,
    refetchInterval: REFRESH_INTERVALS.apis,
  })

  const { data: apisRes, isLoading } = useQuery({
    queryKey: ['monitor-apis'],
    queryFn: monitorService.getApis,
    refetchInterval: REFRESH_INTERVALS.apis,
  })

  const { data: logsRes } = useQuery({
    queryKey: ['monitor-logs', selectedApi?.id],
    queryFn: () => monitorService.getLogs(selectedApi.id, 30),
    enabled: !!selectedApi,
    refetchInterval: 60000,
  })

  const addMutation = useMutation({
    mutationFn: (data) => editApi ? monitorService.updateApi(editApi.id, data) : monitorService.addApi(data),
    onSuccess: () => {
      toast.success(editApi ? 'API updated!' : 'API added!')
      queryClient.invalidateQueries(['monitor-apis'])
      queryClient.invalidateQueries(['monitor-stats'])
      setShowForm(false)
      setEditApi(null)
      setForm(defaultForm)
    },
    onError: (err) => toast.error(err.message || 'Operation failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => monitorService.deleteApi(id),
    onSuccess: () => {
      toast.success('API removed')
      queryClient.invalidateQueries(['monitor-apis'])
      queryClient.invalidateQueries(['monitor-stats'])
      if (selectedApi?.id === deleteMutation.variables) setSelectedApi(null)
    },
    onError: (err) => toast.error(err.message || 'Failed to delete'),
  })

  const checkNowMutation = useMutation({
    mutationFn: (id) => monitorService.checkNow(id),
    onSuccess: () => {
      toast.success('Health check completed')
      queryClient.invalidateQueries(['monitor-apis'])
      queryClient.invalidateQueries(['monitor-logs', selectedApi?.id])
    },
    onError: (err) => toast.error(err.message || 'Check failed'),
  })

  const stats = statsRes?.data || {}
  const apis = apisRes?.data || []
  const logs = logsRes?.data || []

  // Build chart data from logs
  const chartData = logs.slice(0, 20).reverse().map((log, i) => ({
    time: i + 1,
    responseTime: log.responseTimeMs,
    status: log.status,
  }))

  const openEdit = (api) => {
    setEditApi(api)
    setForm({
      name: api.name, url: api.url, method: api.method,
      expectedStatusCode: api.expectedStatusCode,
      checkIntervalSeconds: api.checkIntervalSeconds,
      timeoutMs: api.timeoutMs, tags: api.tags || '',
    })
    setShowForm(true)
  }

  if (isLoading) return <Loader text="Loading API monitor..." />

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">API Monitor</h1>
          <p className="page-subtitle">Real-time health monitoring for REST APIs</p>
        </div>
        <div className="page-header-right">
          <button className="btn btn-primary" onClick={() => { setEditApi(null); setForm(defaultForm); setShowForm(true) }}>
            <Plus size={16} /> Add API
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <StatCard icon={Radio} iconBg="rgba(99,102,241,0.15)" iconColor="#818cf8" value={String(stats.total ?? 0)} label="Monitored APIs" />
        <StatCard icon={CheckCircle} iconBg="rgba(16,185,129,0.15)" iconColor="#10b981" value={String(stats.healthy ?? 0)} label="Healthy" />
        <StatCard icon={XCircle} iconBg="rgba(239,68,68,0.15)" iconColor="#ef4444" value={String(stats.down ?? 0)} label="Down" />
        <StatCard icon={Clock} iconBg="rgba(245,158,11,0.15)" iconColor="#f59e0b" value={String(stats.slow ?? 0)} label="Slow" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '24px' }}>
        {/* API List */}
        <div>
          <h2 className="section-title">Endpoints ({apis.length})</h2>
          {apis.length === 0 ? (
            <EmptyState
              icon={Radio}
              title="No APIs configured"
              description="Add your first API endpoint to start monitoring"
              action={
                <button className="btn btn-primary btn-sm" onClick={() => { setEditApi(null); setForm(defaultForm); setShowForm(true) }}>
                  <Plus size={14} /> Add First API
                </button>
              }
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {apis.map(api => (
                <div
                  key={api.id}
                  onClick={() => setSelectedApi(api)}
                  style={{
                    background: selectedApi?.id === api.id ? 'rgba(99,102,241,0.1)' : 'var(--color-bg-card)',
                    border: `1px solid ${selectedApi?.id === api.id ? 'rgba(99,102,241,0.3)' : 'var(--color-border)'}`,
                    borderRadius: '10px', padding: '12px', cursor: 'pointer',
                    transition: 'all 0.15s',
                    borderLeft: `3px solid ${api.status === 'HEALTHY' ? '#10b981' : api.status === 'DOWN' ? '#ef4444' : api.status === 'SLOW' ? '#f59e0b' : '#64748b'}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span className={`badge badge-${STATUS_BADGE[api.status] || 'gray'}`} style={{ fontSize: '0.62rem' }}>{api.status || 'UNKNOWN'}</span>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{api.name}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '6px' }}>{api.url}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                    <span>Uptime: <strong style={{ color: api.uptimePercentage > 95 ? '#10b981' : api.uptimePercentage > 80 ? '#f59e0b' : '#ef4444' }}>{formatPercent(api.uptimePercentage)}</strong></span>
                    {api.lastResponseTimeMs && <span>{api.lastResponseTimeMs}ms</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* API Details */}
        {selectedApi ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedApi.name}</h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', fontFamily: 'monospace', marginTop: '4px' }}>
                    <span className="badge badge-info" style={{ fontSize: '0.65rem', marginRight: '8px' }}>{selectedApi.method}</span>
                    {selectedApi.url}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => checkNowMutation.mutate(selectedApi.id)} disabled={checkNowMutation.isPending}>
                    <Zap size={14} />{checkNowMutation.isPending ? 'Checking...' : 'Check Now'}
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => openEdit(selectedApi)}>
                    <Edit2 size={14} />Edit
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => {
                    if (window.confirm(`Remove "${selectedApi.name}"?`)) {
                      deleteMutation.mutate(selectedApi.id)
                    }
                  }}>
                    <Trash2 size={14} />Remove
                  </button>
                </div>
              </div>

              {/* Metrics Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '16px' }}>
                {[
                  { label: 'Status', value: <span className={`badge badge-${STATUS_BADGE[selectedApi.status] || 'gray'}`}>{selectedApi.status}</span> },
                  { label: 'Uptime', value: <strong style={{ color: selectedApi.uptimePercentage > 95 ? '#10b981' : '#f59e0b' }}>{formatPercent(selectedApi.uptimePercentage)}</strong> },
                  { label: 'Last Response', value: selectedApi.lastResponseTimeMs ? `${selectedApi.lastResponseTimeMs}ms` : 'N/A' },
                  { label: 'Total Checks', value: String(selectedApi.totalChecks || 0) },
                ].map(m => (
                  <div key={m.label} style={{ textAlign: 'center', padding: '12px', background: 'var(--color-bg-input)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{m.label}</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{m.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Response Time Chart */}
            {chartData.length > 0 && (
              <ChartCard title="Response Time" subtitle="Last 20 checks (ms)" height={220}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time" hide />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v) => [`${v}ms`, 'Response Time']} contentStyle={{ background: '#1e2030', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '0.8rem' }} />
                    <Line type="monotone" dataKey="responseTime" stroke={CHART_COLORS.accent} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            )}

            {/* Logs Table */}
            <div>
              <h3 className="section-title">Check History</h3>
              <div className="table-container">
                {logs.length === 0 ? (
                  <EmptyState icon={Clock} title="No check history yet" description="Health checks will appear here after monitoring starts" />
                ) : (
                  <table className="data-table">
                    <thead><tr><th>Time</th><th>Status</th><th>HTTP Code</th><th>Response Time</th><th>Error</th></tr></thead>
                    <tbody>
                      {logs.map(log => (
                        <tr key={log.id}>
                          <td style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>{formatRelativeTime(log.checkedAt)}</td>
                          <td><span className={`badge badge-${STATUS_BADGE[log.status] || 'gray'}`}>{log.status}</span></td>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{log.statusCode || '—'}</td>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{log.responseTimeMs ? `${log.responseTimeMs}ms` : '—'}</td>
                          <td style={{ fontSize: '0.78rem', color: 'var(--color-danger)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.errorMessage || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        ) : (
          <EmptyState icon={Radio} title="Select an API" description="Click on an API endpoint from the list to view monitoring details" />
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditApi(null); setForm(defaultForm) }} title={editApi ? 'Edit API Endpoint' : 'Add API Endpoint'}>
        <form onSubmit={(e) => { e.preventDefault(); addMutation.mutate(form) }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input className="form-input" placeholder="e.g. Production API" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">URL *</label>
            <input className="form-input" placeholder="https://api.example.com/health" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} required type="url" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">HTTP Method</label>
              <select className="form-input form-select" value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))}>
                {HTTP_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Expected Status Code</label>
              <input className="form-input" type="number" value={form.expectedStatusCode} onChange={e => setForm(f => ({ ...f, expectedStatusCode: Number(e.target.value) }))} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Check Interval (seconds)</label>
              <input className="form-input" type="number" min="30" value={form.checkIntervalSeconds} onChange={e => setForm(f => ({ ...f, checkIntervalSeconds: Number(e.target.value) }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Timeout (ms)</label>
              <input className="form-input" type="number" value={form.timeoutMs} onChange={e => setForm(f => ({ ...f, timeoutMs: Number(e.target.value) }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Tags (optional)</label>
            <input className="form-input" placeholder="production, critical" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditApi(null); setForm(defaultForm) }}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={addMutation.isPending}>
              {addMutation.isPending ? 'Saving...' : editApi ? 'Update API' : 'Add API'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
