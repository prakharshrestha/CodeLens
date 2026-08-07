import apiClient from './apiClient'

export const dashboardService = {
  getStats: () => apiClient.get('/dashboard/stats'),
  getAlerts: (limit = 10) => apiClient.get(`/dashboard/alerts?limit=${limit}`),
  getUnreadAlerts: () => apiClient.get('/dashboard/alerts/unread'),
  markAlertRead: (id) => apiClient.put(`/dashboard/alerts/${id}/read`),
}
