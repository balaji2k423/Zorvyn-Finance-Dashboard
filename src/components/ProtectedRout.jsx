// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom'
import { authAPI } from '../api/auth'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = authAPI.getCurrentUser()

  if (!authAPI.isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/403" replace />
  }

  return children
}

export default ProtectedRoute