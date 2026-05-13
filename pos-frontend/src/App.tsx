import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { Login } from './pages/Login'
import { Productos } from './pages/Productos'
import { Placeholder } from './pages/Placeholder'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Ruta pública */}
            <Route path="/login" element={<Login />} />

            {/* Rutas protegidas */}
            <Route path="/productos" element={
              <ProtectedRoute><Productos /></ProtectedRoute>
            } />
            <Route path="/clientes" element={
              <ProtectedRoute><Placeholder title="Clientes" /></ProtectedRoute>
            } />
            <Route path="/cobros" element={
              <ProtectedRoute><Placeholder title="Cobros" /></ProtectedRoute>
            } />
            <Route path="/creditos" element={
              <ProtectedRoute><Placeholder title="Créditos" /></ProtectedRoute>
            } />
            <Route path="/pos" element={
              <ProtectedRoute><Placeholder title="POS" /></ProtectedRoute>
            } />
            <Route path="/stats" element={
              <ProtectedRoute><Placeholder title="Estadísticas" /></ProtectedRoute>
            } />

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/productos" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
