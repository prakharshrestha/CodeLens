import apiClient from './apiClient'

export const dockerService = {
  getContainers: () => apiClient.get('/docker/containers'),
  getContainerDetails: (id) => apiClient.get(`/docker/containers/${id}`),
  getContainerStats: (id) => apiClient.get(`/docker/containers/${id}/stats`),
  getContainerLogs: (id) => apiClient.get(`/docker/containers/${id}/logs`),
  startContainer: (id) => apiClient.post(`/docker/containers/${id}/start`),
  stopContainer: (id) => apiClient.post(`/docker/containers/${id}/stop`),
  restartContainer: (id) => apiClient.post(`/docker/containers/${id}/restart`),
  removeContainer: (id) => apiClient.delete(`/docker/containers/${id}`),
  getImages: () => apiClient.get('/docker/images'),
  deleteImage: (id) => apiClient.delete(`/docker/images/${id}`),
  getVolumes: () => apiClient.get('/docker/volumes'),
  getNetworks: () => apiClient.get('/docker/networks'),
  getInfo: () => apiClient.get('/docker/info'),
  getStats: () => apiClient.get('/docker/stats'),
}
