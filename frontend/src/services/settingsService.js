import axios from 'axios'
import { authService } from './authService'

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

export const settingsService = {
  async getSettings() {
    const token = authService.getToken()
    const response = await axios.get(`${API_URL}/settings`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data.data
  },

  async updateSettings(settings) {
    const token = authService.getToken()
    const response = await axios.put(`${API_URL}/settings`, settings, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  }
}
