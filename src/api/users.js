import api from './axios'

export const usersAPI = {
  getAll: () => api.get('/users/'),
  getById: (id) => api.get(`/users/${id}/`),
  create: (data) => api.post('/users/', data),
  update: (id, data) => api.patch(`/users/${id}/`, data),
  delete: (id) => api.delete(`/users/${id}/`),
  toggleStatus: (id) => api.patch(`/users/${id}/toggle-status/`),
  changeRole: (id, role) => api.patch(`/users/${id}/change-role/`, { role }),
}