/**
 * Productos.tsx — Módulo de gestión de productos
 *
 * Admin: puede crear, editar y desactivar productos.
 * Supervisor: solo lectura, sin botones de edición.
 *
 * Req-8 (8.7, 8.8)
 */

import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  listarProductos,
  crearProducto,
  actualizarProducto,
  desactivarProducto,
} from '../api/productos.api'
import type { Producto } from '../types/producto.types'
import ProductoForm from '../components/productos/ProductoForm'
import Spinner from '../components/ui/Spinner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export default function Productos() {
  const { rol, nombre } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isAdmin = rol === 'ADMIN'

  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Fetch products
  const { data, isLoading, isError } = useQuery({
    queryKey: ['productos', search],
    queryFn: () => listarProductos({ q: search || undefined }),
    staleTime: 30_000,
  })

  const productos: Producto[] = data?.content ?? []

  // Mutations
  const createMutation = useMutation({
    mutationFn: crearProducto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] })
      setFormOpen(false)
      setErrorMsg(null)
    },
    onError: () => setErrorMsg('Error al crear el producto.'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Omit<Producto, 'id'>> }) =>
      actualizarProducto(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] })
      setFormOpen(false)
      setEditingProducto(null)
      setErrorMsg(null)
    },
    onError: () => setErrorMsg('Error al actualizar el producto.'),
  })

  const deactivateMutation = useMutation({
    mutationFn: desactivarProducto,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['productos'] }),
    onError: () => setErrorMsg('Error al desactivar el producto.'),
  })

  const handleFormSubmit = useCallback(
    async (formData: Omit<Producto, 'id' | 'activo'>) => {
      if (editingProducto) {
        await updateMutation.mutateAsync({ id: editingProducto.id, data: formData })
      } else {
        await createMutation.mutateAsync(formData)
      }
    },
    [editingProducto, createMutation, updateMutation]
  )

  const openCreate = () => {
    setEditingProducto(null)
    setFormOpen(true)
  }

  const openEdit = (producto: Producto) => {
    setEditingProducto(producto)
    setFormOpen(true)
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navbar */}
      <header className="glass h-14 flex items-center px-6 gap-4 sticky top-0 z-40">
        <button
          type="button"
          onClick={() => navigate('/pos')}
          className="text-white/60 hover:text-white transition text-sm flex items-center gap-1"
          aria-label="Volver al POS"
        >
          ← POS
        </button>
        <span className="text-white font-bold text-base flex-1">Productos</span>
        {nombre && <span className="text-white/60 text-sm hidden md:block">{nombre} · {rol}</span>}
      </header>

      <main className="p-6 max-w-6xl mx-auto">
        {/* Error alert */}
        {errorMsg && (
          <div role="alert" className="mb-4 px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-sm flex justify-between">
            <span>⚠ {errorMsg}</span>
            <button type="button" onClick={() => setErrorMsg(null)} className="text-red-300/60 hover:text-red-200">✕</button>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center gap-4 mb-6">
          {/* Search */}
          <fieldset className="flex-1">
            <legend className="sr-only">Buscar productos</legend>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg fill="currentColor" viewBox="0 0 512 512" className="w-4 h-4 text-white/40" aria-hidden="true">
                  <path d="M479.6,399.716l-81.084-81.084-62.368-25.767A175.014,175.014,0,0,0,368,192c0-97.047-78.953-176-176-176S16,94.953,16,192,94.953,368,192,368a175.034,175.034,0,0,0,101.619-32.377l25.7,62.2L400.4,478.911a56,56,0,1,0,79.2-79.195ZM48,192c0-79.4,64.6-144,144-144s144,64.6,144,144S271.4,336,192,336,48,271.4,48,192ZM456.971,456.284a24.028,24.028,0,0,1-33.942,0l-76.572-76.572-23.894-57.835L380.4,345.771l76.573,76.572A24.028,24.028,0,0,1,456.971,456.284Z" />
                </svg>
              </span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre o código…"
                className="glass-input w-full rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-violet-500/60 transition"
              />
            </div>
          </fieldset>

          {/* Create button — Admin only */}
          {isAdmin && (
            <button
              type="button"
              onClick={openCreate}
              className="shrink-0 px-4 py-2 rounded-lg bg-linear-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white font-semibold text-sm transition"
            >
              + Nuevo producto
            </button>
          )}
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <Spinner size="lg" />
            </div>
          ) : isError ? (
            <p className="text-center text-red-400 py-12">Error al cargar los productos.</p>
          ) : productos.length === 0 ? (
            <p className="text-center text-white/40 py-12">No se encontraron productos.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-white/50 text-xs uppercase tracking-wider">
                    <th className="text-left px-4 py-3">Código</th>
                    <th className="text-left px-4 py-3">Nombre</th>
                    <th className="text-left px-4 py-3">Categoría</th>
                    <th className="text-right px-4 py-3">Precio</th>
                    <th className="text-center px-4 py-3">IVA</th>
                    <th className="text-center px-4 py-3">Unidad</th>
                    <th className="text-center px-4 py-3">Estado</th>
                    {isAdmin && <th className="text-center px-4 py-3">Acciones</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {productos.map((p) => (
                    <tr key={p.id} className="text-white/80 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-white/60">{p.codigo}</td>
                      <td className="px-4 py-3 font-medium text-white">{p.nombre}</td>
                      <td className="px-4 py-3 text-white/60">{p.categoria ?? '—'}</td>
                      <td className="px-4 py-3 text-right font-semibold">
                        ${p.precio.toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${p.incluye_iva ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/40'}`}>
                          {p.incluye_iva ? 'Incluido' : 'No'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-white/60">{p.unidad_medida}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${p.activo ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          {p.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(p)}
                              className="text-xs px-2 py-1 rounded bg-violet-500/20 text-violet-300 hover:bg-violet-500/40 transition"
                            >
                              Editar
                            </button>
                            {p.activo && (
                              <button
                                type="button"
                                onClick={() => deactivateMutation.mutate(p.id)}
                                className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/40 transition"
                              >
                                Desactivar
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Product form modal */}
      <ProductoForm
        isOpen={formOpen}
        producto={editingProducto}
        onSubmit={handleFormSubmit}
        onClose={() => { setFormOpen(false); setEditingProducto(null) }}
      />
    </div>
  )
}
