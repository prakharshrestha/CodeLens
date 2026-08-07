import { formatDistanceToNow, format } from 'date-fns'

export const formatRelativeTime = (dateStr) => {
  if (!dateStr) return 'N/A'
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
  } catch {
    return dateStr
  }
}

export const formatDate = (dateStr, fmt = 'MMM d, yyyy') => {
  if (!dateStr) return 'N/A'
  try {
    return format(new Date(dateStr), fmt)
  } catch {
    return dateStr
  }
}

export const formatDateTime = (dateStr) => {
  if (!dateStr) return 'N/A'
  try {
    return format(new Date(dateStr), 'MMM d, yyyy HH:mm')
  } catch {
    return dateStr
  }
}

export const formatDuration = (ms) => {
  if (!ms) return '0s'
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  const mins = Math.floor(ms / 60000)
  const secs = Math.floor((ms % 60000) / 1000)
  return `${mins}m ${secs}s`
}

export const formatBytes = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0'
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return String(num)
}

export const formatPercent = (value, decimals = 1) => {
  if (value === null || value === undefined) return '0%'
  return `${Number(value).toFixed(decimals)}%`
}

export const getContainerStateColor = (state) => {
  switch (state?.toLowerCase()) {
    case 'running': return 'success'
    case 'exited': return 'danger'
    case 'paused': return 'warning'
    default: return 'gray'
  }
}

export const getBuildResultColor = (result) => {
  switch (result?.toUpperCase()) {
    case 'SUCCESS': return 'success'
    case 'FAILURE': return 'danger'
    case 'UNSTABLE': return 'warning'
    case 'ABORTED': return 'gray'
    default: return 'info'
  }
}

export const getApiStatusColor = (status) => {
  switch (status) {
    case 'HEALTHY': return 'success'
    case 'DOWN': return 'danger'
    case 'SLOW': return 'warning'
    default: return 'gray'
  }
}

export const truncateHash = (hash, length = 7) => {
  if (!hash) return ''
  return hash.substring(0, length)
}
