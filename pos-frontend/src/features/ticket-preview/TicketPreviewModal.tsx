import type { VentaResponse } from '../../types/venta.types'
import TicketPreview, { type FormatoPapel } from './TicketPreview'

interface TicketPreviewModalProps {
  isOpen: boolean
  venta: VentaResponse | null
  formatoPapel?: FormatoPapel
  nombreNegocio?: string
  onNuevaVenta: () => void
  onClose: () => void
}

export default function TicketPreviewModal({
  isOpen,
  venta,
  formatoPapel = '80mm',
  nombreNegocio = 'Mi Supermercado',
  onNuevaVenta,
  onClose,
}: TicketPreviewModalProps) {
  if (!isOpen || !venta) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Ticket de venta"
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
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2">
            <span
              className="flex items-center justify-center w-7 h-7 rounded-full text-sm"
              style={{ backgroundColor: 'rgba(16,185,129,0.2)', color: 'var(--success)' }}
            >
              ✓
            </span>
            <h2 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
              Venta registrada
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            aria-label="Cerrar"
          >
            x
          </button>
        </div>

        <div className="px-6 pt-4 pb-2 flex items-center justify-between">
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--text-muted)' }}
          >
            N de venta
          </span>
          <span className="font-bold text-sm font-mono" style={{ color: 'var(--accent)' }}>
            {venta.numero_venta}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-4">
          <TicketPreview
            venta={venta}
            formatoPapel={formatoPapel}
            nombreNegocio={nombreNegocio}
          />
        </div>

        <div className="flex gap-2 px-6 py-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-semibold text-sm text-white transition-colors"
            style={{ backgroundColor: 'var(--accent)' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
            aria-label="Imprimir ticket (F7)"
          >
            <span
              className="key"
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderColor: 'rgba(255,255,255,0.3)',
                color: '#fff',
              }}
            >
              F7
            </span>
            Imprimir
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-medium text-sm btn-secondary"
            aria-label="Guardar como PDF"
          >
            PDF
          </button>

          <button
            type="button"
            onClick={onNuevaVenta}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-semibold text-sm text-white transition-colors"
            style={{ backgroundColor: '#059669' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#047857')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#059669')}
            aria-label="Nueva venta (F8)"
          >
            <span
              className="key"
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderColor: 'rgba(255,255,255,0.3)',
                color: '#fff',
              }}
            >
              F8
            </span>
            Nueva venta
          </button>
        </div>
      </div>
    </div>
  )
}
