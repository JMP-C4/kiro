import { useEffect, useRef, useState } from 'react'
import GlassModal from '../ui/GlassModal'
import { calcularTotales } from '../../lib/calcularTotales'
import type { CartItem, Totales } from '../../types/pos.types'

interface IVAModalProps {
  isOpen: boolean
  totales: Totales
  descuentoPct: number   // current discount as decimal (0-1), e.g. 0.10 for 10%
  items: CartItem[]
  onConfirm: (descuentoPct: number) => void  // called with decimal (0-1)
  onClose: () => void
}

export default function IVAModal({
  isOpen,
  totales,
  descuentoPct,
  items,
  onConfirm,
  onClose,
}: IVAModalProps) {
  // Input state: percentage string (0-100), e.g. "10" for 10%
  const [inputDescuento, setInputDescuento] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Initialize input when modal opens (Req-4.1)
  useEffect(() => {
    if (isOpen) {
      setInputDescuento((descuentoPct * 100).toString())
      setError(null)
      // Auto-focus the discount input
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen, descuentoPct])

  // Compute preview totals in real-time as user types (Req-4.3)
  const inputNum = parseFloat(inputDescuento)
  const inputValid = !isNaN(inputNum) && inputNum >= 0 && inputNum <= 100
  const previewDescuentoPct = inputValid ? inputNum / 100 : descuentoPct
  const previewTotales: Totales = calcularTotales(items, 0.19, previewDescuentoPct)

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputDescuento(e.target.value)
    if (error) setError(null)
  }

  function handleConfirm() {
    const val = parseFloat(inputDescuento)

    // Req-4.4: validate range 0-100
    if (isNaN(val) || val < 0 || val > 100) {
      setError('El descuento debe estar entre 0 y 100')
      return
    }

    setError(null)
    onConfirm(val / 100)  // convert % to decimal
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleConfirm()
    } else if (e.key === 'Escape') {
      // Req-4.6: Esc closes without changes
      e.preventDefault()
      onClose()
    }
  }

  const fmt = (n: number) =>
    n.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="IVA y Descuento"
    >
      <div className="flex flex-col gap-5" onKeyDown={handleKeyDown}>

        {/* Current totals breakdown (Req-4.2) */}
        <section aria-label="Totales actuales">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">
            Totales actuales
          </h3>
          <div className="flex flex-col gap-1 rounded-xl bg-white/5 border border-white/10 px-4 py-3">
            <div className="flex justify-between text-sm text-white/70">
              <span>Subtotal sin IVA</span>
              <span>${fmt(totales.subtotalSinIVA)}</span>
            </div>
            {totales.descuentoMonto > 0 && (
              <div className="flex justify-between text-sm text-emerald-400">
                <span>Descuento</span>
                <span>−${fmt(totales.descuentoMonto)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-white/70">
              <span>IVA 19%</span>
              <span>${fmt(totales.montoIVA)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-white border-t border-white/10 pt-2 mt-1">
              <span>Total con IVA</span>
              <span>${fmt(totales.totalConIVA)}</span>
            </div>
          </div>
        </section>

        {/* Discount input (Req-4.3, Req-4.4) */}
        <section aria-label="Descuento global">
          <label
            htmlFor="descuento-input"
            className="block text-sm font-medium text-white/80 mb-1"
          >
            Descuento global (%)
          </label>
          <input
            ref={inputRef}
            id="descuento-input"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={inputDescuento}
            onChange={handleInputChange}
            placeholder="0"
            className="glass-input rounded-lg px-4 py-2 text-white placeholder-white/40 outline-none focus:border-violet-400/60 transition w-full"
            aria-describedby={error ? 'descuento-error' : undefined}
            aria-invalid={error ? 'true' : undefined}
          />
          {error && (
            <p
              id="descuento-error"
              role="alert"
              className="text-red-400 text-sm mt-1"
            >
              {error}
            </p>
          )}
        </section>

        {/* Live preview of recalculated totals (Req-4.3) */}
        {inputValid && (
          <section aria-label="Vista previa con descuento">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">
              Vista previa
            </h3>
            <div className="flex flex-col gap-1 rounded-xl bg-violet-500/10 border border-violet-400/20 px-4 py-3">
              <div className="flex justify-between text-sm text-white/70">
                <span>Subtotal sin IVA</span>
                <span>${fmt(previewTotales.subtotalSinIVA)}</span>
              </div>
              {previewTotales.descuentoMonto > 0 && (
                <div className="flex justify-between text-sm text-emerald-400">
                  <span>Descuento ({inputNum.toFixed(1)}%)</span>
                  <span>−${fmt(previewTotales.descuentoMonto)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-white/70">
                <span>IVA 19%</span>
                <span>${fmt(previewTotales.montoIVA)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-violet-300 border-t border-violet-400/20 pt-2 mt-1">
                <span>Total con IVA</span>
                <span>${fmt(previewTotales.totalConIVA)}</span>
              </div>
            </div>
          </section>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 mt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-white/20 text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            Cancelar (Esc)
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-2 rounded-lg font-semibold text-white transition
              bg-linear-to-r from-violet-600 to-violet-500
              hover:from-violet-500 hover:to-violet-400"
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
