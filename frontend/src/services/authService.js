import apiClient from './apiClient'

export const authService = {
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  register: (name, email, password) => apiClient.post('/auth/register', { name, email, password }),
  getCurrentUser: () => apiClient.get('/auth/me'),
  changePassword: (currentPassword, newPassword) =>
    apiClient.put('/auth/change-password', { currentPassword, newPassword }),
}
