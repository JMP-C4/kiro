/**
 * ProductoForm.tsx
 *
 * Form for creating and editing products.
 * Uses React Hook Form + Zod validation.
 * Req-8 (8.7)
 */

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Producto } from '../../types/producto.types'
import GlassModal from '../ui/GlassModal'

const productoSchema = z.object({
  codigo: z.string().min(1, 'El código es obligatorio'),
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().optional(),
  categoria: z.string().optional(),
  precio: z.coerce.number().positive('El precio debe ser mayor a 0'),
  incluye_iva: z.boolean(),
  unidad_medida: z.enum(['und', 'kg', 'g', 'lb'], { errorMap: () => ({ message: 'Unidad inválida' }) }),
})

type ProductoFormData = z.infer<typeof productoSchema>

interface ProductoFormProps {
  isOpen: boolean
  producto?: Producto | null  // null = create mode
  onSubmit: (data: ProductoFormData) => Promise<void>
  onClose: () => void
}

export default function ProductoForm({ isOpen, producto, onSubmit, onClose }: ProductoFormProps) {
  const isEdit = !!producto

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductoFormData>({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      codigo: '',
      nombre: '',
      descripcion: '',
      categoria: '',
      precio: 0,
      incluye_iva: false,
      unidad_medida: 'und',
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (isOpen && producto) {
      reset({
        codigo: producto.codigo,
        nombre: producto.nombre,
        descripcion: producto.descripcion ?? '',
        categoria: producto.categoria ?? '',
        precio: producto.precio,
        incluye_iva: producto.incluye_iva,
        unidad_medida: producto.unidad_medida as 'und' | 'kg' | 'g' | 'lb',
      })
    } else if (isOpen && !producto) {
      reset({
        codigo: '',
        nombre: '',
        descripcion: '',
        categoria: '',
        precio: 0,
        incluye_iva: false,
        unidad_medida: 'und',
      })
    }
  }, [isOpen, producto, reset])

  const inputClass = (hasError: boolean) =>
    `glass-input w-full rounded-lg px-3 py-2 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-violet-500/60 transition ${hasError ? 'border-red-400/70' : ''}`

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Editar Producto' : 'Nuevo Producto'}
      className="max-w-xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          {/* Código */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-white/80">Código *</label>
            <input {...register('codigo')} className={inputClass(!!errors.codigo)} placeholder="EJ: 001" />
            {errors.codigo && <p className="text-xs text-red-400">{errors.codigo.message}</p>}
          </div>

          {/* Unidad de medida */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-white/80">Unidad *</label>
            <select
              {...register('unidad_medida')}
              className={`${inputClass(!!errors.unidad_medida)} bg-slate-800`}
            >
              <option value="und">Unidad (und)</option>
              <option value="kg">Kilogramo (kg)</option>
              <option value="g">Gramo (g)</option>
              <option value="lb">Libra (lb)</option>
            </select>
            {errors.unidad_medida && <p className="text-xs text-red-400">{errors.unidad_medida.message}</p>}
          </div>
        </div>

        {/* Nombre */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-white/80">Nombre *</label>
          <input {...register('nombre')} className={inputClass(!!errors.nombre)} placeholder="Nombre del producto" />
          {errors.nombre && <p className="text-xs text-red-400">{errors.nombre.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Categoría */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-white/80">Categoría</label>
            <input {...register('categoria')} className={inputClass(false)} placeholder="Ej: Lácteos" />
          </div>

          {/* Precio */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-white/80">Precio *</label>
            <input
              {...register('precio')}
              type="number"
              min="0"
              step="0.01"
              className={inputClass(!!errors.precio)}
              placeholder="0.00"
            />
            {errors.precio && <p className="text-xs text-red-400">{errors.precio.message}</p>}
          </div>
        </div>

        {/* Descripción */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-white/80">Descripción</label>
          <textarea
            {...register('descripcion')}
            rows={2}
            className={`${inputClass(false)} resize-none`}
            placeholder="Descripción opcional"
          />
        </div>

        {/* Incluye IVA */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            {...register('incluye_iva')}
            type="checkbox"
            className="w-4 h-4 rounded accent-violet-500"
          />
          <span className="text-sm text-white/80">El precio ya incluye IVA</span>
        </label>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-white/20 text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-2 rounded-lg font-semibold text-white bg-linear-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isSubmitting ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </div>
      </form>
    </GlassModal>
  )
}
