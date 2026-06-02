/**
 * TicketModal.tsx — Comprobante de venta con impresión
 * Requisitos: Req-6 (6.4, 6.5, 6.6, 6.7), Req-12
 */

import type { VentaResponse } from '../../types/venta.types'

type FormatoPapel = '80mm' | '58mm' | 'carta'

const FORMAT_CLASS: Record<FormatoPapel, string> = {
  '80mm': 'print-80mm',
  '58mm': 'print-58mm',
  carta:  'print-carta',
}

const METODO_LABEL: Record<string, string> = {
  EFECTIVO: 'Efectivo', TARJETA: 'Tarjeta', TRANSFERENCIA: 'Transferencia',
}

interface TicketModalProps {
  isOpen: boolean
  venta: VentaResponse | null
  formatoPapel?: FormatoPapel
  nombreNegocio?: string
  onNuevaVenta: () => void
  onClose: () => void
}

function fmt(n: number): string {
  return '$' + Math.round(n).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('es-CO', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return iso }
}

export default function TicketModal({
  isOpen, venta, formatoPapel = '80mm', nombreNegocio = 'Mi Supermercado',
  onNuevaVenta, onClose,
}: TicketModalProps) {
  if (!isOpen || !venta) return null

  const printClass = FORMAT_CLASS[formatoPapel]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      role="dialog" aria-modal="true" aria-label="Ticket de venta"
    >
      <div
        className="w-full max-w-lg flex flex-col"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: '0.875rem',
          boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2">
            {/* Ícono check verde — venta exitosa */}
            <span className="flex items-center justify-center w-7 h-7 rounded-full text-sm"
              style={{ backgroundColor: 'rgba(16,185,129,0.2)', color: 'var(--success)' }}>
              ✓
            </span>
            <h2 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
              Venta registrada
            </h2>
          </div>
          <button type="button" onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            aria-label="Cerrar">✕</button>
        </div>

        {/* Número de venta destacado */}
        <div className="px-6 pt-4 pb-2 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            N° de venta
          </span>
          <span className="font-bold text-sm font-mono" style={{ color: 'var(--accent)' }}>
            {venta.numero_venta}
          </span>
        </div>

        {/* Ticket imprimible */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          <div
            id="ticket-print"
            className={`${printClass} bg-white text-black p-4 rounded-lg text-sm`}
            style={{ fontFamily: 'monospace' }}
          >
            {/* Encabezado */}
            <div className="text-center mb-3">
              <p className="font-bold text-base uppercase">{nombreNegocio}</p>
              <p className="text-xs">Ticket de Venta</p>
              <p className="text-xs font-bold mt-1">{venta.numero_venta}</p>
              <p className="text-xs">{formatDate(venta.created_at)}</p>
              <p className="text-xs">Cajero: {venta.cajero_nombre}</p>
            </div>

            <div className="border-t border-dashed border-black my-2" />

            {/* Ítems */}
            <div className="mb-2">
              {venta.items.map((item, i) => (
                <div key={i} className="mb-1">
                  <div className="flex justify-between">
                    <span className="flex-1 truncate pr-2">{item.nombre_producto}</span>
                    <span className="shrink-0">{fmt(item.subtotal)}</span>
                  </div>
                  <div className="text-xs text-gray-600 pl-2">
                    {item.cantidad} × {fmt(item.precio_unitario)}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-black my-2" />

            {/* Totales */}
            <div className="space-y-0.5 text-xs">
              <div className="flex justify-between">
                <span>Subtotal sin IVA</span>
                <span>{fmt(venta.subtotal_sin_iva)}</span>
              </div>
              {venta.descuento_monto > 0 && (
                <div className="flex justify-between">
                  <span>Descuento ({(venta.descuento_pct * 100).toFixed(1)}%)</span>
                  <span>-{fmt(venta.descuento_monto)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>IVA 19%</span>
                <span>{fmt(venta.iva_monto)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm border-t border-black pt-1 mt-1">
                <span>TOTAL</span>
                <span>{fmt(venta.total_con_iva)}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-black my-2" />

            {/* Pago */}
            <div className="text-xs space-y-0.5">
              <div className="flex justify-between">
                <span>Método de pago</span>
                <span>{METODO_LABEL[venta.metodo_pago] ?? venta.metodo_pago}</span>
              </div>
              {venta.metodo_pago === 'EFECTIVO' && venta.monto_recibido !== null && (
                <>
                  <div className="flex justify-between">
                    <span>Recibido</span>
                    <span>{fmt(venta.monto_recibido)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Cambio</span>
                    <span>{fmt(venta.cambio ?? 0)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="text-center text-xs mt-3 text-gray-500">
              ¡Gracias por su compra!
            </div>
          </div>
        </div>

        {/* Botones de acción — fuera del área de impresión */}
        <div className="flex gap-2 px-6 py-4" style={{ borderTop: '1px solid var(--border)' }}>
          {/* F7 Imprimir */}
          <button
            type="button" onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-semibold text-sm text-white transition-colors"
            style={{ backgroundColor: 'var(--accent)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
            aria-label="Imprimir ticket (F7)"
          >
            <span className="key" style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>F7</span>
            Imprimir
          </button>

          {/* Guardar PDF */}
          <button
            type="button" onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-medium text-sm btn-secondary"
            aria-label="Guardar como PDF"
          >
            📄 PDF
          </button>

          {/* F8 Nueva Venta */}
          <button
            type="button" onClick={onNuevaVenta}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-semibold text-sm text-white transition-colors"
            style={{ backgroundColor: '#059669' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#047857')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#059669')}
            aria-label="Nueva venta (F8)"
          >
            <span className="key" style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>F8</span>
            Nueva Venta
          </button>
        </div>
      </div>
    </div>
  )
}
