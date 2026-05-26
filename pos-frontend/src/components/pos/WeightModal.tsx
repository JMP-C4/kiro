import { useEffect, useRef, useState } from 'react'
import GlassModal from '../ui/GlassModal'
import type { ProductoSearchResult } from '../../types/producto.types'

interface WeightModalProps {
  isOpen: boolean
  producto: ProductoSearchResult | null
  onConfirm: (producto: ProductoSearchResult, peso: number) => void
  onCancel: () => void
}

export default function WeightModal({
  isOpen,
  producto,
  onConfirm,
  onCancel,
}: WeightModalProps) {
  const [peso, setPeso] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus the weight input when modal opens (Req-2.6)
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small delay to let GlassModal render and focus trap settle
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Reset state when modal closes or product changes
  useEffect(() => {
    if (!isOpen) {
      setPeso('')
      setError(null)
    }
  }, [isOpen])

  const pesoNumerico = parseFloat(peso)
  const pesoValido = !isNaN(pesoNumerico) && pesoNumerico > 0
  const subtotal = producto && pesoValido ? producto.precio * pesoNumerico : null

  function handleConfirm() {
    if (!producto) return

    if (!pesoValido) {
      // Req-2.8: show error if peso <= 0 or NaN
      setError('El peso debe ser mayor a cero')
      return
    }

    setError(null)
    onConfirm(producto, pesoNumerico)
    setPeso('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleConfirm()
    } else if (e.key === 'Escape') {
      // Req-2.9: Esc cancels without adding to cart
      e.preventDefault()
      setPeso('')
      setError(null)
      onCancel()
    }
  }

  function handlePesoChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPeso(e.target.value)
    // Clear error as user types
    if (error) setError(null)
  }

  if (!producto) return null

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onCancel}
      title={`Ingresar peso — ${producto.nombre}`}
    >
      <div
        className="flex flex-col gap-4"
        onKeyDown={handleKeyDown}
      >
        {/* Product info */}
        <div className="flex items-center justify-between text-sm text-white/70">
          <span>Precio por {producto.unidad_medida}</span>
          <span className="font-semibold text-white">
            ${producto.precio.toFixed(2)}
          </span>
        </div>

        {/* Weight input */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="weight-input"
            className="text-sm font-medium text-white/80"
          >
            Peso ({producto.unidad_medida})
          </label>
          <input
            ref={inputRef}
            id="weight-input"
            type="number"
            min="0.001"
            step="0.001"
            value={peso}
            onChange={handlePesoChange}
            placeholder={`Ej: 1.5 ${producto.unidad_medida}`}
            className="glass-input rounded-lg px-4 py-2 text-white placeholder-white/40 outline-none focus:border-violet-400/60 transition w-full"
            aria-describedby={error ? 'weight-error' : undefined}
            aria-invalid={error ? 'true' : undefined}
          />
          {error && (
            <p
              id="weight-error"
              role="alert"
              className="text-red-400 text-sm mt-1"
            >
              {error}
            </p>
          )}
        </div>

        {/* Real-time subtotal (Req-2.7) */}
        <div className="flex items-center justify-between py-2 border-t border-white/10">
          <span className="text-sm text-white/70">Subtotal</span>
          <span className="text-2xl font-bold text-violet-400">
            {subtotal !== null ? `$${subtotal.toFixed(2)}` : '—'}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg border border-white/20 text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            Cancelar (Esc)
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!pesoValido}
            className="flex-1 py-2 rounded-lg font-semibold text-white transition
              bg-gradient-to-r from-violet-600 to-violet-500
              hover:from-violet-500 hover:to-violet-400
              disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-violet-600 disabled:hover:to-violet-500"
          >
            Confirmar (Enter)
          </button>
        </div>

        {/* Keyboard hint */}
        <p className="text-xs text-white/40 text-center">
          Enter para confirmar · Esc para cancelar
        </p>
      </div>
    </GlassModal>
  )
}
