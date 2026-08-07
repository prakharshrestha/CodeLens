import apiClient from './apiClient'

export const githubService = {
  getRepos: () => apiClient.get('/github/repos'),
  getRepo: (name) => apiClient.get(`/github/repos/${name}`),
  getCommits: (repo, perPage = 30) => apiClient.get(`/github/repos/${repo}/commits?perPage=${perPage}`),
  getContributors: (repo) => apiClient.get(`/github/repos/${repo}/contributors`),
  getLanguages: (repo) => apiClient.get(`/github/repos/${repo}/languages`),
  getBranches: (repo) => apiClient.get(`/github/repos/${repo}/branches`),
  getIssues: (repo, state = 'open') => apiClient.get(`/github/repos/${repo}/issues?state=${state}`),
  getPullRequests: (repo, state = 'open') => apiClient.get(`/github/repos/${repo}/pulls?state=${state}`),
  getProfile: () => apiClient.get('/github/profile'),
  getStats: () => apiClient.get('/github/stats'),
}
