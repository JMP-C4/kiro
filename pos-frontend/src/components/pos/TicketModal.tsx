/**
 * TicketModal.tsx
 *
 * Displays the sale receipt after a successful transaction.
 * The ticket content is inside <div id="ticket-print"> so that
 * @media print styles in index.css hide everything else.
 *
 * Buttons:
 *   F7 Imprimir   → window.print()
 *   Guardar PDF   → window.print() (browser handles PDF destination)
 *   F8 Nueva Venta → onNuevaVenta()
 *
 * Requisitos: Req-6 (6.4, 6.5, 6.6, 6.7), Req-12
 */

import type { VentaResponse } from '../../types/venta.types'

type FormatoPapel = '80mm' | '58mm' | 'carta'

const FORMAT_CLASS: Record<FormatoPapel, string> = {
  '80mm': 'print-80mm',
  '58mm': 'print-58mm',
  carta: 'print-carta',
}

const METODO_LABEL: Record<string, string> = {
  EFECTIVO: 'Efectivo',
  TARJETA: 'Tarjeta',
  TRANSFERENCIA: 'Transferencia',
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
  return (
    '$' +
    n.toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  )
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export default function TicketModal({
  isOpen,
  venta,
  formatoPapel = '80mm',
  nombreNegocio = 'Mi Supermercado',
  onNuevaVenta,
  onClose,
}: TicketModalProps) {
  if (!isOpen || !venta) return null

  const printClass = FORMAT_CLASS[formatoPapel]

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Ticket de venta"
    >
      <div className="glass-modal rounded-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-white font-semibold text-lg">Ticket de Venta</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Scrollable ticket content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* ── Printable ticket ─────────────────────────────────────── */}
          <div
            id="ticket-print"
            className={`${printClass} bg-white text-black p-4 rounded-lg font-mono text-sm`}
          >
            {/* Header */}
            <div className="text-center mb-3">
              <p className="font-bold text-base uppercase">{nombreNegocio}</p>
              <p className="text-xs">Ticket de Venta</p>
              <p className="text-xs font-bold mt-1">{venta.numeroVenta}</p>
              <p className="text-xs">{formatDate(venta.createdAt)}</p>
              <p className="text-xs">Cajero: {venta.cajeroNombre}</p>
            </div>

            <div className="border-t border-dashed border-black my-2" />

            {/* Items */}
            <div className="mb-2">
              {venta.items.map((item) => (
                <div key={item.id} className="mb-1">
                  <div className="flex justify-between">
                    <span className="flex-1 truncate pr-2">{item.nombreProducto}</span>
                    <span className="shrink-0">{fmt(item.subtotal)}</span>
                  </div>
                  <div className="text-xs text-gray-600 pl-2">
                    {item.cantidad} × {fmt(item.precioUnitario)}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-black my-2" />

            {/* Totals */}
            <div className="space-y-0.5 text-xs">
              <div className="flex justify-between">
                <span>Subtotal sin IVA</span>
                <span>{fmt(venta.subtotalSinIva)}</span>
              </div>
              {venta.descuentoMonto > 0 && (
                <div className="flex justify-between">
                  <span>Descuento ({(venta.descuentoPct * 100).toFixed(1)}%)</span>
                  <span>-{fmt(venta.descuentoMonto)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>IVA 19%</span>
                <span>{fmt(venta.ivaMonto)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm border-t border-black pt-1 mt-1">
                <span>TOTAL</span>
                <span>{fmt(venta.totalConIva)}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-black my-2" />

            {/* Payment info */}
            <div className="text-xs space-y-0.5">
              <div className="flex justify-between">
                <span>Método de pago</span>
                <span>{METODO_LABEL[venta.metodoPago] ?? venta.metodoPago}</span>
              </div>
              {venta.metodoPago === 'EFECTIVO' && venta.montoRecibido !== null && (
                <>
                  <div className="flex justify-between">
                    <span>Recibido</span>
                    <span>{fmt(venta.montoRecibido)}</span>
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

        {/* Action buttons — NOT inside #ticket-print */}
        <div className="flex gap-3 px-6 py-4 border-t border-white/10">
          {/* F7 Imprimir */}
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-linear-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white font-semibold text-sm transition"
            aria-label="Imprimir ticket (F7)"
          >
            <kbd className="inline-flex items-center justify-center w-6 h-6 rounded bg-white/20 font-mono text-xs">F7</kbd>
            Imprimir
          </button>

          {/* Guardar PDF */}
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white font-semibold text-sm transition border border-white/20"
            aria-label="Guardar como PDF"
          >
            PDF
          </button>

          {/* F8 Nueva Venta */}
          <button
            type="button"
            onClick={onNuevaVenta}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold text-sm transition"
            aria-label="Nueva venta (F8)"
          >
            <kbd className="inline-flex items-center justify-center w-6 h-6 rounded bg-white/20 font-mono text-xs">F8</kbd>
            Nueva Venta
          </button>
        </div>
      </div>
    </div>
  )
}
