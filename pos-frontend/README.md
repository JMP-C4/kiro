# POS Supermercado — Frontend

Interfaz de punto de venta para supermercado. Operación completa por teclado (F1–F9) sin necesidad de ratón.

**Stack:** React 18 · TypeScript · Vite · Tailwind CSS v4 · Glassmorphism

---

## Requisitos

- Node.js 20+
- Backend corriendo en `http://localhost:3000` (ver `serverless-inventory-api/`)

---

## Inicio rápido

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

```bash
# El archivo .env ya existe con la URL del backend local
# VITE_API_URL=http://localhost:3000
```

Si el backend corre en otra URL, editar `.env`:

```env
VITE_API_URL=http://localhost:3000
```

### 3. Iniciar el servidor de desarrollo

```bash
npm run dev
# Frontend disponible en http://localhost:5173
```

---

## Scripts disponibles

```bash
npm run dev          # Servidor de desarrollo con HMR
npm run build        # Build de producción (TypeScript + Vite)
npm run preview      # Preview del build de producción
npm run lint         # ESLint
npm run test         # Tests unitarios (Vitest, una sola ejecución)
npm run test:watch   # Tests en modo watch
npm run test:coverage # Tests con reporte de cobertura
```

---

## Tests

```bash
npm run test
```

**37 tests pasando:**

| Archivo | Tests | Propiedades verificadas |
|---------|-------|------------------------|
| `calcularTotales.test.ts` | 12 | P-01, P-02, P-03, P-04 |
| `usePOS.test.ts` | 16 | P-05 |
| `useKeyboardShortcuts.test.ts` | 9 | P-11, RNF-13 |

---

## Atajos de teclado (POS)

| Tecla | Acción |
|-------|--------|
| `F1` | Foco en buscador de productos |
| `F2` | Eliminar último ítem del carrito |
| `F3` | Limpiar carrito (con confirmación) |
| `F4` | Modal IVA / Descuento |
| `F5` | Modal Método de Pago |
| `F6` | Procesar venta (Cobrar) |
| `F7` | Imprimir ticket |
| `F8` | Nueva venta |
| `F9` | Cerrar sesión |
| `M` | Menú de desbordamiento |
| `↑↓` | Navegar ítems del carrito |
| `Del` | Eliminar ítem seleccionado |
| `Esc` | Cerrar modal activo |

> Los atajos F1–F9 se desactivan automáticamente cuando hay un modal abierto (excepto Esc).

### Código de barras

El buscador del POS acepta lectores de código de barras USB/HID. El lector envía el código y un Enter — el sistema detecta el código exacto y agrega el producto directamente al carrito sin mostrar dropdown.

---

## Módulos

| Ruta | Módulo | Rol mínimo |
|------|--------|-----------|
| `/login` | Pantalla de login | Público |
| `/dashboard` | Dashboard con acceso rápido | Todos |
| `/pos` | Terminal POS | CAJERO |
| `/productos` | Gestión de productos | SUPERVISOR |
| `/usuarios` | Gestión de usuarios | ADMIN |
| `/reportes` | Reportes de ventas | SUPERVISOR |
| `/configuracion` | Configuración del sistema | ADMIN |

---

## Estructura del proyecto

```
pos-frontend/src/
├── api/                    # Clientes HTTP por módulo
│   ├── client.ts           # Axios + interceptor JWT automático
│   ├── auth.api.ts
│   ├── productos.api.ts
│   ├── usuarios.api.ts
│   ├── ventas.api.ts
│   ├── reportes.api.ts
│   └── configuracion.api.ts
├── context/
│   ├── AuthContext.tsx      # JWT, usuario, rol
│   ├── ThemeContext.tsx     # dark/light mode
│   └── ConfigContext.tsx    # Configuración del sistema (IVA, formato papel)
├── hooks/
│   ├── useKeyboardShortcuts.ts  # F1-F9, M, ↑↓, Del, Esc — centralizado
│   └── usePOS.ts                # useReducer del carrito
├── lib/
│   └── calcularTotales.ts   # Lógica pura de IVA — sin dependencias React
├── components/
│   ├── ui/                  # GlassCard, GlassInput, GlassModal, Spinner, ThemeToggle
│   ├── layout/              # ProtectedRoute, AdminLayout
│   ├── pos/                 # ProductSearch, CartList, CartItem, CartSummary,
│   │                        # WeightModal, IVAModal, PaymentModal, TicketModal,
│   │                        # KeyboardShortcutsBar, OverflowMenu
│   └── productos/           # ProductoForm
├── pages/
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── POS.tsx
│   ├── Productos.tsx
│   ├── Usuarios.tsx
│   ├── Reportes.tsx
│   └── Configuracion.tsx
└── types/                   # Tipos TypeScript por módulo
```

---

## Formatos de impresión de ticket

El ticket usa `window.print()` nativo — no requiere librerías externas de PDF.

| Formato | Ancho | Fuente | Uso |
|---------|-------|--------|-----|
| `80mm` | 80 mm | Courier New 10pt | Impresora térmica estándar |
| `58mm` | 58 mm | Courier New 8pt | Impresora térmica compacta |
| `carta` | 216 mm | Arial 11pt | Impresora de oficina |

El formato se configura en **Configuración → Formato de papel** y se aplica inmediatamente en la siguiente impresión.

Para guardar como PDF: clic en "PDF" en el modal del ticket → el navegador abre el diálogo de impresión → seleccionar "Guardar como PDF".
