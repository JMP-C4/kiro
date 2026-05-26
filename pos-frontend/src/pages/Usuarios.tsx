/**
 * Usuarios.tsx — Módulo de gestión de usuarios (solo ADMIN)
 *
 * Req-9 (9.8)
 */

import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { listarUsuarios, crearUsuario, actualizarUsuario, desactivarUsuario } from '../api/usuarios.api'
import type { Usuario } from '../types/usuario.types'
import GlassModal from '../components/ui/GlassModal'
import Spinner from '../components/ui/Spinner'

// ---------------------------------------------------------------------------
// Form schema
// ---------------------------------------------------------------------------

const usuarioSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  apellido: z.string().min(1, 'El apellido es obligatorio'),
  username: z.string().min(3, 'El usuario debe tener al menos 3 caracteres'),
  password: z.string().optional(),
  rol: z.enum(['CAJERO', 'SUPERVISOR', 'ADMIN']),
  activo: z.boolean(),
})

type UsuarioFormData = z.infer<typeof usuarioSchema>

const ROL_LABEL: Record<string, string> = {
  CAJERO: 'Cajero',
  SUPERVISOR: 'Supervisor',
  ADMIN: 'Administrador',
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Usuarios() {
  const { nombre, rol } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [formOpen, setFormOpen] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const { data: usuarios = [], isLoading, isError } = useQuery({
    queryKey: ['usuarios'],
    queryFn: listarUsuarios,
    staleTime: 30_000,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UsuarioFormData>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: { nombre: '', apellido: '', username: '', password: '', rol: 'CAJERO', activo: true },
  })

  const createMutation = useMutation({
    mutationFn: crearUsuario,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['usuarios'] }); setFormOpen(false) },
    onError: () => setErrorMsg('Error al crear el usuario.'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<UsuarioFormData> }) => actualizarUsuario(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['usuarios'] }); setFormOpen(false); setEditingUsuario(null) },
    onError: () => setErrorMsg('Error al actualizar el usuario.'),
  })

  const deactivateMutation = useMutation({
    mutationFn: desactivarUsuario,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['usuarios'] }),
    onError: () => setErrorMsg('Error al desactivar el usuario.'),
  })

  const openCreate = () => {
    setEditingUsuario(null)
    reset({ nombre: '', apellido: '', username: '', password: '', rol: 'CAJERO', activo: true })
    setFormOpen(true)
  }

  const openEdit = (usuario: Usuario) => {
    setEditingUsuario(usuario)
    reset({ nombre: usuario.nombre, apellido: usuario.apellido, username: usuario.username, password: '', rol: usuario.rol, activo: usuario.activo })
    setFormOpen(true)
  }

  const onSubmit = useCallback(async (data: UsuarioFormData) => {
    const payload = { ...data, password: data.password || undefined }
    if (editingUsuario) {
      await updateMutation.mutateAsync({ id: editingUsuario.id, data: payload })
    } else {
      if (!data.password) { setErrorMsg('La contraseña es obligatoria al crear un usuario.'); return }
      await createMutation.mutateAsync({ ...data, password: data.password })
    }
  }, [editingUsuario, createMutation, updateMutation])

  const inputClass = (hasError: boolean) =>
    `glass-input w-full rounded-lg px-3 py-2 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-violet-500/60 transition ${hasError ? 'border-red-400/70' : ''}`

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="glass h-14 flex items-center px-6 gap-4 sticky top-0 z-40">
        <button type="button" onClick={() => navigate('/pos')} className="text-white/60 hover:text-white transition text-sm">← POS</button>
        <span className="text-white font-bold text-base flex-1">Usuarios</span>
        {nombre && <span className="text-white/60 text-sm hidden md:block">{nombre} · {rol}</span>}
      </header>

      <main className="p-6 max-w-5xl mx-auto">
        {errorMsg && (
          <div role="alert" className="mb-4 px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-sm flex justify-between">
            <span>⚠ {errorMsg}</span>
            <button type="button" onClick={() => setErrorMsg(null)}>✕</button>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-white font-semibold text-lg">Gestión de Usuarios</h1>
          <button type="button" onClick={openCreate} className="px-4 py-2 rounded-lg bg-linear-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white font-semibold text-sm transition">
            + Nuevo usuario
          </button>
        </div>

        <div className="glass-card overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          ) : isError ? (
            <p className="text-center text-red-400 py-12">Error al cargar los usuarios.</p>
          ) : usuarios.length === 0 ? (
            <p className="text-center text-white/40 py-12">No hay usuarios registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-white/50 text-xs uppercase tracking-wider">
                    <th className="text-left px-4 py-3">Nombre</th>
                    <th className="text-left px-4 py-3">Usuario</th>
                    <th className="text-center px-4 py-3">Rol</th>
                    <th className="text-center px-4 py-3">Estado</th>
                    <th className="text-center px-4 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {usuarios.map((u) => (
                    <tr key={u.id} className="text-white/80 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-medium text-white">{u.nombre} {u.apellido}</td>
                      <td className="px-4 py-3 font-mono text-xs text-white/60">{u.username}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300">{ROL_LABEL[u.rol] ?? u.rol}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${u.activo ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          {u.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button type="button" onClick={() => openEdit(u)} className="text-xs px-2 py-1 rounded bg-violet-500/20 text-violet-300 hover:bg-violet-500/40 transition">Editar</button>
                          {u.activo && (
                            <button type="button" onClick={() => deactivateMutation.mutate(u.id)} className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/40 transition">Desactivar</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* User form modal */}
      <GlassModal isOpen={formOpen} onClose={() => { setFormOpen(false); setEditingUsuario(null) }} title={editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'} className="max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-white/80">Nombre *</label>
              <input {...register('nombre')} className={inputClass(!!errors.nombre)} placeholder="Juan" />
              {errors.nombre && <p className="text-xs text-red-400">{errors.nombre.message}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-white/80">Apellido *</label>
              <input {...register('apellido')} className={inputClass(!!errors.apellido)} placeholder="Pérez" />
              {errors.apellido && <p className="text-xs text-red-400">{errors.apellido.message}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-white/80">Usuario *</label>
            <input {...register('username')} className={inputClass(!!errors.username)} placeholder="jperez" autoComplete="off" />
            {errors.username && <p className="text-xs text-red-400">{errors.username.message}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-white/80">
              Contraseña {editingUsuario ? '(dejar vacío para no cambiar)' : '*'}
            </label>
            <input {...register('password')} type="password" className={inputClass(false)} placeholder="••••••••" autoComplete="new-password" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-white/80">Rol *</label>
              <select {...register('rol')} className={`${inputClass(!!errors.rol)} bg-slate-800`}>
                <option value="CAJERO">Cajero</option>
                <option value="SUPERVISOR">Supervisor</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
            <div className="flex flex-col gap-1 justify-end">
              <label className="flex items-center gap-3 cursor-pointer pb-2">
                <input {...register('activo')} type="checkbox" className="w-4 h-4 rounded accent-violet-500" />
                <span className="text-sm text-white/80">Usuario activo</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setFormOpen(false); setEditingUsuario(null) }} className="flex-1 py-2 rounded-lg border border-white/20 text-white/70 hover:text-white hover:bg-white/10 transition">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-2 rounded-lg font-semibold text-white bg-linear-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 disabled:opacity-50 transition">
              {isSubmitting ? 'Guardando…' : editingUsuario ? 'Guardar cambios' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </GlassModal>
    </div>
  )
}
