import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import type { Rol } from '../../types/auth.types'

interface ProtectedRouteProps {
  /** If provided, only users with one of these roles can access the route.
   *  If omitted, any authenticated user is allowed. */
  allowedRoles?: Rol[]
}

/**
 * Guards a route behind authentication and optional role checks.
 *
 * - No token → redirect to /login  (Req-1, AC 1.5)
 * - Token present but role not in allowedRoles → redirect to /pos  (Req-7, AC 7.5)
 * - Otherwise → render nested routes via <Outlet />
 */
export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { token, rol } = useAuth()

  // Not authenticated — send to login
  if (!token) {
    return <Navigate to="/login" replace />
  }

  // Authenticated but role not permitted — send to POS (safe fallback)
  if (allowedRoles && rol && !allowedRoles.includes(rol)) {
    return <Navigate to="/pos" replace />
  }

  return <Outlet />
}
