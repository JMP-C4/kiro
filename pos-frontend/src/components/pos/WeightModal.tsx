/**
 * WeightModal.tsx — Modal de peso para productos a granel
 * Req-2 (2.6, 2.7, 2.8, 2.9)
 *
 * El estado se resetea usando una `key` que cambia en cada apertura,
 * evitando llamar setState dentro de useEffect.
 */

import { useEffect, useRef, useState } from 'react'
import GlassModal from '../ui/GlassModal'
import type { ProductoSearchResult } from '../../types/producto.types'

interface WeightModalProps {
  isOpen: boolean
  producto: ProductoSearchResult | null
  onConfirm: (producto: ProductoSearchResult, peso: number) => void
  onCancel: () => void
}

// ---------------------------------------------------------------------------
// Contenido interno — se monta fresco en cada apertura gracias a la key
// ---------------------------------------------------------------------------
function Content({
  producto,
  onConfirm,
  onCancel,
}: {
  producto: ProductoSearchResult
  onConfirm: (p: ProductoSearchResult, peso: number) => void
  onCancel: () => void
}) {
  const [peso, setPeso] = useState('')
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus al montar — Req-2.6
  // No hay setState síncrono aquí, solo el timer
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 50)
    return () => clearTimeout(t)
  }, [])

  const pesoNum = parseFloat(peso)
  const pesoValido = !isNaN(pesoNum) && pesoNum > 0
  const subtotal = pesoValido ? producto.precio * pesoNum : null

  function confirm() {
    if (!pesoValido) { setError('El peso debe ser mayor a cero'); return }
    onConfirm(producto, pesoNum)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter')  { e.preventDefault(); confirm() }
    if (e.key === 'Escape') { e.preventDefault(); onCancel() }
  }

  const fmt = (n: number) =>
    '$' + n.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="flex flex-col gap-4" onKeyDown={onKeyDown}>

      {/* Precio por unidad */}
      <div className="flex items-center justify-between text-sm"
        style={{ color: 'var(--text-secondary)' }}>
        <span>Precio por {producto.unidad_medida}</span>
        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
          {fmt(producto.precio)}
        </span>
      </div>

      {/* Input de peso */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="weight-input" className="text-sm font-medium"
          style={{ color: 'var(--text-secondary)' }}>
          Peso ({producto.unidad_medida})
        </label>
        <input
          ref={inputRef}
          id="weight-input"
          type="number"
          min="0.001"
          step="0.001"
          value={peso}
          onChange={e => { setPeso(e.target.value); if (error) setError(null) }}
          placeholder={`Ej: 1.5 ${producto.unidad_medida}`}
          className={`field ${error ? 'field-error' : ''}`}
          aria-describedby={error ? 'weight-error' : undefined}
          aria-invalid={error ? 'true' : undefined}
        />
        {error && (
          <p id="weight-error" role="alert" className="text-xs"
            style={{ color: 'var(--danger)' }}>
            {error}
          </p>
        )}
      </div>

      {/* Subtotal en tiempo real — Req-2.7 */}
      <div className="flex items-center justify-between py-3 px-4 rounded-lg"
        style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Subtotal</span>
        <span className="text-2xl font-bold"
          style={{ color: subtotal ? 'var(--accent)' : 'var(--text-muted)' }}>
          {subtotal !== null ? fmt(subtotal) : '—'}
        </span>
      </div>

      {/* Botones */}
      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1 justify-center">
          Cancelar
        </button>
        <button type="button" onClick={confirm} disabled={!pesoValido}
          className="btn-primary flex-1 justify-center">
          Confirmar
        </button>
      </div>

      <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
        Enter para confirmar · Esc para cancelar
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Componente público
// ---------------------------------------------------------------------------
export default function WeightModal({ isOpen, producto, onConfirm, onCancel }: WeightModalProps) {
  if (!producto) return null

  return (
    <GlassModal isOpen={isOpen} onClose={onCancel}
      title={`Peso — ${producto.nombre}`}>
      {/* key cambia al abrir → Content se monta fresco → estado limpio */}
      <Content
        key={isOpen ? producto.id : 'closed'}
        producto={producto}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    </GlassModal>
  )
}
