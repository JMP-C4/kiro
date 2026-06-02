/**
 * Configuracion.tsx — Módulo de configuración del sistema (solo ADMIN)
 *
 * Req-11 (11.3, 11.4, 11.5)
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { useConfig } from '../context/ConfigContext'
import { updateConfiguracion } from '../api/configuracion.api'
import type { ConfiguracionRequest } from '../types/reporte.types'
import Spinner from '../components/ui/Spinner'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const configSchema = z.object({
  nombre_negocio: z.string().min(1, 'El nombre del negocio es obligatorio'),
  tasa_iva: z
    .number({ message: 'Debe ser un número' })
    .min(0, 'Mínimo 0%')
    .max(100, 'Máximo 100%'),
  formato_papel: z.enum(['80mm', '58mm', 'carta']),
  logo_url: z.string().url('URL inválida').or(z.literal('')).optional(),
})

type ConfigFormData = z.infer<typeof configSchema>

const FORMATO_LABEL: Record<string, string> = {
  '80mm': 'Papel térmico 80 mm',
  '58mm': 'Papel térmico 58 mm',
  carta: 'Papel carta (Letter)',
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Configuracion() {
  const { nombre, rol } = useAuth()
  const navigate = useNavigate()
  const { config, setConfig, isLoading } = useConfig()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      nombre_negocio: config.nombre_negocio,
      tasa_iva: config.tasa_iva * 100,       // almacenado como 0.19, mostrado como 19
      formato_papel: config.formato_papel,
      logo_url: config.logo_url ?? '',
    },
  })

  // Sincronizar formulario cuando el contexto carga la config real
  useEffect(() => {
    reset({
      nombre_negocio: config.nombre_negocio,
      tasa_iva: config.tasa_iva * 100,
      formato_papel: config.formato_papel,
      logo_url: config.logo_url ?? '',
    })
  }, [config, reset])

  const mutation = useMutation({
    mutationFn: (data: ConfiguracionRequest) => updateConfiguracion(data),
    onSuccess: (updated) => {
      setConfig(updated)   // Req-11 (11.4, 11.5) — aplica inmediatamente en toda la app
      reset({
        nombre_negocio: updated.nombre_negocio,
        tasa_iva: updated.tasa_iva * 100,
        formato_papel: updated.formato_papel,
        logo_url: updated.logo_url ?? '',
      })
    },
  })

  const onSubmit = async (data: ConfigFormData) => {
    const payload: ConfiguracionRequest = {
      nombre_negocio: data.nombre_negocio,
      tasa_iva: data.tasa_iva / 100,         // convertir de % a decimal
      formato_papel: data.formato_papel,
      logo_url: data.logo_url || null,
    }
    await mutation.mutateAsync(payload)
  }

  const inputClass = (hasError: boolean) =>
    `glass-input w-full rounded-lg px-3 py-2 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-violet-500/60 transition ${
      hasError ? 'border-red-400/70' : ''
    }`

  const formatoPapel = watch('formato_papel')

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="glass h-14 flex items-center px-6 gap-4 sticky top-0 z-40">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="text-white/60 hover:text-white transition text-sm"
        >
          ← Dashboard
        </button>
        <span className="text-white font-bold text-base flex-1">Configuración del Sistema</span>
        {nombre && (
          <span className="text-white/60 text-sm hidden md:block">
            {nombre} · {rol}
          </span>
        )}
      </header>

      <main className="p-6 max-w-2xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">

            {/* Éxito */}
            {mutation.isSuccess && (
              <div
                role="status"
                className="px-4 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm"
              >
                ✓ Configuración guardada correctamente.
              </div>
            )}

            {/* Error */}
            {mutation.isError && (
              <div
                role="alert"
                className="px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-sm"
              >
                ⚠ Error al guardar la configuración. Intenta de nuevo.
              </div>
            )}

            {/* Sección: Negocio */}
            <section className="glass-card p-6 space-y-4">
              <h2 className="text-white font-semibold text-sm uppercase tracking-wider border-b border-white/10 pb-3">
                Datos del negocio
              </h2>

              <div className="flex flex-col gap-1">
                <label htmlFor="nombre_negocio" className="text-sm font-medium text-white/80">
                  Nombre del negocio *
                </label>
                <input
                  id="nombre_negocio"
                  {...register('nombre_negocio')}
                  className={inputClass(!!errors.nombre_negocio)}
                  placeholder="Mi Supermercado"
                />
                {errors.nombre_negocio && (
                  <p className="text-xs text-red-400">{errors.nombre_negocio.message}</p>
                )}
                <p className="text-xs text-white/40">
                  Aparece en el encabezado de cada ticket impreso. Req-12 (12.5)
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="logo_url" className="text-sm font-medium text-white/80">
                  URL del logo <span className="text-white/40">(opcional)</span>
                </label>
                <input
                  id="logo_url"
                  {...register('logo_url')}
                  className={inputClass(!!errors.logo_url)}
                  placeholder="https://ejemplo.com/logo.png"
                  type="url"
                />
                {errors.logo_url && (
                  <p className="text-xs text-red-400">{errors.logo_url.message}</p>
                )}
              </div>
            </section>

            {/* Sección: IVA */}
            <section className="glass-card p-6 space-y-4">
              <h2 className="text-white font-semibold text-sm uppercase tracking-wider border-b border-white/10 pb-3">
                Impuestos
              </h2>

              <div className="flex flex-col gap-1">
                <label htmlFor="tasa_iva" className="text-sm font-medium text-white/80">
                  Tasa de IVA (%) *
                </label>
                <div className="relative">
                  <input
                    id="tasa_iva"
                    {...register('tasa_iva', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    className={`${inputClass(!!errors.tasa_iva)} pr-8`}
                    placeholder="19"
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-white/40 text-sm pointer-events-none">
                    %
                  </span>
                </div>
                {errors.tasa_iva && (
                  <p className="text-xs text-red-400">{errors.tasa_iva.message}</p>
                )}
                <p className="text-xs text-white/40">
                  Se aplica a todos los cálculos del carrito a partir del guardado. Req-11 (11.5)
                </p>
              </div>
            </section>

            {/* Sección: Impresión */}
            <section className="glass-card p-6 space-y-4">
              <h2 className="text-white font-semibold text-sm uppercase tracking-wider border-b border-white/10 pb-3">
                Formato de impresión
              </h2>

              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium text-white/80">Formato de papel *</p>
                <div className="grid grid-cols-3 gap-3">
                  {(['80mm', '58mm', 'carta'] as const).map((fmt) => (
                    <label
                      key={fmt}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border cursor-pointer transition ${
                        formatoPapel === fmt
                          ? 'border-violet-500 bg-violet-500/20 text-violet-300'
                          : 'border-white/15 bg-white/5 text-white/60 hover:border-white/30 hover:text-white/80'
                      }`}
                    >
                      <input
                        type="radio"
                        value={fmt}
                        {...register('formato_papel')}
                        className="sr-only"
                      />
                      {/* Paper icon */}
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className={`${fmt === 'carta' ? 'w-8 h-10' : fmt === '80mm' ? 'w-6 h-10' : 'w-5 h-10'}`}
                        aria-hidden="true"
                      >
                        <rect x="3" y="2" width="18" height="20" rx="2" />
                        <line x1="7" y1="7" x2="17" y2="7" />
                        <line x1="7" y1="11" x2="17" y2="11" />
                        <line x1="7" y1="15" x2="13" y2="15" />
                      </svg>
                      <span className="text-xs font-medium text-center leading-tight">
                        {FORMATO_LABEL[fmt]}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-white/40">
                  Aplica en la siguiente impresión de ticket. Req-11 (11.4), Req-12
                </p>
              </div>
            </section>

            {/* Botón guardar */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  reset({
                    nombre_negocio: config.nombre_negocio,
                    tasa_iva: config.tasa_iva * 100,
                    formato_papel: config.formato_papel,
                    logo_url: config.logo_url ?? '',
                  })
                }
                disabled={!isDirty || isSubmitting}
                className="px-5 py-2 rounded-lg border border-white/20 text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-40 transition text-sm"
              >
                Descartar cambios
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !isDirty}
                className="px-6 py-2 rounded-lg font-semibold text-white bg-linear-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 disabled:opacity-50 transition text-sm flex items-center gap-2"
              >
                {isSubmitting && <Spinner size="sm" />}
                {isSubmitting ? 'Guardando…' : 'Guardar configuración'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
