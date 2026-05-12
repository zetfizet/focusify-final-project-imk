import axios from 'axios'

// Create axios instance with base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - add token to headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('focusify_access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle token refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('focusify_refresh_token')
        if (!refreshToken) {
          // No refresh token available, redirect to login
          window.location.href = '/#/auth'
          return Promise.reject(error)
        }

        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh-token`, {
          refreshToken
        })

        const { token } = response.data
        localStorage.setItem('focusify_access_token', token)

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${token}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('focusify_access_token')
        localStorage.removeItem('focusify_refresh_token')
        localStorage.removeItem('focusify_user')
        window.location.href = '/#/auth'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// ==================== AUTH ENDPOINTS ====================

export const authAPI = {
  register: (email, username, password) =>
    apiClient.post('/api/auth/register', { email, username, password }),

  login: (email, password) =>
    apiClient.post('/api/auth/login', { email, password }),

  logout: () =>
    apiClient.post('/api/auth/logout'),

  verify: () =>
    apiClient.post('/api/auth/verify'),

  refreshToken: (refreshToken) =>
    apiClient.post('/api/auth/refresh-token', { refreshToken })
}

// ==================== SESSION ENDPOINTS ====================

export const sessionsAPI = {
  getAll: () =>
    apiClient.get('/api/sessions'),

  getById: (id) =>
    apiClient.get(`/api/sessions/${id}`),

  create: (sessionData) =>
    apiClient.post('/api/sessions', sessionData),

  update: (id, updates) =>
    apiClient.put(`/api/sessions/${id}`, updates),

  delete: (id) =>
    apiClient.delete(`/api/sessions/${id}`),

  bulkCreate: (sessions) =>
    apiClient.post('/api/sessions/bulk/create', { sessions }),

  getStats: (period = 'week') =>
    apiClient.get('/api/sessions/stats', { params: { period } })
}

// ==================== USER ENDPOINTS ====================

export const userAPI = {
  getProfile: () =>
    apiClient.get('/api/user/profile'),

  updateProfile: (username, avatar, bio) =>
    apiClient.put('/api/user/profile', { username, avatar, bio }),

  getSettings: () =>
    apiClient.get('/api/user/settings'),

  updateSettings: (settings) =>
    apiClient.put('/api/user/settings', settings),

  deleteAccount: (password) =>
    apiClient.delete('/api/user/account', { data: { password } })
}

export default apiClient
