import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Wrench, Play, Square, CheckCircle, XCircle, Clock, Terminal, RefreshCw, TrendingUp } from 'lucide-react'
import { jenkinsService } from '../../services/jenkinsService'
import StatCard from '../../components/ui/StatCard'
import ChartCard from '../../components/charts/ChartCard'
import Loader from '../../components/ui/Loader'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import { formatDuration, formatRelativeTime, getBuildResultColor } from '../../utils/formatters'
import { CHART_COLORS, REFRESH_INTERVALS } from '../../utils/constants'
import toast from 'react-hot-toast'

const JOB_COLOR = { blue: 'success', red: 'danger', yellow: 'warning', grey: 'gray', disabled: 'gray' }

export default function JenkinsDashboard() {
  const [selectedJob, setSelectedJob] = useState(null)
  const [showLog, setShowLog] = useState(false)
  const [logContent, setLogContent] = useState('')
  const [logTitle, setLogTitle] = useState('')
  const queryClient = useQueryClient()

  const { data: statsRes } = useQuery({
    queryKey: ['jenkins-stats'],
    queryFn: jenkinsService.getStats,
    refetchInterval: REFRESH_INTERVALS.jenkins,
  })

  const { data: jobsRes, isLoading } = useQuery({
    queryKey: ['jenkins-jobs'],
    queryFn: jenkinsService.getJobs,
    refetchInterval: REFRESH_INTERVALS.jenkins,
  })

  const { data: jobDetailsRes } = useQuery({
    queryKey: ['jenkins-job-details', selectedJob],
    queryFn: () => jenkinsService.getJobDetails(selectedJob),
    enabled: !!selectedJob,
  })

  const { data: buildsRes } = useQuery({
    queryKey: ['jenkins-builds', selectedJob],
    queryFn: () => jenkinsService.getBuildHistory(selectedJob),
    enabled: !!selectedJob,
    refetchInterval: selectedJob ? 15000 : false,
  })

  const triggerMutation = useMutation({
    mutationFn: (jobName) => jenkinsService.triggerBuild(jobName),
    onSuccess: () => { toast.success('Build triggered!'); queryClient.invalidateQueries(['jenkins-builds', selectedJob]) },
    onError: (err) => toast.error(err.message || 'Failed to trigger build'),
  })

  const viewLog = async (jobName, buildNum) => {
    setLogTitle(`${jobName} #${buildNum} Console`)
    setLogContent('Loading console output...')
    setShowLog(true)
    try {
      const res = await jenkinsService.getBuildLog(jobName, buildNum)
      setLogContent(res.data || 'No output')
    } catch (err) {
      setLogContent('Error: ' + err.message)
    }
  }

  const stats = statsRes?.data || {}
  const jobs = jobsRes?.data || []
  const builds = buildsRes?.data?.builds || []

  // Build chart data from recent builds
  const buildChartData = builds.slice(0, 10).reverse().map(b => ({
    build: `#${b.number}`,
    duration: Math.round((b.duration || 0) / 1000),
    result: b.result,
  }))

  const getJobStatusColor = (color) => {
    if (!color) return 'gray'
    const base = color.replace('_anime', '')
    return JOB_COLOR[base] || 'gray'
  }

  if (isLoading) return <Loader text="Connecting to Jenkins..." />

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Jenkins CI/CD</h1>
          <p className="page-subtitle">Pipeline management and build monitoring</p>
        </div>
        {jobs.length > 0 && (
          <div className="connection-badge connected">
            <span className="status-dot online" />
            Jenkins Connected
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <StatCard icon={Wrench} iconBg="rgba(245,158,11,0.15)" iconColor="#f59e0b" value={String(stats.totalJobs ?? 0)} label="Total Jobs" />
        <StatCard icon={CheckCircle} iconBg="rgba(16,185,129,0.15)" iconColor="#10b981" value={String(stats.successfulJobs ?? 0)} label="Passing Jobs" />
        <StatCard icon={XCircle} iconBg="rgba(239,68,68,0.15)" iconColor="#ef4444" value={String(stats.failedJobs ?? 0)} label="Failing Jobs" />
        <StatCard icon={TrendingUp} iconBg="rgba(99,102,241,0.15)" iconColor="#818cf8" value={`${Math.round(stats.successRate ?? 0)}%`} label="Success Rate" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px' }}>
        {/* Jobs List */}
        <div>
          <h2 className="section-title">Jobs</h2>
          {jobs.length === 0 ? (
            <EmptyState icon={Wrench} title="No Jenkins jobs found" description="Verify Jenkins URL and credentials in settings" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {jobs.map(job => (
                <div
                  key={job.name}
                  onClick={() => setSelectedJob(job.name)}
                  style={{
                    background: selectedJob === job.name ? 'rgba(99,102,241,0.1)' : 'var(--color-bg-card)',
                    border: `1px solid ${selectedJob === job.name ? 'rgba(99,102,241,0.3)' : 'var(--color-border)'}`,
                    borderRadius: '10px', padding: '12px', cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`status-dot ${getJobStatusColor(job.color) === 'success' ? 'online' : getJobStatusColor(job.color) === 'danger' ? 'offline' : 'warning'}`} />
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.name}</span>
                    <span className={`badge badge-${getJobStatusColor(job.color)}`} style={{ fontSize: '0.62rem' }}>
                      {job.color?.includes('anime') ? 'BUILDING' : job.color === 'blue' ? 'OK' : job.color === 'red' ? 'FAIL' : job.color?.toUpperCase() || 'N/A'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Job Details */}
        {selectedJob ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Job Actions */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedJob}</h3>
                  {jobDetailsRes?.data?.description && <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>{jobDetailsRes.data.description}</p>}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-success" onClick={() => triggerMutation.mutate(selectedJob)} disabled={triggerMutation.isPending}>
                    <Play size={16} />{triggerMutation.isPending ? 'Triggering...' : 'Trigger Build'}
                  </button>
                  <button className="btn btn-secondary" onClick={() => { queryClient.invalidateQueries(['jenkins-builds', selectedJob]) }}>
                    <RefreshCw size={16} />Refresh
                  </button>
                </div>
              </div>
            </div>

            {/* Build Duration Chart */}
            {buildChartData.length > 0 && (
              <ChartCard title="Build Duration" subtitle="Recent builds (seconds)" height={220}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={buildChartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="build" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v) => [`${v}s`, 'Duration']} contentStyle={{ background: '#1e2030', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '0.8rem' }} />
                    <Bar dataKey="duration" name="Duration" radius={[4, 4, 0, 0]}
                      fill={CHART_COLORS.primary}
                      label={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            )}

            {/* Build History Table */}
            <div>
              <h3 className="section-title">Build History</h3>
              <div className="table-container">
                {builds.length === 0 ? (
                  <EmptyState icon={Wrench} title="No builds found" />
                ) : (
                  <table className="data-table">
                    <thead><tr><th>#</th><th>Status</th><th>Duration</th><th>Started</th><th>Actions</th></tr></thead>
                    <tbody>
                      {builds.slice(0, 20).map(build => (
                        <tr key={build.number}>
                          <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>#{build.number}</td>
                          <td>
                            <span className={`badge badge-${getBuildResultColor(build.result)}`}>
                              {build.result || 'IN PROGRESS'}
                            </span>
                          </td>
                          <td>{formatDuration(build.duration)}</td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                            {build.timestamp ? formatRelativeTime(new Date(build.timestamp).toISOString()) : '—'}
                          </td>
                          <td>
                            <button className="btn btn-xs btn-secondary" onClick={() => viewLog(selectedJob, build.number)}>
                              <Terminal size={12} /> Log
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        ) : (
          <EmptyState icon={Wrench} title="Select a job" description="Click on a Jenkins job to see build history and actions" />
        )}
      </div>

      {/* Log Modal */}
      <Modal isOpen={showLog} onClose={() => setShowLog(false)} title={logTitle} maxWidth="900px">
        <div className="log-output">{logContent}</div>
      </Modal>
    </div>
  )
}
