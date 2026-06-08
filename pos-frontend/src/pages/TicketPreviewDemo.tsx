import { useState } from 'react'
import { TicketPreview, sampleVenta, type FormatoPapel } from '../features/ticket-preview'

const FORMATOS: FormatoPapel[] = ['80mm', '58mm', 'carta']

export default function TicketPreviewDemo() {
  const [nombreNegocio, setNombreNegocio] = useState('Kiro Market Demo')
  const [formatoPapel, setFormatoPapel] = useState<FormatoPapel>('80mm')

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col gap-3 mb-8">
          <p className="text-xs uppercase tracking-[0.3em]" style={{ color: 'var(--text-muted)' }}>
            Recurso reutilizable
          </p>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Preview de ticket / factura
          </h1>
          <p className="max-w-3xl text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
            Esta vista existe para mostrar el recurso separado del POS. Puedes abrir
            `http://localhost:5173/preview/ticket` al correr `npm run dev` y enseñar solo la
            previsualizacion sin depender de login ni del backend.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
          <section className="card flex flex-col gap-4 h-fit">
            <div>
              <h2 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                Controles
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Cambia el formato y el encabezado para mostrar versatilidad.
              </p>
            </div>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                Nombre del negocio
              </span>
              <input
                value={nombreNegocio}
                onChange={(e) => setNombreNegocio(e.target.value)}
                className="field"
                placeholder="Mi supermercado"
              />
            </label>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                Formato de papel
              </span>
              <div className="grid grid-cols-1 gap-2">
                {FORMATOS.map((formato) => (
                  <button
                    key={formato}
                    type="button"
                    onClick={() => setFormatoPapel(formato)}
                    className="text-left rounded-lg px-3 py-2 border transition-colors"
                    style={{
                      borderColor: formatoPapel === formato ? 'var(--accent)' : 'var(--border)',
                      backgroundColor: formatoPapel === formato ? 'var(--accent-light)' : 'var(--bg-surface)',
                      color: formatoPapel === formato ? 'var(--text-primary)' : 'var(--text-secondary)',
                    }}
                  >
                    {formato}
                  </button>
                ))}
              </div>
            </div>

            <button type="button" onClick={() => window.print()} className="btn-primary justify-center">
              Imprimir demo
            </button>
          </section>

          <section className="card overflow-auto">
            <div className="rounded-2xl p-6 min-h-[70vh] flex items-start justify-center bg-neutral-200/70">
              <TicketPreview
                venta={sampleVenta}
                formatoPapel={formatoPapel}
                nombreNegocio={nombreNegocio}
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
