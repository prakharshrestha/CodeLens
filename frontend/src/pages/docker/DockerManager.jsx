import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Container, Play, Square, RotateCcw, Trash2, Image, HardDrive, Network, Info, AlertTriangle, Terminal } from 'lucide-react'
import { dockerService } from '../../services/dockerService'
import StatCard from '../../components/ui/StatCard'
import Loader from '../../components/ui/Loader'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import { formatBytes, formatRelativeTime } from '../../utils/formatters'
import { REFRESH_INTERVALS } from '../../utils/constants'
import toast from 'react-hot-toast'

const STATE_COLORS = {
  running: 'success', exited: 'danger', paused: 'warning', created: 'info', restarting: 'warning', dead: 'danger'
}

export default function DockerManager() {
  const [activeTab, setActiveTab] = useState('containers')
  const [selectedContainer, setSelectedContainer] = useState(null)
  const [showLogs, setShowLogs] = useState(false)
  const [logsContent, setLogsContent] = useState('')
  const queryClient = useQueryClient()

  const { data: statsRes } = useQuery({
    queryKey: ['docker-stats'],
    queryFn: dockerService.getStats,
    refetchInterval: REFRESH_INTERVALS.containers,
  })

  const { data: containersRes, isLoading } = useQuery({
    queryKey: ['docker-containers'],
    queryFn: dockerService.getContainers,
    refetchInterval: REFRESH_INTERVALS.containers,
  })

  const { data: imagesRes } = useQuery({
    queryKey: ['docker-images'],
    queryFn: dockerService.getImages,
    enabled: activeTab === 'images',
    refetchInterval: 60000,
  })

  const { data: volumesRes } = useQuery({
    queryKey: ['docker-volumes'],
    queryFn: dockerService.getVolumes,
    enabled: activeTab === 'volumes',
  })

  const { data: networksRes } = useQuery({
    queryKey: ['docker-networks'],
    queryFn: dockerService.getNetworks,
    enabled: activeTab === 'networks',
  })

  const actionMutation = useMutation({
    mutationFn: ({ action, id }) => {
      if (action === 'start') return dockerService.startContainer(id)
      if (action === 'stop') return dockerService.stopContainer(id)
      if (action === 'restart') return dockerService.restartContainer(id)
      if (action === 'remove') return dockerService.removeContainer(id)
    },
    onSuccess: (_, { action }) => {
      toast.success(`Container ${action}ed successfully`)
      queryClient.invalidateQueries(['docker-containers'])
      queryClient.invalidateQueries(['docker-stats'])
    },
    onError: (err) => toast.error(err.message || 'Docker operation failed'),
  })

  const handleViewLogs = async (container) => {
    setSelectedContainer(container)
    setLogsContent('Loading logs...')
    setShowLogs(true)
    try {
      const res = await dockerService.getContainerLogs(container.Id)
      setLogsContent(res.data || 'No logs available')
    } catch (err) {
      setLogsContent('Error loading logs: ' + err.message)
    }
  }

  const stats = statsRes?.data || {}
  const containers = containersRes?.data || []
  const images = imagesRes?.data || []
  const volumes = volumesRes?.data || []
  const networks = networksRes?.data || []

  if (isLoading) return <Loader text="Connecting to Docker..." />

  const getContainerName = (c) => c.Names?.[0]?.replace('/', '') || c.Id?.substring(0, 12)
  const getImageName = (c) => c.Image || 'unknown'

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Docker Manager</h1>
          <p className="page-subtitle">Manage containers, images, volumes and networks</p>
        </div>
        {stats.runningContainers !== undefined && (
          <div className="connection-badge connected">
            <span className="status-dot online" />
            Docker Connected
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <StatCard icon={Container} iconBg="rgba(16,185,129,0.15)" iconColor="#10b981" value={String(stats.runningContainers ?? 0)} label="Running Containers" />
        <StatCard icon={Container} iconBg="rgba(239,68,68,0.15)" iconColor="#ef4444" value={String(stats.stoppedContainers ?? 0)} label="Stopped Containers" />
        <StatCard icon={Container} iconBg="rgba(245,158,11,0.15)" iconColor="#f59e0b" value={String(stats.pausedContainers ?? 0)} label="Paused" />
        <StatCard icon={Image} iconBg="rgba(99,102,241,0.15)" iconColor="#818cf8" value={String(stats.totalImages ?? 0)} label="Total Images" />
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: '20px' }}>
        {['containers', 'images', 'volumes', 'networks'].map(tab => (
          <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Containers Table */}
      {activeTab === 'containers' && (
        <div className="table-container">
          {containers.length === 0 ? (
            <EmptyState icon={Container} title="No containers found" description="Docker daemon returned no containers." />
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Image</th>
                  <th>Status</th>
                  <th>Ports</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {containers.map(container => {
                  const name = getContainerName(container)
                  const state = container.State?.toLowerCase()
                  const isRunning = state === 'running'
                  return (
                    <tr key={container.Id}>
                      <td>
                        <div style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.85rem' }}>{name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{container.Id?.substring(0, 12)}</div>
                      </td>
                      <td style={{ fontSize: '0.82rem', fontFamily: 'monospace' }}>{getImageName(container)}</td>
                      <td>
                        <span className={`badge badge-${STATE_COLORS[state] || 'gray'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <span className={`status-dot ${isRunning ? 'online' : state === 'paused' ? 'warning' : 'offline'}`} />
                          {container.Status || state}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.78rem', fontFamily: 'monospace' }}>
                        {container.Ports?.filter(p => p.PublicPort).map(p => `${p.PublicPort}:${p.PrivatePort}`).join(', ') || '—'}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                        {container.Created ? formatRelativeTime(new Date(container.Created * 1000).toISOString()) : '—'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          {!isRunning && (
                            <button title="Start" className="btn btn-xs btn-success" onClick={() => actionMutation.mutate({ action: 'start', id: container.Id })}>
                              <Play size={12} />
                            </button>
                          )}
                          {isRunning && (
                            <button title="Stop" className="btn btn-xs btn-danger" onClick={() => actionMutation.mutate({ action: 'stop', id: container.Id })}>
                              <Square size={12} />
                            </button>
                          )}
                          <button title="Restart" className="btn btn-xs btn-secondary" onClick={() => actionMutation.mutate({ action: 'restart', id: container.Id })}>
                            <RotateCcw size={12} />
                          </button>
                          <button title="Logs" className="btn btn-xs btn-secondary" onClick={() => handleViewLogs(container)}>
                            <Terminal size={12} />
                          </button>
                          <button title="Remove" className="btn btn-xs btn-danger" onClick={() => {
                            if (window.confirm(`Remove container "${name}"?`)) {
                              actionMutation.mutate({ action: 'remove', id: container.Id })
                            }
                          }}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Images Table */}
      {activeTab === 'images' && (
        <div className="table-container">
          {images.length === 0 ? (
            <EmptyState icon={Image} title="No images found" />
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Repository</th><th>Tag</th><th>Image ID</th><th>Size</th><th>Created</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {images.map(img => (
                  <tr key={img.Id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{img.RepoTags?.[0]?.split(':')[0] || '<none>'}</td>
                    <td><span className="badge badge-purple">{img.RepoTags?.[0]?.split(':')[1] || 'latest'}</span></td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{img.Id?.replace('sha256:', '').substring(0, 12)}</td>
                    <td>{formatBytes(img.Size)}</td>
                    <td>{img.Created ? formatRelativeTime(new Date(img.Created * 1000).toISOString()) : '—'}</td>
                    <td>
                      <button title="Delete" className="btn btn-xs btn-danger" onClick={() => {
                        if (window.confirm('Delete this image?')) dockerService.deleteImage(img.Id).then(() => { toast.success('Image deleted'); queryClient.invalidateQueries(['docker-images']) })
                      }}>
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Volumes */}
      {activeTab === 'volumes' && (
        <div className="table-container">
          {volumes.length === 0 ? <EmptyState icon={HardDrive} title="No volumes found" /> : (
            <table className="data-table">
              <thead><tr><th>Name</th><th>Driver</th><th>Mountpoint</th><th>Created</th></tr></thead>
              <tbody>
                {volumes.map(v => (
                  <tr key={v.Name}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{v.Name}</td>
                    <td><span className="badge badge-info">{v.Driver}</span></td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--color-text-muted)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.Mountpoint}</td>
                    <td>{v.CreatedAt ? formatRelativeTime(v.CreatedAt) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Networks */}
      {activeTab === 'networks' && (
        <div className="table-container">
          {networks.length === 0 ? <EmptyState icon={Network} title="No networks found" /> : (
            <table className="data-table">
              <thead><tr><th>Name</th><th>Driver</th><th>Scope</th><th>Subnet</th><th>Created</th></tr></thead>
              <tbody>
                {networks.map(n => (
                  <tr key={n.Id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{n.Name}</td>
                    <td><span className="badge badge-cyan">{n.Driver}</span></td>
                    <td><span className="badge badge-gray">{n.Scope}</span></td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{n.IPAM?.Config?.[0]?.Subnet || '—'}</td>
                    <td>{n.Created ? formatRelativeTime(n.Created) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Logs Modal */}
      <Modal isOpen={showLogs} onClose={() => setShowLogs(false)} title={`Logs: ${selectedContainer ? getContainerName(selectedContainer) : ''}`} maxWidth="800px">
        <div className="log-output">{logsContent}</div>
      </Modal>
    </div>
  )
}
