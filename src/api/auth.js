import api from './axios'

export const authAPI = {

  login: async (email, password) => {
    const response = await api.post('/auth/login/', { email, password })
    // Save tokens to localStorage
    localStorage.setItem('access_token', response.data.tokens.access)
    localStorage.setItem('refresh_token', response.data.tokens.refresh)
    localStorage.setItem('user', JSON.stringify(response.data.user))
    return response.data
  },

  register: async (data) => {
    const response = await api.post('/auth/register/', data)
    localStorage.setItem('access_token', response.data.tokens.access)
    localStorage.setItem('refresh_token', response.data.tokens.refresh)
    localStorage.setItem('user', JSON.stringify(response.data.user))
    return response.data
  },

  logout: async () => {
    const refresh = localStorage.getItem('refresh_token')
    await api.post('/auth/logout/', { refresh })
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
  },

  getMe: () => api.get('/auth/me/'),

  getCurrentUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  isAuthenticated: () => !!localStorage.getItem('access_token'),
}