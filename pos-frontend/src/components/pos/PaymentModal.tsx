import { useEffect, useRef, useState } from 'react'
import GlassModal from '../ui/GlassModal'
import { calcularCambio } from '../../lib/calcularTotales'
import type { MetodoPago } from '../../types/pos.types'

interface PaymentModalProps {
  isOpen: boolean
  total: number
  metodoPago: MetodoPago | null
  montoPagado: number
  onConfirm: (metodo: MetodoPago, montoPagado: number) => void
  onClose: () => void
}

interface PaymentOption {
  metodo: MetodoPago
  label: string
  icon: string
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  { metodo: 'EFECTIVO',      label: 'Efectivo',       icon: '💵' },
  { metodo: 'TARJETA',       label: 'Tarjeta',         icon: '💳' },
  { metodo: 'TRANSFERENCIA', label: 'Transferencia',   icon: '🏦' },
]

export default function PaymentModal({
  isOpen,
  total,
  metodoPago,
  montoPagado,
  onConfirm,
  onClose,
}: PaymentModalProps) {
  const [selectedMetodo, setSelectedMetodo] = useState<MetodoPago>('EFECTIVO')
  const [montoInput, setMontoInput] = useState<string>('')
  const montoRef = useRef<HTMLInputElement>(null)

  // Initialize state when modal opens (Req-5.1)
  useEffect(() => {
    if (isOpen) {
      setSelectedMetodo(metodoPago ?? 'EFECTIVO')
      setMontoInput(montoPagado > 0 ? montoPagado.toString() : '')
    }
  }, [isOpen, metodoPago, montoPagado])

  // Auto-focus cash input when Efectivo is selected
  useEffect(() => {
    if (isOpen && selectedMetodo === 'EFECTIVO') {
      const timer = setTimeout(() => {
        montoRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen, selectedMetodo])

  const montoNum = parseFloat(montoInput)
  const montoValido = !isNaN(montoNum) && montoNum > 0

  // P-04: cambio = max(0, montoRecibido - total)
  const cambio = montoValido ? calcularCambio(montoNum, total) : 0

  // Req-5.5: disable confirm when Efectivo and monto < total
  const confirmDisabled =
    selectedMetodo === 'EFECTIVO' && (!montoValido || montoNum < total)

  function handleConfirm() {
    if (confirmDisabled) return
    const monto =
      selectedMetodo === 'EFECTIVO' ? parseFloat(montoInput) : total
    onConfirm(selectedMetodo, monto)
  }

  // Req-5.2, Req-5.3: keyboard navigation
  function handleKeyDown(e: React.KeyboardEvent) {
    const currentIndex = PAYMENT_OPTIONS.findIndex(
      (o) => o.metodo === selectedMetodo
    )

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const prevIndex = (currentIndex - 1 + PAYMENT_OPTIONS.length) % PAYMENT_OPTIONS.length
      setSelectedMetodo(PAYMENT_OPTIONS[prevIndex].metodo)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const nextIndex = (currentIndex + 1) % PAYMENT_OPTIONS.length
      setSelectedMetodo(PAYMENT_OPTIONS[nextIndex].metodo)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      handleConfirm()
    } else if (e.key === 'Escape') {
      // Req-5.7: Esc closes without confirming — handled by GlassModal overlay
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
      title="Método de Pago"
    >
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div className="flex flex-col gap-5" onKeyDown={handleKeyDown}>

        {/* Total to pay */}
        <div className="flex justify-between items-center rounded-xl bg-white/5 border border-white/10 px-4 py-3">
          <span className="text-sm text-white/60">Total a pagar</span>
          <span className="text-xl font-bold text-white">${fmt(total)}</span>
        </div>

        {/* Payment options (Req-5.2) */}
        <section aria-label="Método de pago">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">
            Selecciona el método
          </h3>
          <div className="flex flex-col gap-2" role="listbox" aria-label="Métodos de pago">
            {PAYMENT_OPTIONS.map((option) => {
              const isSelected = selectedMetodo === option.metodo
              return (
                <button
                  key={option.metodo}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => setSelectedMetodo(option.metodo)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl border transition text-left
                    ${isSelected
                      ? 'border-violet-400/70 bg-violet-500/20 text-white'
                      : 'border-white/15 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <span className="text-2xl" aria-hidden="true">{option.icon}</span>
                  <span className="font-medium">{option.label}</span>
                  {isSelected && (
                    <span className="ml-auto text-violet-400 text-sm font-semibold">
                      ✓
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </section>

        {/* Cash input — only shown when Efectivo is selected (Req-5.4) */}
        {selectedMetodo === 'EFECTIVO' && (
          <section aria-label="Pago en efectivo">
            <label
              htmlFor="monto-recibido"
              className="block text-sm font-medium text-white/80 mb-1"
            >
              Monto recibido
            </label>
            <input
              ref={montoRef}
              id="monto-recibido"
              type="number"
              min="0"
              step="0.01"
              value={montoInput}
              onChange={(e) => setMontoInput(e.target.value)}
              placeholder={fmt(total)}
              className="glass-input rounded-lg px-4 py-2 text-white placeholder-white/40 outline-none focus:border-violet-400/60 transition w-full"
              aria-describedby="cambio-display"
            />

            {/* Req-5.5: error when monto < total */}
            {montoValido && montoNum < total && (
              <p role="alert" className="text-red-400 text-sm mt-1">
                El monto recibido es menor al total
              </p>
            )}

            {/* Real-time cambio calculation (Req-5.4, P-04) */}
            <div
              id="cambio-display"
              className={`
                flex justify-between items-center rounded-xl px-4 py-3 mt-3 border
                ${montoValido && montoNum >= total
                  ? 'bg-emerald-500/10 border-emerald-400/30'
                  : 'bg-white/5 border-white/10'
                }
              `}
            >
              <span className="text-sm text-white/60">Cambio</span>
              <span
                className={`text-lg font-bold ${
                  montoValido && montoNum >= total
                    ? 'text-emerald-400'
                    : 'text-white/40'
                }`}
              >
                ${fmt(cambio)}
              </span>
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
            disabled={confirmDisabled}
            className={`
              flex-1 py-2 rounded-lg font-semibold text-white transition
              ${confirmDisabled
                ? 'bg-white/10 text-white/30 cursor-not-allowed'
                : 'bg-linear-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400'
              }
            `}
            aria-disabled={confirmDisabled}
          >
            Confirmar (Enter)
          </button>
        </div>

        {/* Keyboard hint */}
        <p className="text-xs text-white/40 text-center">
          ↑↓ para navegar · Enter para confirmar · Esc para cancelar
        </p>
      </div>
    </GlassModal>
  )
}
