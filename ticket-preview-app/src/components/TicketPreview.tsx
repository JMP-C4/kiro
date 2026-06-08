import type { ConfiguracionResponse } from '../types/config.types'
import type { VentaResponse } from '../types/venta.types'

export type FormatoPapel = ConfiguracionResponse['formato_papel']

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

interface TicketPreviewProps {
  venta: VentaResponse
  formatoPapel?: FormatoPapel
  nombreNegocio?: string
}

function fmt(n: number): string {
  return '$' + Math.round(n).toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
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

export default function TicketPreview({
  venta,
  formatoPapel = '80mm',
  nombreNegocio = 'Mi Supermercado',
}: TicketPreviewProps) {
  return (
    <div
      id="ticket-print"
      className={`${FORMAT_CLASS[formatoPapel]} bg-white text-black p-4 rounded-lg text-sm`}
      style={{ fontFamily: 'monospace' }}
    >
      <div className="text-center mb-3">
        <p className="font-bold text-base uppercase">{nombreNegocio}</p>
        <p className="text-xs">Ticket de Venta</p>
        <p className="text-xs font-bold mt-1">{venta.numero_venta}</p>
        <p className="text-xs">{formatDate(venta.created_at)}</p>
        <p className="text-xs">Cajero: {venta.cajero_nombre}</p>
      </div>

      <div className="divider" />

      <div className="mb-2">
        {venta.items.map((item) => (
          <div key={`${venta.id}-${item.idx}`} className="mb-1">
            <div className="row-between">
              <span className="truncate pr-2">{item.nombre_producto}</span>
              <span>{fmt(item.subtotal)}</span>
            </div>
            <div className="ticket-note">
              {item.cantidad} x {fmt(item.precio_unitario)}
            </div>
          </div>
        ))}
      </div>

      <div className="divider" />

      <div className="ticket-block">
        <div className="row-between">
          <span>Subtotal sin IVA</span>
          <span>{fmt(venta.subtotal_sin_iva)}</span>
        </div>
        {venta.descuento_monto > 0 && (
          <div className="row-between">
            <span>Descuento ({(venta.descuento_pct * 100).toFixed(1)}%)</span>
            <span>-{fmt(venta.descuento_monto)}</span>
          </div>
        )}
        <div className="row-between">
          <span>IVA 19%</span>
          <span>{fmt(venta.iva_monto)}</span>
        </div>
        <div className="row-between total-row">
          <span>TOTAL</span>
          <span>{fmt(venta.total_con_iva)}</span>
        </div>
      </div>

      <div className="divider" />

      <div className="ticket-block">
        <div className="row-between">
          <span>Metodo de pago</span>
          <span>{METODO_LABEL[venta.metodo_pago] ?? venta.metodo_pago}</span>
        </div>
        {venta.metodo_pago === 'EFECTIVO' && venta.monto_recibido !== null && (
          <>
            <div className="row-between">
              <span>Recibido</span>
              <span>{fmt(venta.monto_recibido)}</span>
            </div>
            <div className="row-between total-row no-border">
              <span>Cambio</span>
              <span>{fmt(venta.cambio ?? 0)}</span>
            </div>
          </>
        )}
      </div>

      <div className="footer-copy">Gracias por su compra</div>
    </div>
  )
}
