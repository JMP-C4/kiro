import { useEffect, useMemo, useState } from 'react'
import TicketPreview from './components/TicketPreview'
import {
  ensureMockDb,
  getConfiguracion,
  listVentas,
  resetMockDb,
  updateConfiguracion,
} from './db/ticketDatabase'
import type { ConfiguracionResponse } from './types/config.types'
import type { VentaResponse } from './types/venta.types'

export default function App() {
  const [config, setConfig] = useState<ConfiguracionResponse | null>(null)
  const [ventas, setVentas] = useState<VentaResponse[]>([])
  const [selectedVentaId, setSelectedVentaId] = useState<string>('')

  useEffect(() => {
    ensureMockDb()
    const loadedConfig = getConfiguracion()
    const loadedVentas = listVentas()

    setConfig(loadedConfig)
    setVentas(loadedVentas)
    setSelectedVentaId(loadedVentas[0]?.id ?? '')
  }, [])

  const selectedVenta = useMemo(
    () => ventas.find((venta) => venta.id === selectedVentaId) ?? ventas[0] ?? null,
    [selectedVentaId, ventas],
  )

  const refreshVentas = () => {
    setVentas(listVentas())
  }

  const handleConfigChange = <K extends keyof ConfiguracionResponse>(
    key: K,
    value: ConfiguracionResponse[K],
  ) => {
    const updated = updateConfiguracion({ [key]: value } as Partial<ConfiguracionResponse>)
    setConfig(updated)
    refreshVentas()
  }

  const handleReset = () => {
    resetMockDb()
    const loadedConfig = getConfiguracion()
    const loadedVentas = listVentas()
    setConfig(loadedConfig)
    setVentas(loadedVentas)
    setSelectedVentaId(loadedVentas[0]?.id ?? '')
  }

  if (!config || !selectedVenta) {
    return <div className="app-shell centered">Cargando preview del ticket...</div>
  }

  return (
    <div className="app-shell">
      <main className="app-grid">
        <section className="panel">
          <div className="panel-copy">
            <p className="eyebrow">Proyecto aparte</p>
            <h1>Ticket Preview App</h1>
            <p>
              Esta app duplica la visual del ticket como mini proyecto standalone y se alimenta
              desde una DB mock en TypeScript con persistencia en `localStorage`.
            </p>
          </div>

          <div className="form-block">
            <label>
              <span>Nombre del negocio</span>
              <input
                value={config.nombre_negocio}
                onChange={(e) => handleConfigChange('nombre_negocio', e.target.value)}
              />
            </label>

            <label>
              <span>Formato de papel</span>
              <select
                value={config.formato_papel}
                onChange={(e) =>
                  handleConfigChange('formato_papel', e.target.value as ConfiguracionResponse['formato_papel'])
                }
              >
                <option value="80mm">80mm</option>
                <option value="58mm">58mm</option>
                <option value="carta">Carta</option>
              </select>
            </label>
          </div>

          <div className="toolbar">
            <button type="button" className="btn-primary" onClick={() => window.print()}>
              Imprimir
            </button>
            <button type="button" className="btn-secondary" onClick={handleReset}>
              Reset DB
            </button>
          </div>

          <div className="ventas-list">
            {ventas.map((venta) => (
              <button
                key={venta.id}
                type="button"
                className={`venta-card ${venta.id === selectedVenta.id ? 'is-active' : ''}`}
                onClick={() => setSelectedVentaId(venta.id)}
              >
                <div className="row-between">
                  <strong>{venta.numero_venta}</strong>
                  <span>{venta.metodo_pago}</span>
                </div>
                <div className="row-between muted">
                  <span>{venta.cajero_nombre}</span>
                  <span>{new Date(venta.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="preview-panel">
          <div className="preview-meta">
            <div>
              <p className="preview-label">DB mock activa</p>
              <h2>Visualizacion estable del ticket</h2>
            </div>
            <p className="muted">
              Los montos se recalculan con la misma logica de IVA, descuento y cambio.
            </p>
          </div>

          <div className="preview-stage">
            <TicketPreview
              venta={selectedVenta}
              formatoPapel={config.formato_papel}
              nombreNegocio={config.nombre_negocio}
            />
          </div>
        </section>
      </main>
    </div>
  )
}
