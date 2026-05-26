import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Login from './pages/Login'
import POS from './pages/POS'
import Productos from './pages/Productos'
import Usuarios from './pages/Usuarios'
import Reportes from './pages/Reportes'
import Configuracion from './pages/Configuracion'

/**
 * Public-only wrapper: if the user is already authenticated, redirect to /pos.
 * Used for the /login route so logged-in users don't see the login screen.
 */
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  return token ? <Navigate to="/pos" replace /> : <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route — redirect to /pos when already logged in */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Protected routes — any authenticated user */}
        <Route element={<ProtectedRoute />}>
          <Route path="/pos" element={<POS />} />
        </Route>

        {/* Protected routes — SUPERVISOR and ADMIN */}
        <Route element={<ProtectedRoute allowedRoles={['SUPERVISOR', 'ADMIN']} />}>
          <Route path="/productos" element={<Productos />} />
          <Route path="/reportes" element={<Reportes />} />
        </Route>

        {/* Protected routes — ADMIN only */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/configuracion" element={<Configuracion />} />
        </Route>

        {/* Default redirects */}
        <Route path="/" element={<Navigate to="/pos" replace />} />
        <Route path="*" element={<Navigate to="/pos" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
