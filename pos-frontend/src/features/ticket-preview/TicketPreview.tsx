import type { VentaResponse } from '../../types/venta.types'
import type { ConfiguracionResponse } from '../../types/reporte.types'

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
  printRootId?: string
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
  printRootId = 'ticket-print',
}: TicketPreviewProps) {
  return (
    <div
      id={printRootId}
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

      <div className="border-t border-dashed border-black my-2" />

      <div className="mb-2">
        {venta.items.map((item, index) => (
          <div key={`${item.nombre_producto}-${index}`} className="mb-1">
            <div className="flex justify-between">
              <span className="flex-1 truncate pr-2">{item.nombre_producto}</span>
              <span className="shrink-0">{fmt(item.subtotal)}</span>
            </div>
            <div className="text-xs text-gray-600 pl-2">
              {item.cantidad} x {fmt(item.precio_unitario)}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-black my-2" />

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

      <div className="text-xs space-y-0.5">
        <div className="flex justify-between">
          <span>Metodo de pago</span>
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
        Gracias por su compra
      </div>
    </div>
  )
}
