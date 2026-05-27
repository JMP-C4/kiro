/**
 * POS.tsx — Página principal del cajero
 *
 * Integra todos los componentes del POS:
 *   - ProductSearch (F1)
 *   - CartList + CartItem (↑↓, Del)
 *   - CartSummary + F6 Cobrar
 *   - WeightModal (productos a granel)
 *   - IVAModal (F4)
 *   - PaymentModal (F5)
 *   - TicketModal (F7/F8)
 *   - OverflowMenu (M)
 *   - useKeyboardShortcuts (F1-F9, M, ↑↓, Del, Esc)
 *
 * Requisitos: Req-2, Req-3, Req-4, Req-5, Req-6, Req-7, RNF-11, RNF-13, RNF-17
 */

import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { nanoid } from 'nanoid'

import { useAuth } from '../context/AuthContext'
import { usePOS } from '../hooks/usePOS'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'

import { crearVenta } from '../api/ventas.api'

import type { CartItem } from '../types/pos.types'
import type { ProductoSearchResult } from '../types/producto.types'
import type { VentaResponse } from '../types/venta.types'

import KeyboardShortcutsBar from '../components/pos/KeyboardShortcutsBar'
import OverflowMenu from '../components/pos/OverflowMenu'
import ProductSearch from '../components/pos/ProductSearch'
import CartList from '../components/pos/CartList'
import CartSummary from '../components/pos/CartSummary'
import WeightModal from '../components/pos/WeightModal'
import IVAModal from '../components/pos/IVAModal'
import PaymentModal from '../components/pos/PaymentModal'
import TicketModal from '../components/pos/TicketModal'
import ThemeToggle from '../components/ui/ThemeToggle'
import GlassModal from '../components/ui/GlassModal'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createCartItem(producto: ProductoSearchResult, cantidad: number = 1): CartItem {
  return {
    lineId: nanoid(),
    productoId: producto.id,
    nombre: producto.nombre,
    codigo: producto.codigo,
    precio: producto.precio,
    incluye_iva: producto.incluye_iva,
    unidad_medida: producto.unidad_medida,
    cantidad,
    subtotal: producto.precio * cantidad,
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function POS() {
  const navigate = useNavigate()
  const { nombre, rol, logout } = useAuth()

  const {
    state,
    addItem,
    removeItem,
    removeLast,
    clearCart,
    setDescuento,
    setMetodoPago,
    setMontoPagado,
    selectItem,
    moveSelection,
    setModal,
  } = usePOS()

  // Ref for F1 focus on ProductSearch input
  const searchRef = useRef<HTMLInputElement>(null)

  // Pending weight product (for WeightModal)
  const [pendingWeightProduct, setPendingWeightProduct] = useState<ProductoSearchResult | null>(null)

  // Venta result (for TicketModal)
  const [ventaResult, setVentaResult] = useState<VentaResponse | null>(null)

  // Error message (Req-6.8, 6.9, 6.10)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Overflow menu open state
  const [overflowOpen, setOverflowOpen] = useState(false)

  // Processing state for F6
  const [isProcessing, setIsProcessing] = useState(false)

  const modalOpen = state.activeModal !== null

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleAddItem = (producto: ProductoSearchResult) => {
    addItem(createCartItem(producto))
    setErrorMsg(null)
  }

  const handleWeightRequired = (producto: ProductoSearchResult) => {
    setPendingWeightProduct(producto)
    setModal('peso')
  }

  const handleWeightConfirm = (producto: ProductoSearchResult, peso: number) => {
    addItem(createCartItem(producto, peso))
    setPendingWeightProduct(null)
    setModal(null)
    setErrorMsg(null)
  }

  const handleWeightCancel = () => {
    setPendingWeightProduct(null)
    setModal(null)
  }

  const handleIVAConfirm = (descuentoPct: number) => {
    setDescuento(descuentoPct)
    setModal(null)
  }

  const handlePaymentConfirm = (metodo: import('../types/pos.types').MetodoPago, montoPagado: number) => {
    setMetodoPago(metodo)
    setMontoPagado(montoPagado)
    setModal(null)
  }

  const handleNuevaVenta = () => {
    clearCart()
    setVentaResult(null)
    setModal(null)
    setErrorMsg(null)
  }

  // F6 — Checkout flow (Req-6.1, 6.8, 6.9, 6.10)
  const handleCobrar = async () => {
    if (state.items.length === 0) {
      setErrorMsg('El carrito está vacío. Agrega productos antes de cobrar.')
      return
    }
    if (!state.metodoPago) {
      setErrorMsg('Selecciona el método de pago (F5) antes de cobrar.')
      return
    }

    setIsProcessing(true)
    setErrorMsg(null)

    try {
      const request = {
        items: state.items.map((item) => ({
          productoId: item.productoId,
          nombreProducto: item.nombre,
          cantidad: item.cantidad,
          precioUnitario: item.precio,
          incluyeIva: item.incluye_iva,
          subtotal: item.subtotal,
        })),
        descuentoPct: state.descuentoPct,
        metodoPago: state.metodoPago,
        montoRecibido: state.metodoPago === 'EFECTIVO' ? state.montoPagado : null,
      }

      const venta = await crearVenta(request)
      setVentaResult(venta)
      setModal('ticket')
    } catch (err: unknown) {
      const msg =
        err !== null &&
        typeof err === 'object' &&
        'response' in err &&
        err.response !== null &&
        typeof err.response === 'object' &&
        'data' in err.response &&
        err.response.data !== null &&
        typeof err.response.data === 'object' &&
        'mensaje' in err.response.data
          ? String((err.response.data as { mensaje: string }).mensaje)
          : 'Error al procesar la venta. Intenta nuevamente.'
      setErrorMsg(msg)
    } finally {
      setIsProcessing(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Keyboard shortcuts
  // ---------------------------------------------------------------------------

  useKeyboardShortcuts(
    [
      {
        key: 'F1',
        action: () => searchRef.current?.focus(),
        description: 'Buscar producto',
      },
      {
        key: 'F2',
        action: removeLast,
        description: 'Eliminar último ítem',
      },
      {
        key: 'F3',
        action: () => setModal('confirmar-limpiar'),
        description: 'Limpiar carrito',
      },
      {
        key: 'F4',
        action: () => setModal('iva'),
        description: 'IVA / Descuento',
      },
      {
        key: 'F5',
        action: () => setModal('pago'),
        description: 'Método de pago',
      },
      {
        key: 'F6',
        action: handleCobrar,
        description: 'Cobrar',
      },
      {
        key: 'F7',
        action: () => { if (state.activeModal === 'ticket') window.print() },
        description: 'Imprimir ticket',
        disabled: state.activeModal !== 'ticket',
      },
      {
        key: 'F8',
        action: handleNuevaVenta,
        description: 'Nueva venta',
        disabled: state.activeModal !== 'ticket',
      },
      {
        key: 'F9',
        action: handleLogout,
        description: 'Cerrar sesión',
      },
      {
        key: 'm',
        action: () => setOverflowOpen((prev) => !prev),
        description: 'Menú',
      },
      {
        key: 'ArrowUp',
        action: () => moveSelection(-1),
        description: 'Subir selección',
      },
      {
        key: 'ArrowDown',
        action: () => moveSelection(1),
        description: 'Bajar selección',
      },
      {
        key: 'Delete',
        action: () => {
          if (state.selectedIndex !== null) {
            const item = state.items[state.selectedIndex]
            if (item) removeItem(item.lineId)
          }
        },
        description: 'Eliminar ítem seleccionado',
      },
      {
        key: 'Escape',
        action: () => {
          if (state.activeModal) setModal(null)
          if (overflowOpen) setOverflowOpen(false)
        },
        description: 'Cerrar modal',
      },
    ],
    modalOpen
  )

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">

      {/* ── Top Navbar ─────────────────────────────────────────────────── */}
      <header className="glass h-14 flex items-center px-4 gap-4 sticky top-0 z-40">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="text-white/60 hover:text-white transition text-sm shrink-0"
          aria-label="Volver al dashboard"
        >
          ←
        </button>
        <span className="text-white font-bold text-base shrink-0">POS Supermercado</span>

        <div className="flex-1 overflow-hidden">
          <KeyboardShortcutsBar />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <OverflowMenu open={overflowOpen} onToggle={() => setOverflowOpen((p) => !p)} />

          {nombre && (
            <div className="hidden md:flex flex-col items-end leading-tight">
              <span className="text-white text-sm font-medium">{nombre}</span>
              {rol && <span className="text-white/50 text-xs uppercase tracking-wide">{rol}</span>}
            </div>
          )}

          <ThemeToggle />

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass hover:bg-red-500/30 transition text-sm font-medium text-white/80 hover:text-white"
            title="Cerrar sesión (F9)"
            aria-label="Cerrar sesión"
          >
            <kbd className="inline-flex items-center justify-center w-5 h-5 rounded bg-white/15 border border-white/25 font-mono text-[10px] font-semibold leading-none">F9</kbd>
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      {/* ── Error alert ────────────────────────────────────────────────── */}
      {errorMsg && (
        <div
          role="alert"
          aria-live="assertive"
          className="mx-4 mt-3 px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-sm flex items-center justify-between"
        >
          <span>⚠ {errorMsg}</span>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="ml-4 text-red-300/60 hover:text-red-200 transition"
            aria-label="Cerrar alerta"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Main Content — 12-column grid ──────────────────────────────── */}
      <main className="grid grid-cols-12 gap-4 p-4">

        {/* ── Left column (col-span-3): ProductSearch + shortcuts panel ── */}
        <aside className="col-span-12 md:col-span-3 flex flex-col gap-4">
          <div className="glass-card p-4 flex flex-col gap-3">
            <h2 className="text-white/60 text-xs font-semibold uppercase tracking-wider">Buscar Producto</h2>
            <ProductSearch
              onAddItem={handleAddItem}
              onWeightRequired={handleWeightRequired}
              focusRef={searchRef}
            />
          </div>

          {/* Lateral shortcuts panel */}
          <div className="glass-card p-4">
            <h2 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Atajos</h2>
            <ul className="space-y-1.5 text-xs text-white/60">
              {[
                ['F1', 'Buscar producto'],
                ['F2', 'Eliminar último'],
                ['F3', 'Limpiar carrito'],
                ['F4', 'IVA / Descuento'],
                ['F5', 'Método de pago'],
                ['F6', 'Cobrar'],
                ['F7', 'Imprimir ticket'],
                ['F8', 'Nueva venta'],
                ['F9', 'Cerrar sesión'],
                ['↑↓', 'Navegar carrito'],
                ['Del', 'Eliminar ítem'],
                ['Esc', 'Cerrar modal'],
              ].map(([key, desc]) => (
                <li key={key} className="flex items-center gap-2">
                  <kbd className="inline-flex items-center justify-center min-w-10 px-1.5 py-0.5 rounded bg-white/10 border border-white/20 font-mono text-[10px] font-semibold text-white leading-none">
                    {key}
                  </kbd>
                  <span>{desc}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* ── Center column (col-span-6): CartList ───────────────────── */}
        <section
          className="col-span-12 md:col-span-6 glass-card p-4 flex flex-col gap-3 min-h-96"
          aria-label="Carrito de compras"
        >
          <h2 className="text-white font-semibold text-sm uppercase tracking-wider">
            Carrito
            {state.items.length > 0 && (
              <span className="ml-2 text-violet-400 font-normal">({state.items.length} ítem{state.items.length !== 1 ? 's' : ''})</span>
            )}
          </h2>

          <CartList
            items={state.items}
            selectedIndex={state.selectedIndex}
            onSelectItem={selectItem}
            onRemoveItem={removeItem}
          />
        </section>

        {/* ── Right column (col-span-3): CartSummary ─────────────────── */}
        <aside className="col-span-12 md:col-span-3 flex flex-col gap-4" aria-label="Resumen de venta">
          <CartSummary
            totales={state.totales}
            itemCount={state.items.length}
            metodoPago={state.metodoPago}
            onCobrar={handleCobrar}
          />

          {/* Processing indicator */}
          {isProcessing && (
            <div className="glass-card p-3 flex items-center justify-center gap-2 text-white/70 text-sm">
              <span className="spinner w-5 h-5" aria-hidden="true" />
              Procesando venta…
            </div>
          )}
        </aside>
      </main>

      {/* ── Modals ─────────────────────────────────────────────────────── */}

      {/* Weight modal — productos a granel */}
      <WeightModal
        isOpen={state.activeModal === 'peso'}
        producto={pendingWeightProduct}
        onConfirm={handleWeightConfirm}
        onCancel={handleWeightCancel}
      />

      {/* IVA / Descuento modal (F4) */}
      <IVAModal
        isOpen={state.activeModal === 'iva'}
        totales={state.totales}
        descuentoPct={state.descuentoPct}
        items={state.items}
        onConfirm={handleIVAConfirm}
        onClose={() => setModal(null)}
      />

      {/* Payment modal (F5) */}
      <PaymentModal
        isOpen={state.activeModal === 'pago'}
        total={state.totales.totalConIVA}
        metodoPago={state.metodoPago}
        montoPagado={state.montoPagado}
        onConfirm={handlePaymentConfirm}
        onClose={() => setModal(null)}
      />

      {/* Ticket modal (F7) */}
      <TicketModal
        isOpen={state.activeModal === 'ticket'}
        venta={ventaResult}
        formatoPapel="80mm"
        nombreNegocio="Mi Supermercado"
        onNuevaVenta={handleNuevaVenta}
        onClose={() => setModal(null)}
      />

      {/* Confirm clear cart modal (F3) */}
      <GlassModal
        isOpen={state.activeModal === 'confirmar-limpiar'}
        onClose={() => setModal(null)}
        title="Limpiar carrito"
      >
        <div className="flex flex-col gap-4">
          <p className="text-white/80 text-sm">
            ¿Estás seguro de que quieres vaciar el carrito? Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setModal(null)}
              className="flex-1 py-2 rounded-lg border border-white/20 text-white/70 hover:text-white hover:bg-white/10 transition"
            >
              Cancelar (Esc)
            </button>
            <button
              type="button"
              onClick={() => { clearCart(); setModal(null) }}
              className="flex-1 py-2 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-500 transition"
            >
              Limpiar carrito
            </button>
          </div>
        </div>
      </GlassModal>
    </div>
  )
}
