/**
 * ProductoForm.tsx — Formulario de creación/edición de productos.
 * Req-8 (8.7)
 */

import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Producto } from '../../types/producto.types'
import GlassModal from '../ui/GlassModal'

// ---------------------------------------------------------------------------
// Schema — precio es number nativo (el input usa valueAsNumber)
// ---------------------------------------------------------------------------
const productoSchema = z.object({
  codigo: z
    .string()
    .min(1, 'El código es obligatorio')
    .max(50, 'Máximo 50 caracteres')
    .regex(/^[a-zA-Z0-9\-_.]+$/, 'Solo letras, números, guiones y puntos'),
  nombre: z.string().min(1, 'El nombre es obligatorio').max(200, 'Máximo 200 caracteres'),
  descripcion: z.string().max(500).optional(),
  categoria: z.string().max(100).optional(),
  precio: z.number({ message: 'El precio debe ser un número' }).positive('El precio debe ser mayor a 0'),
  incluye_iva: z.boolean(),
  unidad_medida: z.enum(['und', 'kg', 'g', 'lb']),
})

type ProductoFormData = z.infer<typeof productoSchema>

interface ProductoFormProps {
  isOpen: boolean
  producto?: Producto | null
  onSubmit: (data: ProductoFormData) => Promise<void>
  onClose: () => void
}

export default function ProductoForm({ isOpen, producto, onSubmit, onClose }: ProductoFormProps) {
  const isEdit = !!producto
  const codigoRef = useRef<HTMLInputElement | null>(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<ProductoFormData>({
      resolver: zodResolver(productoSchema),
      defaultValues: { codigo: '', nombre: '', descripcion: '', categoria: '', precio: 0, incluye_iva: false, unidad_medida: 'und' },
    })

  const { ref: codigoFormRef, ...codigoRest } = register('codigo')

  useEffect(() => {
    if (!isOpen) return
    if (producto) {
      reset({
        codigo: producto.codigo,
        nombre: producto.nombre,
        descripcion: producto.descripcion ?? '',
        categoria: producto.categoria ?? '',
        precio: producto.precio,
        incluye_iva: producto.incluye_iva,
        unidad_medida: (producto.unidad_medida as 'und'|'kg'|'g'|'lb') ?? 'und',
      })
    } else {
      reset({ codigo: '', nombre: '', descripcion: '', categoria: '', precio: 0, incluye_iva: false, unidad_medida: 'und' })
      setTimeout(() => codigoRef.current?.focus(), 50)
    }
  }, [isOpen, producto, reset])

  const cls = (err: boolean) =>
    `glass-input w-full rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500/60 transition ${err ? 'border-red-400/70' : ''}`

  return (
    <GlassModal isOpen={isOpen} onClose={onClose}
      title={isEdit ? 'Editar Producto' : 'Nuevo Producto'} className="max-w-xl">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">

        {/* Código + Unidad */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="prod-codigo" className="text-sm font-medium text-white/80">Código *</label>
            <input id="prod-codigo" {...codigoRest}
              ref={(el) => { codigoFormRef(el); codigoRef.current = el }}
              className={cls(!!errors.codigo)} placeholder="Escanear o escribir código"
              autoComplete="off" spellCheck={false}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  const fields = Array.from(e.currentTarget.form?.querySelectorAll<HTMLElement>(
                    'input:not([type=checkbox]), select, textarea') ?? [])
                  fields[fields.indexOf(e.currentTarget) + 1]?.focus()
                }
              }}
            />
            {errors.codigo && <p className="text-xs text-red-400">{errors.codigo.message}</p>}
            <p className="text-xs text-white/30">EAN-13, UPC-A o código interno</p>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="prod-unidad" className="text-sm font-medium text-white/80">Unidad *</label>
            <select id="prod-unidad" {...register('unidad_medida')}
              className={`${cls(!!errors.unidad_medida)} bg-slate-800`}>
              <option value="und">Unidad (und)</option>
              <option value="kg">Kilogramo (kg)</option>
              <option value="g">Gramo (g)</option>
              <option value="lb">Libra (lb)</option>
            </select>
            <p className="text-xs text-white/30">kg/g/lb activa modal de peso</p>
          </div>
        </div>

        {/* Nombre */}
        <div className="flex flex-col gap-1">
          <label htmlFor="prod-nombre" className="text-sm font-medium text-white/80">Nombre *</label>
          <input id="prod-nombre" {...register('nombre')}
            className={cls(!!errors.nombre)} placeholder="Ej: Arroz Diana 1kg" />
          {errors.nombre && <p className="text-xs text-red-400">{errors.nombre.message}</p>}
        </div>

        {/* Categoría + Precio */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="prod-categoria" className="text-sm font-medium text-white/80">Categoría</label>
            <input id="prod-categoria" {...register('categoria')} className={cls(false)} placeholder="Ej: Lácteos" />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="prod-precio" className="text-sm font-medium text-white/80">Precio *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-white/40 text-sm pointer-events-none">$</span>
              <input id="prod-precio"
                {...register('precio', { valueAsNumber: true })}
                type="number" min="0" step="1"
                className={`${cls(!!errors.precio)} pl-7`} placeholder="0" />
            </div>
            {errors.precio && <p className="text-xs text-red-400">{errors.precio.message}</p>}
          </div>
        </div>

        {/* Descripción */}
        <div className="flex flex-col gap-1">
          <label htmlFor="prod-descripcion" className="text-sm font-medium text-white/80">
            Descripción <span className="text-white/40">(opcional)</span>
          </label>
          <textarea id="prod-descripcion" {...register('descripcion')}
            rows={2} className={`${cls(false)} resize-none`} placeholder="Descripción del producto" />
        </div>

        {/* IVA */}
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input {...register('incluye_iva')} type="checkbox" className="w-4 h-4 rounded accent-violet-500" />
          <span className="text-sm text-white/80">
            El precio ya incluye IVA
            <span className="ml-1 text-white/40 text-xs">(si no, se agrega el 19% al cobrar)</span>
          </span>
        </label>

        {/* Botones */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-white/20 text-white/70 hover:text-white hover:bg-white/10 transition">
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting}
            className="flex-1 py-2 rounded-lg font-semibold text-white bg-linear-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 disabled:opacity-50 transition">
            {isSubmitting ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </div>
      </form>
    </GlassModal>
  )
}
