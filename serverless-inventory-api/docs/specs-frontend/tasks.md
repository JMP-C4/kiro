# Plan de Implementación — POS Frontend

## Visión General

Implementación incremental del frontend POS. Organizado en 5 fases que cubren los requisitos del Workshop SDD y el Parcial Práctico de Frontend.

**Stack:** React 18 · TypeScript · Vite · Tailwind CSS · React Query · Axios

**Nivel Básico (nota 3.0):** Fases 1 y 2 (tareas 1.1 → 2.5)
**Nivel Intermedio (nota 4.0):** Fases 1, 2 y 3 (tareas 1.1 → 3.6)
**Nivel Avanzado (nota 5.0):** Todas las fases (tareas 1.1 → 5.4)

---

## Fase 1 — Setup y Autenticación (Básico)

- [ ] 1.1 Inicializar proyecto con Vite + React + TypeScript
  - Ejecutar `npm create vite@latest pos-frontend -- --template react-ts`
  - Instalar dependencias: `axios`, `react-router-dom`, `@tanstack/react-query`, `react-hook-form`, `zod`, `@hookform/resolvers`, `recharts`
  - Instalar devDependencies: `tailwindcss`, `postcss`, `autoprefixer`
  - Configurar Tailwind CSS con `npx tailwindcss init -p`
  - Configurar variable de entorno `VITE_API_URL` apuntando al backend SAM

- [ ] 1.2 Implementar cliente HTTP con interceptores JWT
  - Crear `src/api/client.ts` con instancia Axios y `baseURL = import.meta.env.VITE_API_URL`
  - Agregar interceptor de request que inyecta `Authorization: Bearer <token>` desde `localStorage`
  - Agregar interceptor de response que captura 401 y redirige a `/login` eliminando el token

- [ ] 1.3 Implementar AuthContext y hook useAuth
  - Crear `src/context/AuthContext.tsx` con estado `token`, `user`, `login()`, `logout()`
  - `login()` consume `POST /auth`, almacena token en `localStorage` y actualiza el contexto
  - `logout()` elimina token de `localStorage` y redirige a `/login`
  - Crear `src/hooks/useAuth.ts` que expone el contexto

- [ ] 1.4 Implementar pantalla de Login
  - Crear `src/pages/Login.tsx` con formulario: campos `usuario`, `contraseña` y botón `"Iniciar sesión"`
  - Validar que ambos campos no estén vacíos antes de enviar
  - Mostrar mensaje de error si el backend retorna 401 o 403
  - Mostrar spinner en el botón mientras la petición está en curso
  - Redirigir a `/productos` tras login exitoso

- [ ] 1.5 Implementar ProtectedRoute y Router principal
  - Crear `src/components/layout/ProtectedRoute.tsx` que redirige a `/login` si no hay token
  - Crear `src/App.tsx` con React Router v6: rutas públicas (`/login`) y protegidas (resto)
  - Redirigir `/login` → `/productos` si el usuario ya está autenticado

---

## Fase 2 — Layout y Listado de Productos (Básico)

- [ ] 2.1 Implementar layout principal con navegación
  - Crear `src/components/layout/Sidebar.tsx` con links a: Productos, Clientes, Cobros, Créditos, POS, Stats
  - Crear `src/components/layout/Header.tsx` con nombre del usuario y botón `"Cerrar sesión"`
  - Crear componentes UI base: `Button.tsx`, `Input.tsx`, `Spinner.tsx`, `Table.tsx`

- [ ] 2.2 Implementar API y hook de Productos
  - Crear `src/api/productos.api.ts` con funciones: `getProductos(filters)`, `createProducto()`, `updateProducto()`, `deleteProducto()`
  - Crear `src/hooks/useProductos.ts` con React Query: `useProductosQuery`, `useCreateProducto`, `useUpdateProducto`, `useDeleteProducto`

- [ ] 2.3 Implementar página de Productos — Listado
  - Crear `src/pages/Productos.tsx` que muestra tabla con: `nombre`, `categoria`, `precio`, `stock`
  - Mostrar skeleton loader mientras carga
  - Mostrar mensaje `"No se encontraron productos"` si la lista está vacía
  - Incluir botón `"Cerrar sesión"` en el header

- [ ] 2.4 Implementar búsqueda y filtro por categoría
  - Agregar campo de búsqueda por nombre (filtro local o query param)
  - Agregar select de categoría que consume `GET /productos?categoria={valor}`
  - Combinar ambos filtros simultáneamente

- [ ] 2.5 Implementar paginación
  - Agregar controles `"Anterior"` / `"Siguiente"` y números de página
  - Consumir endpoint con `page` y `limit` como query params
  - Mostrar `"Página {n} de {total} — {count} productos"`
  - Deshabilitar botones en primera/última página

---

## Fase 3 — CRUD Completo (Intermedio)

- [ ] 3.1 Implementar formulario de Producto (crear/editar)
  - Crear `src/components/forms/ProductoForm.tsx` con React Hook Form + Zod
  - Validar: `nombre` no vacío, `categoria` no vacía, `precio > 0`, `stock >= 0`
  - Mostrar mensajes de validación junto a cada campo inválido
  - Reutilizar el mismo formulario para crear y editar (modo controlado por prop)

- [ ] 3.2 Implementar crear y editar Producto
  - Agregar botón `"Nuevo producto"` que abre modal con `ProductoForm`
  - Agregar botón `"Editar"` en cada fila que carga los datos actuales en el modal
  - Actualizar la lista automáticamente tras crear/editar (React Query invalidation)
  - Mostrar toast de éxito: `"Producto creado correctamente"` / `"Producto actualizado"`

- [ ] 3.3 Implementar eliminar Producto
  - Agregar botón `"Eliminar"` en cada fila con confirmación (modal o `confirm()`)
  - Consumir `DELETE /productos/{id}` y remover de la lista sin recargar
  - Mostrar toast de éxito: `"Producto eliminado correctamente"`

- [ ] 3.4 Implementar CRUD de Clientes
  - Crear `src/api/clientes.api.ts` y `src/hooks/useClientes.ts`
  - Crear `src/pages/Clientes.tsx` con tabla, búsqueda local y botones CRUD
  - Crear `src/components/forms/ClienteForm.tsx` con validación de email
  - Manejar error 409 (email duplicado) mostrando mensaje junto al campo

- [ ] 3.5 Implementar Cobros
  - Crear `src/api/cobros.api.ts` y `src/hooks/useCobros.ts`
  - Crear `src/pages/Cobros.tsx` con historial de cobros y formulario de nuevo cobro
  - Manejar error 409 de stock insuficiente con mensaje descriptivo

- [ ] 3.6 Implementar Créditos
  - Crear `src/api/creditos.api.ts` y `src/hooks/useCreditos.ts`
  - Mostrar saldo de crédito en el perfil del cliente
  - Crear `src/components/forms/CreditoForm.tsx` con validación de monto > 0

---

## Fase 4 — Módulo POS (Avanzado)

- [ ] 4.1 Implementar CartContext y lógica del carrito
  - Crear `src/context/CartContext.tsx` con estado: `items`, `clienteId`, `sesionId`, `metodoPago`
  - Implementar acciones: `addItem()`, `removeItem()`, `updateQuantity()`, `clearCart()`
  - Calcular en tiempo real: `subtotal`, `creditoAplicado`, `total`

- [ ] 4.2 Implementar apertura de sesión de caja
  - Crear `src/pages/pos/AbrirSesion.tsx` con formulario de `montoInicial`
  - Verificar sesión activa al cargar el módulo POS
  - Consumir `POST /pos/sesiones` y guardar `sesionId` en el contexto

- [ ] 4.3 Implementar pantalla de venta (carrito)
  - Crear `src/pages/pos/Carrito.tsx` con buscador de productos y lista del carrito
  - Mostrar totales en tiempo real al agregar/modificar ítems
  - Implementar selector de método de pago: Efectivo, Tarjeta, Crédito
  - Mostrar saldo de crédito disponible cuando se selecciona `"Crédito"`

- [ ] 4.4 Implementar checkout y generación de ticket
  - Consumir `POST /pos/ventas` al hacer clic en `"Cobrar"`
  - Manejar error 409 de stock insuficiente con mensaje por producto
  - Crear `src/pages/pos/Ticket.tsx` con todos los campos del ticket
  - Implementar botón `"Imprimir"` con `window.print()` y estilos de impresión

- [ ] 4.5 Implementar cierre de sesión de caja e historial
  - Mostrar resumen de la sesión al cerrar (total de ventas, monto final)
  - Consumir `PUT /pos/sesiones/{sesionId}/cerrar`
  - Mostrar historial de ventas de la sesión con `GET /pos/sesiones/{sesionId}/ventas`

---

## Fase 5 — Dashboard, Validaciones y Pulido (Avanzado)

- [ ] 5.1 Implementar Dashboard de Estadísticas
  - Crear `src/api/stats.api.ts` y `src/hooks/useStats.ts`
  - Crear `src/pages/Stats.tsx` con métricas: `totalProductos`, `totalStock`
  - Mostrar `distribucionPorCategoria` como gráfico de barras con Recharts
  - Mostrar `productosConStockBajo` como lista de alerta

- [ ] 5.2 Implementar sistema de notificaciones Toast
  - Crear `src/components/ui/Toast.tsx` para notificaciones de éxito y error
  - Integrar en todas las operaciones CRUD y POS

- [ ] 5.3 Implementar manejo global de errores
  - Capturar errores de red (sin conexión) con mensaje apropiado
  - Capturar errores 500 con mensaje genérico
  - Mostrar skeleton loaders en todas las secciones durante la carga

- [ ] 5.4 Pulido final y responsive
  - Verificar que la aplicación funciona correctamente en pantallas de 1024px+
  - Revisar consistencia visual con Tailwind en todos los módulos
  - Agregar indicadores de carga en todos los botones de envío
  - Verificar flujo completo: login → productos → POS → ticket → logout

---

## Notas

- **Nivel Básico (3.0):** Completar Fases 1 y 2 (login + listado de productos + manejo de token)
- **Nivel Intermedio (4.0):** Completar Fases 1, 2 y 3 (+ CRUD completo de productos y clientes)
- **Nivel Avanzado (5.0):** Completar todas las fases (+ POS + stats + validaciones + paginación)
- **Bonificación (+0.5):** Estilos coherentes con Tailwind, spinners/skeletons, componentes reutilizables
