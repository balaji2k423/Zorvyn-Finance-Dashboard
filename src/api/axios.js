import axios from 'axios'

const api = axios.create({
  baseURL: 'https://zorvyn-finance-dashboard-eta-neon.vercel.app/',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach access token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// If access token expired, auto refresh using refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refresh = localStorage.getItem('refresh_token')
        const response = await axios.post(
          'http://127.0.0.1:8000/api/auth/token/refresh/',
          { refresh }
        )

        const newAccess = response.data.access
        localStorage.setItem('access_token', newAccess)
        originalRequest.headers.Authorization = `Bearer ${newAccess}`

        return api(originalRequest)
      } catch (refreshError) {
        // Refresh token also expired — force logout
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api