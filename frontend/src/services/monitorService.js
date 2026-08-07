import apiClient from './apiClient'

export const monitorService = {
  getApis: () => apiClient.get('/monitor'),
  getApi: (id) => apiClient.get(`/monitor/${id}`),
  addApi: (data) => apiClient.post('/monitor', data),
  updateApi: (id, data) => apiClient.put(`/monitor/${id}`, data),
  deleteApi: (id) => apiClient.delete(`/monitor/${id}`),
  getLogs: (id, limit = 50) => apiClient.get(`/monitor/${id}/logs?limit=${limit}`),
  checkNow: (id) => apiClient.post(`/monitor/${id}/check`),
  getStats: () => apiClient.get('/monitor/stats'),
}
