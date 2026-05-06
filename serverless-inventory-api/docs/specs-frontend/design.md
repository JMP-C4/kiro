# Documento de Diseño Técnico — POS Frontend

## Visión General

Aplicación SPA (Single Page Application) construida con React 18 + TypeScript + Vite. Consume la Serverless Inventory API vía HTTP/REST con autenticación JWT. Sigue una arquitectura de capas con separación entre UI, lógica de negocio y acceso a datos.

**Stack:** React 18 · TypeScript · Vite · Tailwind CSS · React Router v6 · React Query · Axios · Recharts

---

## Índice de Documentos

| Archivo | Contenido |
|---------|-----------|
| [01-arquitectura.md](design/01-arquitectura.md) | Estructura de capas, diagrama de componentes, routing |
| [02-api-client.md](design/02-api-client.md) | Cliente HTTP, interceptores JWT, manejo de errores |
| [03-componentes.md](design/03-componentes.md) | Componentes por módulo y árbol de componentes |
| [04-estado.md](design/04-estado.md) | Gestión de estado con React Query y Context |
| [05-pos-flow.md](design/05-pos-flow.md) | Flujo completo del POS: sesión → carrito → checkout → ticket |

---

## Decisiones de Diseño

| Decisión | Elección | Razón |
|----------|----------|-------|
| Framework | React 18 + TypeScript | Ecosistema maduro, tipado estático |
| Build tool | Vite | Cold start rápido, HMR eficiente |
| Estilos | Tailwind CSS | Utility-first, consistencia visual rápida |
| Routing | React Router v6 | Estándar de facto para SPAs React |
| Data fetching | React Query (TanStack) | Cache, loading states, refetch automático |
| HTTP client | Axios | Interceptores para JWT, manejo de errores centralizado |
| Gráficos | Recharts | Ligero, compatible con React, fácil de usar |
| Formularios | React Hook Form + Zod | Validación declarativa, rendimiento |

---

## Estructura del Proyecto

```
pos-frontend/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── package.json
│
├── src/
│   ├── main.tsx                    # Entry point
│   ├── App.tsx                     # Router principal
│   │
│   ├── api/                        # Capa de acceso a datos
│   │   ├── client.ts               # Instancia Axios + interceptores JWT
│   │   ├── auth.api.ts
│   │   ├── productos.api.ts
│   │   ├── clientes.api.ts
│   │   ├── cobros.api.ts
│   │   ├── creditos.api.ts
│   │   ├── stats.api.ts
│   │   └── pos.api.ts
│   │
│   ├── hooks/                      # Custom hooks (React Query)
│   │   ├── useAuth.ts
│   │   ├── useProductos.ts
│   │   ├── useClientes.ts
│   │   ├── useCobros.ts
│   │   ├── useCreditos.ts
│   │   ├── useStats.ts
│   │   └── usePOS.ts
│   │
│   ├── context/
│   │   ├── AuthContext.tsx          # Token JWT, usuario actual
│   │   └── CartContext.tsx          # Estado del carrito POS
│   │
│   ├── components/                 # Componentes reutilizables
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── Pagination.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   └── forms/
│   │       ├── ProductoForm.tsx
│   │       ├── ClienteForm.tsx
│   │       └── CreditoForm.tsx
│   │
│   ├── pages/                      # Páginas por módulo
│   │   ├── Login.tsx
│   │   ├── Productos.tsx
│   │   ├── Clientes.tsx
│   │   ├── Cobros.tsx
│   │   ├── Creditos.tsx
│   │   ├── Stats.tsx
│   │   └── pos/
│   │       ├── POSLayout.tsx
│   │       ├── AbrirSesion.tsx
│   │       ├── Carrito.tsx
│   │       ├── Checkout.tsx
│   │       └── Ticket.tsx
│   │
│   └── types/                      # Tipos TypeScript
│       ├── auth.types.ts
│       ├── producto.types.ts
│       ├── cliente.types.ts
│       ├── cobro.types.ts
│       ├── credito.types.ts
│       └── pos.types.ts
```

---

## Mapeo de Rutas

| Ruta | Componente | Protegida |
|------|-----------|-----------|
| `/login` | `Login.tsx` | No |
| `/productos` | `Productos.tsx` | Sí |
| `/clientes` | `Clientes.tsx` | Sí |
| `/cobros` | `Cobros.tsx` | Sí |
| `/creditos` | `Creditos.tsx` | Sí |
| `/stats` | `Stats.tsx` | Sí |
| `/pos` | `POSLayout.tsx` | Sí |
| `/pos/sesion` | `AbrirSesion.tsx` | Sí |
| `/pos/venta` | `Carrito.tsx` | Sí |
| `/pos/ticket/:id` | `Ticket.tsx` | Sí |
