import apiClient from './apiClient'

export const jenkinsService = {
  getJobs: () => apiClient.get('/jenkins/jobs'),
  getJobDetails: (name) => apiClient.get(`/jenkins/jobs/${name}`),
  getBuildHistory: (name) => apiClient.get(`/jenkins/jobs/${name}/builds`),
  getBuildDetails: (name, num) => apiClient.get(`/jenkins/jobs/${name}/builds/${num}`),
  getBuildLog: (name, num) => apiClient.get(`/jenkins/jobs/${name}/builds/${num}/log`),
  triggerBuild: (name) => apiClient.post(`/jenkins/jobs/${name}/build`),
  stopBuild: (name, num) => apiClient.post(`/jenkins/jobs/${name}/builds/${num}/stop`),
  getStats: () => apiClient.get('/jenkins/stats'),
  getInfo: () => apiClient.get('/jenkins/info'),
}
