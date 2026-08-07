import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  GitBranch, Star, GitFork, Eye, GitCommit, Users,
  AlertCircle, Code, ExternalLink, RefreshCw
} from 'lucide-react'
import { githubService } from '../../services/githubService'
import StatCard from '../../components/ui/StatCard'
import ChartCard from '../../components/charts/ChartCard'
import Loader from '../../components/ui/Loader'
import EmptyState from '../../components/ui/EmptyState'
import { formatRelativeTime, formatNumber, truncateHash } from '../../utils/formatters'
import { CHART_COLORS, CHART_COLORS_ARRAY, REFRESH_INTERVALS } from '../../utils/constants'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1e2030', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 14px', fontSize: '0.8rem' }}>
      <p style={{ color: '#94a3b8', marginBottom: '4px' }}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</p>)}
    </div>
  )
}

export default function GithubAnalytics() {
  const [selectedRepo, setSelectedRepo] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  const { data: statsRes, isLoading: statsLoading } = useQuery({
    queryKey: ['github-stats'],
    queryFn: githubService.getStats,
    refetchInterval: REFRESH_INTERVALS.GitBranch,
  })

  const { data: reposRes, isLoading: reposLoading } = useQuery({
    queryKey: ['github-repos'],
    queryFn: githubService.getRepos,
    refetchInterval: REFRESH_INTERVALS.GitBranch,
  })

  const { data: commitsRes } = useQuery({
    queryKey: ['github-commits', selectedRepo],
    queryFn: () => githubService.getCommits(selectedRepo, 30),
    enabled: !!selectedRepo,
  })

  const { data: contributorsRes } = useQuery({
    queryKey: ['github-contributors', selectedRepo],
    queryFn: () => githubService.getContributors(selectedRepo),
    enabled: !!selectedRepo,
  })

  const { data: languagesRes } = useQuery({
    queryKey: ['github-languages', selectedRepo],
    queryFn: () => githubService.getLanguages(selectedRepo),
    enabled: !!selectedRepo,
  })

  const stats = statsRes?.data || {}
  const repos = reposRes?.data || []
  const commits = commitsRes?.data || []
  const contributors = contributorsRes?.data || []
  const languages = languagesRes?.data || {}

  const langData = Object.entries(languages).map(([name, bytes]) => ({ name, value: bytes }))
  const totalBytes = langData.reduce((sum, l) => sum + l.value, 0)

  const contribData = contributors.slice(0, 8).map(c => ({
    name: c.login,
    contributions: c.contributions,
  }))

  if (reposLoading) return <Loader text="Loading GitBranch data..." />

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">GitBranch Analytics</h1>
          <p className="page-subtitle">Repository insights and development metrics</p>
        </div>
        <div className="page-header-right">
          {stats.username && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
              <GitBranch size={16} />
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>@{stats.username}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <StatCard icon={GitBranch} iconBg="rgba(99,102,241,0.15)" iconColor="#818cf8" value={formatNumber(stats.totalRepos ?? repos.length)} label="Repositories" />
        <StatCard icon={Star} iconBg="rgba(245,158,11,0.15)" iconColor="#f59e0b" value={formatNumber(stats.totalStars ?? 0)} label="Total Stars" />
        <StatCard icon={GitFork} iconBg="rgba(16,185,129,0.15)" iconColor="#10b981" value={formatNumber(stats.totalForks ?? 0)} label="Total Forks" />
        <StatCard icon={AlertCircle} iconBg="rgba(239,68,68,0.15)" iconColor="#ef4444" value={formatNumber(stats.totalOpenIssues ?? 0)} label="Open Issues" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
        {/* Repo List */}
        <div>
          <h2 className="section-title">Repositories</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '600px', overflowY: 'auto' }}>
            {repos.length === 0 ? (
              <EmptyState icon={GitBranch} title="No repositories found" description="Check your GitBranch token configuration" />
            ) : repos.map(repo => (
              <div
                key={repo.id}
                onClick={() => { setSelectedRepo(repo.name); setActiveTab('overview') }}
                style={{
                  background: selectedRepo === repo.name ? 'rgba(99,102,241,0.1)' : 'var(--color-bg-card)',
                  border: `1px solid ${selectedRepo === repo.name ? 'rgba(99,102,241,0.3)' : 'var(--color-border)'}`,
                  borderRadius: '10px', padding: '12px', cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <GitBranch size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{repo.name}</span>
                  {repo.private && <span className="badge badge-gray" style={{ fontSize: '0.6rem', padding: '1px 6px' }}>Private</span>}
                </div>
                {repo.description && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '8px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{repo.description}</p>
                )}
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Star size={11} />{repo.stargazers_count}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><GitFork size={11} />{repo.forks_count}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><AlertCircle size={11} />{repo.open_issues_count}</span>
                  {repo.language && <span style={{ color: '#818cf8' }}>{repo.language}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Repo Details */}
        {selectedRepo ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div className="tabs">
                {['overview', 'commits', 'contributors', 'languages'].map(tab => (
                  <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === 'overview' && (
              <div className="card">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>{selectedRepo}</h3>
                <div className="stats-grid">
                  {repos.filter(r => r.name === selectedRepo).map(repo => (
                    <>
                      <StatCard key="stars" icon={Star} iconBg="rgba(245,158,11,0.15)" iconColor="#f59e0b" value={String(repo.stargazers_count)} label="Stars" />
                      <StatCard key="forks" icon={GitFork} iconBg="rgba(16,185,129,0.15)" iconColor="#10b981" value={String(repo.forks_count)} label="Forks" />
                      <StatCard key="issues" icon={AlertCircle} iconBg="rgba(239,68,68,0.15)" iconColor="#ef4444" value={String(repo.open_issues_count)} label="Open Issues" />
                      <StatCard key="watchers" icon={Eye} iconBg="rgba(99,102,241,0.15)" iconColor="#818cf8" value={String(repo.watchers_count)} label="Watchers" />
                    </>
                  ))}
                </div>
                <div style={{ marginTop: '16px' }}>
                  {repos.filter(r => r.name === selectedRepo).map(repo => (
                    <div key={repo.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.875rem' }}>
                      <div><span style={{ color: 'var(--color-text-muted)' }}>Default Branch: </span><strong>{repo.default_branch}</strong></div>
                      <div><span style={{ color: 'var(--color-text-muted)' }}>Language: </span><strong>{repo.language || 'N/A'}</strong></div>
                      <div><span style={{ color: 'var(--color-text-muted)' }}>Last Push: </span><strong>{formatRelativeTime(repo.pushed_at)}</strong></div>
                      <div><span style={{ color: 'var(--color-text-muted)' }}>Created: </span><strong>{formatRelativeTime(repo.created_at)}</strong></div>
                      <div style={{ gridColumn: '1/-1' }}>
                        <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                          <ExternalLink size={14} /> View on GitHub
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'commits' && (
              <div className="card">
                <h3 className="section-title">Recent Commits</h3>
                {commits.length === 0 ? (
                  <EmptyState icon={GitCommit} title="No commits found" />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {commits.map((commit, i) => (
                      <div key={i} style={{ display: 'flex', gap: '12px', padding: '10px', background: 'var(--color-bg-input)', borderRadius: '8px', alignItems: 'flex-start' }}>
                        <img src={commit.author?.avatar_url || `https://github.com/identicons/${commit.commit?.author?.name}.png`} alt="" style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{commit.commit?.message?.split('\n')[0]}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '3px', display: 'flex', gap: '8px' }}>
                            <span style={{ fontFamily: 'monospace', color: '#818cf8' }}>{truncateHash(commit.sha)}</span>
                            <span>{commit.commit?.author?.name}</span>
                            <span>{formatRelativeTime(commit.commit?.author?.date)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'contributors' && (
              <ChartCard title="Top Contributors" subtitle="By number of contributions" height={320}>
                {contribData.length === 0 ? (
                  <EmptyState icon={Users} title="No contributors data" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={contribData} layout="vertical" margin={{ top: 0, right: 20, left: 30, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                      <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="contributions" name="Contributions" fill={CHART_COLORS.primary} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            )}

            {activeTab === 'languages' && (
              <ChartCard title="Language Distribution" subtitle={selectedRepo} height={300}>
                {langData.length === 0 ? (
                  <EmptyState icon={Code} title="No language data" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={langData} cx="50%" cy="50%" outerRadius={110} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {langData.map((_, i) => <Cell key={i} fill={CHART_COLORS_ARRAY[i % CHART_COLORS_ARRAY.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => `${(v / totalBytes * 100).toFixed(1)}%`} />
                      <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            )}
          </div>
        ) : (
          <EmptyState icon={GitBranch} title="Select a repository" description="Click on a repository from the list to view its analytics" />
        )}
      </div>
    </div>
  )
}
