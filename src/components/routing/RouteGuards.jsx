import { Navigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import FullPageLoader from '../ui/FullPageLoader'

/**
 * Requires an authenticated session. Unauthenticated users are sent to
 * /login, preserving where they were headed so login can return them.
 */
export function ProtectedRoute({ children }) {
  const { session, loading } = useAuthContext()
  const location = useLocation()

  if (loading) return <FullPageLoader />
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return children
}

/**
 * Requires an authenticated admin. Non-admin sessions fall back to the
 * dashboard; unauthenticated users go to /login.
 */
export function AdminRoute({ children }) {
  const { session, role, loading } = useAuthContext()
  const location = useLocation()

  if (loading) return <FullPageLoader />
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  if (role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}
