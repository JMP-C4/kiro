/**
 * usePOS.ts
 *
 * Hook centralizado del carrito POS usando useReducer.
 * La tasa de IVA se recibe como parámetro para que el ConfigContext
 * pueda actualizarla en tiempo real (Req-11 11.5).
 *
 * Propiedades de corrección:
 *   P-05: ADD_ITEM siempre crea una línea nueva — nunca acumula en línea existente.
 *
 * Requisitos: Req-3
 */

import { useReducer } from 'react'
import type { CartItem, MetodoPago, ModalType, PosState, Totales } from '../types/pos.types'
import { calcularTotales } from '../lib/calcularTotales'

// ---------------------------------------------------------------------------
// Tipos de acción
// ---------------------------------------------------------------------------
type PosAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; lineId: string }
  | { type: 'REMOVE_LAST' }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_DESCUENTO'; pct: number }
  | { type: 'SET_METODO_PAGO'; metodo: MetodoPago }
  | { type: 'SET_MONTO_PAGADO'; monto: number }
  | { type: 'SELECT_ITEM'; index: number | null }
  | { type: 'MOVE_SELECTION'; dir: 1 | -1 }
  | { type: 'SET_MODAL'; modal: ModalType | null }

// ---------------------------------------------------------------------------
// Estado inicial
// ---------------------------------------------------------------------------
const TOTALES_CERO: Totales = {
  subtotalSinIVA: 0,
  montoIVA: 0,
  totalConIVA: 0,
  descuentoMonto: 0,
}

const initialState: PosState = {
  items: [],
  selectedIndex: null,
  descuentoPct: 0,
  metodoPago: null,
  montoPagado: 0,
  activeModal: null,
  totales: TOTALES_CERO,
}

// ---------------------------------------------------------------------------
// Helper: recalcular totales a partir del estado parcial
// ---------------------------------------------------------------------------
function recalcular(items: CartItem[], descuentoPct: number, tasaIVA: number): Totales {
  return calcularTotales(items, tasaIVA, descuentoPct)
}

// ---------------------------------------------------------------------------
// Reducer factory — recibe tasaIVA para que sea dinámica (Req-11 11.5)
// ---------------------------------------------------------------------------
function makeReducer(tasaIVA: number) {
  return function posReducer(state: PosState, action: PosAction): PosState {
  switch (action.type) {
    case 'ADD_ITEM': {
      // P-05: siempre línea nueva — nunca acumula
      const items = [...state.items, action.payload]
      return {
        ...state,
        items,
        totales: recalcular(items, state.descuentoPct, tasaIVA),
      }
    }

    case 'REMOVE_ITEM': {
      const items = state.items.filter((item) => item.lineId !== action.lineId)
      const removedIndex = state.items.findIndex((item) => item.lineId === action.lineId)

      let selectedIndex = state.selectedIndex
      if (selectedIndex !== null) {
        if (items.length === 0) {
          selectedIndex = null
        } else if (removedIndex !== -1 && removedIndex <= selectedIndex) {
          selectedIndex = Math.max(0, selectedIndex - 1)
        }
        if (selectedIndex !== null && selectedIndex >= items.length) {
          selectedIndex = items.length - 1
        }
      }

      return {
        ...state,
        items,
        selectedIndex,
        totales: recalcular(items, state.descuentoPct, tasaIVA),
      }
    }

    case 'REMOVE_LAST': {
      if (state.items.length === 0) return state
      const items = state.items.slice(0, -1)

      let selectedIndex = state.selectedIndex
      if (selectedIndex !== null) {
        if (items.length === 0) {
          selectedIndex = null
        } else if (selectedIndex >= items.length) {
          selectedIndex = items.length - 1
        }
      }

      return {
        ...state,
        items,
        selectedIndex,
        totales: recalcular(items, state.descuentoPct, tasaIVA),
      }
    }

    case 'CLEAR_CART': {
      return {
        ...state,
        items: [],
        selectedIndex: null,
        totales: TOTALES_CERO,
      }
    }

    case 'SET_DESCUENTO': {
      return {
        ...state,
        descuentoPct: action.pct,
        totales: recalcular(state.items, action.pct, tasaIVA),
      }
    }

    case 'SET_METODO_PAGO': {
      return {
        ...state,
        metodoPago: action.metodo,
      }
    }

    case 'SET_MONTO_PAGADO': {
      return {
        ...state,
        montoPagado: action.monto,
      }
    }

    case 'SELECT_ITEM': {
      return {
        ...state,
        selectedIndex: action.index,
      }
    }

    case 'MOVE_SELECTION': {
      if (state.items.length === 0) {
        return { ...state, selectedIndex: null }
      }

      const current = state.selectedIndex ?? (action.dir === 1 ? -1 : state.items.length)
      const next = Math.max(0, Math.min(state.items.length - 1, current + action.dir))

      return {
        ...state,
        selectedIndex: next,
      }
    }

    case 'SET_MODAL': {
      return {
        ...state,
        activeModal: action.modal ?? null,
      }
    }

    default:
      return state
  }
  } // end posReducer
} // end makeReducer

// ---------------------------------------------------------------------------
// Hook público — recibe tasaIVA del ConfigContext (Req-11 11.5)
// ---------------------------------------------------------------------------
export function usePOS(tasaIVA: number = 0.19) {
  const [state, dispatch] = useReducer(makeReducer(tasaIVA), initialState)

  return {
    state,
    dispatch,
    // Helpers tipados para cada acción
    addItem: (item: CartItem) => dispatch({ type: 'ADD_ITEM', payload: item }),
    removeItem: (lineId: string) => dispatch({ type: 'REMOVE_ITEM', lineId }),
    removeLast: () => dispatch({ type: 'REMOVE_LAST' }),
    clearCart: () => dispatch({ type: 'CLEAR_CART' }),
    setDescuento: (pct: number) => dispatch({ type: 'SET_DESCUENTO', pct }),
    setMetodoPago: (metodo: MetodoPago) => dispatch({ type: 'SET_METODO_PAGO', metodo }),
    setMontoPagado: (monto: number) => dispatch({ type: 'SET_MONTO_PAGADO', monto }),
    selectItem: (index: number | null) => dispatch({ type: 'SELECT_ITEM', index }),
    moveSelection: (dir: 1 | -1) => dispatch({ type: 'MOVE_SELECTION', dir }),
    setModal: (modal: ModalType | null) => dispatch({ type: 'SET_MODAL', modal }),
  }
}

// Exportar tipos para uso externo
export type { PosAction }
