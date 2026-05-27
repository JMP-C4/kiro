export type TaskStatus = 'done' | 'pending' | 'partial'

export interface FrontendTask {
  id: string
  phase: string
  title: string
  status: TaskStatus
}

export interface ModuleLink {
  path: string
  label: string
  description: string
  icon: string
  roles: Array<'CAJERO' | 'SUPERVISOR' | 'ADMIN'>
  ready: boolean
}

/** Estado de las tareas frontend según .kiro/specs/supermarket-pos/tasks.md */
export const FRONTEND_TASKS: FrontendTask[] = [
  { id: '1.1', phase: 'Fase 1', title: 'Setup del proyecto (Vite, Tailwind, deps)', status: 'done' },
  { id: '2.2', phase: 'Fase 2', title: 'AuthContext y cliente HTTP con JWT', status: 'done' },
  { id: '2.3', phase: 'Fase 2', title: 'Pantalla de Login con validación Zod', status: 'done' },
  { id: '2.4', phase: 'Fase 2', title: 'ProtectedRoute y Router por roles', status: 'done' },
  { id: '4.1', phase: 'Fase 4', title: 'Componentes UI glassmorphism', status: 'done' },
  { id: '4.2', phase: 'Fase 4', title: 'Hook useKeyboardShortcuts', status: 'done' },
  { id: '4.3', phase: 'Fase 4', title: 'Lógica pura calcularTotales (IVA)', status: 'done' },
  { id: '4.4', phase: 'Fase 4', title: 'Layout POS — grid 12 columnas', status: 'done' },
  { id: '5.1', phase: 'Fase 5', title: 'ProductSearch con dropdown', status: 'done' },
  { id: '5.2', phase: 'Fase 5', title: 'Reducer del carrito (usePOS)', status: 'done' },
  { id: '5.3', phase: 'Fase 5', title: 'CartList y CartItem', status: 'done' },
  { id: '5.4', phase: 'Fase 5', title: 'CartSummary con totales', status: 'done' },
  { id: '5.5', phase: 'Fase 5', title: 'WeightModal para productos a granel', status: 'done' },
  { id: '6.1', phase: 'Fase 6', title: 'Modal IVA / Descuento (F4)', status: 'done' },
  { id: '6.2', phase: 'Fase 6', title: 'Modal Método de Pago (F5)', status: 'done' },
  { id: '6.4', phase: 'Fase 6', title: 'Modal Ticket con impresión (F7)', status: 'done' },
  { id: '6.5', phase: 'Fase 6', title: 'Integración F6 — procesar venta', status: 'done' },
  { id: '6.6', phase: 'Fase 6', title: 'OverflowMenu (tecla M)', status: 'done' },
  { id: '7.1', phase: 'Fase 7', title: 'Módulo de Productos', status: 'done' },
  { id: '7.2', phase: 'Fase 7', title: 'Módulo de Usuarios (Admin)', status: 'done' },
  { id: '7.4', phase: 'Fase 7', title: 'Módulo de Reportes', status: 'partial' },
  { id: '7.5', phase: 'Fase 7', title: 'Módulo de Configuración', status: 'partial' },
  { id: '8.1', phase: 'Fase 8', title: 'Tests unitarios — lógica IVA', status: 'pending' },
  { id: '8.2', phase: 'Fase 8', title: 'Tests unitarios — reducer carrito', status: 'pending' },
  { id: '8.5', phase: 'Fase 8', title: 'Verificación atajos de teclado', status: 'pending' },
  { id: '8.6', phase: 'Fase 8', title: 'Verificación formatos de impresión', status: 'pending' },
]

export const MODULE_LINKS: ModuleLink[] = [
  {
    path: '/pos',
    label: 'Punto de Venta',
    description: 'Caja, carrito, cobros y tickets',
    icon: '🛒',
    roles: ['CAJERO', 'SUPERVISOR', 'ADMIN'],
    ready: true,
  },
  {
    path: '/productos',
    label: 'Productos',
    description: 'Catálogo e inventario',
    icon: '📦',
    roles: ['SUPERVISOR', 'ADMIN'],
    ready: true,
  },
  {
    path: '/reportes',
    label: 'Reportes',
    description: 'Ventas y métricas',
    icon: '📊',
    roles: ['SUPERVISOR', 'ADMIN'],
    ready: false,
  },
  {
    path: '/usuarios',
    label: 'Usuarios',
    description: 'Gestión de cuentas',
    icon: '👥',
    roles: ['ADMIN'],
    ready: true,
  },
  {
    path: '/configuracion',
    label: 'Configuración',
    description: 'IVA, negocio y ticket',
    icon: '⚙️',
    roles: ['ADMIN'],
    ready: false,
  },
]

export function getProgressStats(tasks: FrontendTask[] = FRONTEND_TASKS) {
  const done = tasks.filter((t) => t.status === 'done').length
  const partial = tasks.filter((t) => t.status === 'partial').length
  const pending = tasks.filter((t) => t.status === 'pending').length
  const total = tasks.length
  const percent = Math.round(((done + partial * 0.5) / total) * 100)

  return { done, partial, pending, total, percent }
}
