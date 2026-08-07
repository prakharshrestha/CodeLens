export const CHART_COLORS = {
  primary: '#6366f1',
  accent: '#06b6d4',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  pink: '#ec4899',
  orange: '#f97316',
  teal: '#14b8a6',
  lime: '#84cc16',
}

export const CHART_COLORS_ARRAY = Object.values(CHART_COLORS)

export const REFRESH_INTERVALS = {
  stats: 30000,      // 30s
  containers: 15000, // 15s
  apis: 60000,       // 1min
  jenkins: 30000,    // 30s
  github: 120000,    // 2min
}

export const DOCKER_STATES = ['running', 'exited', 'paused', 'created', 'restarting', 'dead']

export const BUILD_RESULTS = ['SUCCESS', 'FAILURE', 'UNSTABLE', 'ABORTED']

export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']
