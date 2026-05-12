# Plan de Implementación: Serverless Inventory API + POS Frontend

## Visión General

Proyecto completo organizado en dos partes:

- **Parte A — Backend:** API REST serverless sobre AWS SAM con arquitectura hexagonal (6 fases)
- **Parte B — Frontend:** SPA React 18 + TypeScript que consume el backend (5 fases)

**Convención:** Tareas con `*` son opcionales (tests). Tareas con `[x]` están completadas.

---

# PARTE A — Backend: Serverless Inventory API

**Stack:** Node.js 20.x · AWS SAM · API Gateway · DynamoDB · Jest · fast-check

---

## Fase 1 — Setup: Inicialización del Proyecto

- [x] 1.1 Inicializar el proyecto SAM y configurar `package.json` raíz
  - Crear `package.json` con scripts: `test`, `test:unit`, `test:integration`, `lint`
  - Instalar dependencias: `@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`, `uuid`
  - Instalar devDependencies: `jest`, `fast-check`, `aws-sdk-client-mock`, `eslint`
  - Configurar `jest.config.js` con `testEnvironment: node`, `coverageThreshold: 80%`

- [x] 1.2 Crear la estructura de carpetas del proyecto
  - Directorios: `src/shared/`, `src/health/`, `src/productos/`, `src/clientes/`, `src/cobros/`, `src/creditos/`, `src/stats/`, `src/pos/`
  - Subdirectorios por módulo: `domain/`, `application/ports/`, `application/use-cases/`, `infrastructure/`
  - Crear `tests/unit/`, `tests/integration/api/`, `tests/arbitraries/`

- [x] 1.3 Implementar utilidades compartidas — Errores de dominio
  - Crear `src/shared/domain/errors/DomainError.js` con clase base
  - Crear `NotFoundError.js` (HTTP 404, código `NOT_FOUND`)
  - Crear `ValidationError.js` (HTTP 400, código `VALIDATION_ERROR`)
  - Crear `ConflictError.js` (HTTP 409, código `CONFLICT`)

- [x] 1.4 Implementar utilidades compartidas — Infraestructura y middleware
  - Crear `src/shared/domain/value-objects/UniqueId.js` usando `uuid` v4
  - Crear `src/shared/infrastructure/DynamoDBClient.js` como singleton con `DynamoDBDocumentClient`
  - Crear `src/shared/infrastructure/ResponseBuilder.js` con métodos `ok`, `created`, `noContent`, `error`
  - Crear `src/shared/middleware/errorHandler.js` que mapea `DomainError` a respuesta HTTP estructurada
  - Crear `src/shared/middleware/correlationId.js` que extrae o genera `X-Correlation-ID`

- [ ]* 1.5 Escribir tests unitarios para utilidades compartidas
- [ ]* 1.6 Escribir test de propiedad P-15 — Estructura de respuesta de error
- [ ] 1.7 Checkpoint — Verificar setup inicial

---

## Fase 2 — Core Domain: Entidades y Ports

- [x] 2.1 Implementar entidad de dominio `Producto`
- [ ]* 2.2 Escribir tests unitarios para entidad `Producto`
- [ ]* 2.3 Escribir test de propiedad P-05 (parcial) — Rechazo de entradas inválidas
- [x] 2.4 Implementar entidad de dominio `Cliente`
- [ ]* 2.5 Escribir tests unitarios para entidad `Cliente`
- [x] 2.6 Implementar entidades de dominio `Cobro` y `Credito`
- [ ]* 2.7 Escribir tests unitarios para `Cobro` y `Credito`
- [ ]* 2.8 Escribir test de propiedad P-13 — Saldo de crédito nunca negativo
- [x] 2.9 Implementar entidades de dominio POS: `SesionDeCaja`, `Venta` y `Ticket`
- [ ]* 2.10 Escribir tests unitarios para entidades POS
- [x] 2.11 Implementar interfaces (Ports) de todos los módulos
- [ ] 2.12 Checkpoint — Verificar dominio y ports

---

## Fase 3 — Infrastructure: Adapters DynamoDB

- [ ] 3.1 Implementar `DynamoProductoRepository`
- [ ]* 3.2 Escribir tests unitarios para `DynamoProductoRepository`
- [ ] 3.3 Implementar `DynamoClienteRepository`
- [ ]* 3.4 Escribir tests unitarios para `DynamoClienteRepository`
- [ ] 3.5 Implementar `DynamoCobroRepository`
- [ ] 3.6 Implementar `DynamoCreditoRepository`
- [ ]* 3.7 Escribir tests unitarios para `DynamoCobroRepository` y `DynamoCreditoRepository`
- [ ] 3.8 Implementar `DynamoSesionRepository` y `DynamoVentaRepository`
- [ ]* 3.9 Escribir tests unitarios para `DynamoSesionRepository` y `DynamoVentaRepository`
- [ ] 3.10 Checkpoint — Verificar adapters DynamoDB

---

## Fase 4 — Lambda Handlers: Use Cases y Handlers

### Módulo Health
- [ ] 4.1 Implementar handler de Health Check
- [ ]* 4.2 Escribir tests unitarios para handler Health
- [ ]* 4.3 Escribir test de propiedad P-04 — Reflejo de versión del sistema

### Módulo Productos
- [ ] 4.4 Implementar use cases de Productos (Listar, Crear, Actualizar, Eliminar)
- [ ] 4.5 Implementar handler de Productos
- [ ]* 4.6 Escribir tests unitarios para use cases de Productos
- [ ]* 4.7 Escribir tests de propiedades P-01, P-02, P-03
- [ ]* 4.8 Escribir tests de propiedades P-06, P-07, P-08

### Módulo Clientes
- [ ] 4.9 Implementar use cases de Clientes
- [ ] 4.10 Implementar handler de Clientes
- [ ]* 4.11 Escribir tests unitarios para use cases de Clientes
- [ ]* 4.12 Escribir tests de propiedades P-09 y P-08 (Clientes)

### Módulo Cobros
- [ ] 4.13 Implementar use case `RegistrarCobro`
- [ ] 4.14 Implementar use case `ObtenerCobro` y handler de Cobros
- [ ]* 4.15 Escribir tests unitarios para use cases de Cobros
- [ ]* 4.16 Escribir tests de propiedades P-10, P-11, P-12

### Módulo Créditos
- [ ] 4.17 Implementar use cases de Créditos y handler
- [ ]* 4.18 Escribir tests unitarios para use cases de Créditos

### Módulo Stats
- [ ] 4.19 Implementar use case `ObtenerEstadisticas` y handler
- [ ]* 4.20 Escribir tests unitarios para `ObtenerEstadisticas`
- [ ]* 4.21 Escribir test de propiedad P-14 — Corrección de estadísticas

### Módulo POS
- [ ] 4.22 Implementar use cases `AbrirSesion` y `CerrarSesion`
- [ ]* 4.23 Escribir tests unitarios para `AbrirSesion` y `CerrarSesion`
- [ ]* 4.24 Escribir tests de propiedades P-16 y P-17
- [ ] 4.25 Implementar use case `RegistrarVenta`
- [ ]* 4.26 Escribir tests unitarios para `RegistrarVenta`
- [ ]* 4.27 Escribir tests de propiedades P-18, P-22, P-10 (POS)
- [ ] 4.28 Implementar use cases `ObtenerTicket` y `ListarVentasPorSesion`
- [ ]* 4.29 Escribir tests unitarios para `ObtenerTicket` y `ListarVentasPorSesion`
- [ ]* 4.30 Escribir tests de propiedades P-19, P-20, P-21
- [ ] 4.31 Implementar handler de POS
- [ ] 4.32 Checkpoint — Verificar todos los handlers y use cases

---

## Fase 5 — Testing: Arbitrarios y Tests de Integración

- [ ] 5.1 Crear arbitrarios fast-check compartidos
- [ ]* 5.2 Escribir test de propiedad P-05 — Rechazo de entradas inválidas (cobertura global)
- [ ]* 5.3 Escribir test de propiedad P-11 (POS) — Stock insuficiente en ventas
- [ ]* 5.4 Escribir test de propiedad P-12 (POS) — Decremento atómico de stock
- [ ]* 5.5 Verificar cobertura de tests por módulo (≥ 80%)
- [ ] 5.6 Checkpoint — Verificar cobertura y propiedades

---

## Fase 6 — IaC & Deploy: SAM Template y CI/CD

- [ ] 6.1 Crear `template.yaml` — Recursos globales y tablas DynamoDB (6 tablas con GSIs)
- [ ] 6.2 Crear `template.yaml` — API Gateway y Lambda Authorizer JWT
- [ ] 6.3 Crear `template.yaml` — 7 funciones Lambda con políticas IAM mínimas
- [ ] 6.4 Crear `samconfig.toml` con configuración de entornos (dev/staging/prod)
- [ ] 6.5 Crear `template.yaml` — Outputs y parámetros
- [ ]* 6.6 Crear script de CI/CD básico (GitHub Actions)
- [ ] 6.7 Checkpoint final — `sam validate` + `sam build` + `npm test`

---

# PARTE B — Frontend: POS Frontend

**Stack:** React 18 · TypeScript · Vite · Tailwind CSS · React Query · Axios

**Niveles del Parcial:**
- **Básico (3.0):** Fases F1 y F2 — login + listado de productos + manejo de token
- **Intermedio (4.0):** Fases F1, F2 y F3 — + CRUD completo de productos y clientes
- **Avanzado (5.0):** Todas las fases — + POS + stats + validaciones + paginación
- **Bonificación (+0.5):** Estilos Tailwind coherentes + spinners/skeletons + componentes reutilizables

---

## Fase F1 — Setup y Autenticación (Básico — Puntos 1–6 del Parcial)

- [ ] F1.1 Inicializar proyecto con Vite + React + TypeScript
  - Ejecutar `npm create vite@latest pos-frontend -- --template react-ts`
  - Instalar: `axios`, `react-router-dom`, `@tanstack/react-query`, `react-hook-form`, `zod`, `recharts`
  - Configurar Tailwind CSS con `npx tailwindcss init -p`
  - Configurar variable de entorno `VITE_API_URL` apuntando al backend SAM

- [ ] F1.2 Implementar cliente HTTP con interceptores JWT
  - Crear `src/api/client.ts` con instancia Axios y `baseURL = import.meta.env.VITE_API_URL`
  - Interceptor de request: inyecta `Authorization: Bearer <token>` desde `localStorage`
  - Interceptor de response: captura 401 → elimina token → redirige a `/login`

- [ ] F1.3 Implementar AuthContext y hook useAuth
  - Crear `src/context/AuthContext.tsx` con estado `token`, `user`, `login()`, `logout()`
  - `login()` consume `POST /auth`, almacena token en `localStorage`
  - `logout()` elimina token y redirige a `/login`

- [ ] F1.4 Implementar pantalla de Login
  - Formulario con campos `usuario`, `contraseña` y botón `"Iniciar sesión"`
  - Mostrar error si backend retorna 401 (`"Credenciales incorrectas"`) o 403 (`"Usuario inactivo"`)
  - Spinner en el botón mientras la petición está en curso
  - Redirigir a `/productos` tras login exitoso

- [ ] F1.5 Implementar ProtectedRoute y Router principal
  - `ProtectedRoute.tsx`: redirige a `/login` si no hay token
  - `App.tsx` con React Router v6: rutas públicas (`/login`) y protegidas (resto)
  - Redirigir `/login` → `/productos` si el usuario ya está autenticado

---

## Fase F2 — Layout y Listado de Productos (Básico — Puntos 7–11 del Parcial)

- [ ] F2.1 Implementar layout principal con navegación
  - `Sidebar.tsx` con links a: Productos, Clientes, Cobros, Créditos, POS, Stats
  - `Header.tsx` con nombre del usuario y botón `"Cerrar sesión"`
  - Componentes UI base: `Button.tsx`, `Input.tsx`, `Spinner.tsx`, `Table.tsx`

- [ ] F2.2 Implementar API y hook de Productos
  - `src/api/productos.api.ts`: `getProductos(filters)`, `createProducto()`, `updateProducto()`, `deleteProducto()`
  - `src/hooks/useProductos.ts` con React Query

- [ ] F2.3 Implementar página de Productos — Listado
  - Tabla con: `nombre`, `categoria`, `precio`, `stock`
  - Skeleton loader mientras carga
  - Mensaje `"No se encontraron productos"` si lista vacía
  - Header `Authorization: Bearer <token>` en cada petición

- [ ] F2.4 Implementar búsqueda y filtro por categoría
  - Campo de búsqueda por nombre (filtro local o `GET /productos?nombre=...`)
  - Select de categoría que consume `GET /productos?categoria={valor}`
  - Combinar ambos filtros simultáneamente

- [ ] F2.5 Implementar paginación
  - Controles `"Anterior"` / `"Siguiente"` y números de página
  - Consumir endpoint con `page` y `limit` como query params
  - Mostrar `"Página {n} de {total} — {count} productos"`

---

## Fase F3 — CRUD Completo (Intermedio — Puntos 12–23 del Parcial)

- [ ] F3.1 Implementar formulario de Producto (crear/editar)
  - `ProductoForm.tsx` con React Hook Form + Zod
  - Validar: `nombre` no vacío, `categoria` no vacía, `precio > 0`, `stock >= 0`
  - Mensajes de validación junto a cada campo inválido

- [ ] F3.2 Implementar crear y editar Producto
  - Botón `"Nuevo producto"` → modal con `ProductoForm`
  - Botón `"Editar"` → carga datos actuales en el modal
  - Actualizar lista automáticamente tras crear/editar (React Query invalidation)
  - Toast de éxito: `"Producto creado correctamente"` / `"Producto actualizado"`

- [ ] F3.3 Implementar eliminar Producto
  - Botón `"Eliminar"` con confirmación (modal o `confirm()`)
  - Consumir `DELETE /productos/{id}` y remover de la lista sin recargar

- [ ] F3.4 Implementar CRUD de Clientes
  - `clientes.api.ts`, `useClientes.ts`, `Clientes.tsx`, `ClienteForm.tsx`
  - Validación de email, manejo de error 409 (email duplicado)

- [ ] F3.5 Implementar Cobros
  - `cobros.api.ts`, `useCobros.ts`, `Cobros.tsx`
  - Manejo de error 409 de stock insuficiente

- [ ] F3.6 Implementar Créditos
  - `creditos.api.ts`, `useCreditos.ts`, `CreditoForm.tsx`
  - Mostrar saldo de crédito en perfil del cliente

---

## Fase F4 — Módulo POS (Avanzado — Workshop)

- [ ] F4.1 Implementar CartContext y lógica del carrito
  - Estado: `items`, `clienteId`, `sesionId`, `metodoPago`
  - Acciones: `addItem()`, `removeItem()`, `updateQuantity()`, `clearCart()`
  - Calcular en tiempo real: `subtotal`, `creditoAplicado`, `total`

- [ ] F4.2 Implementar apertura de sesión de caja
  - `AbrirSesion.tsx` con formulario de `montoInicial`
  - Verificar sesión activa al cargar el módulo POS
  - Consumir `POST /pos/sesiones`

- [ ] F4.3 Implementar pantalla de venta (carrito)
  - `Carrito.tsx` con buscador de productos y lista del carrito
  - Totales en tiempo real al agregar/modificar ítems
  - Selector de método de pago: Efectivo, Tarjeta, Crédito
  - Mostrar saldo de crédito disponible cuando se selecciona `"Crédito"`

- [ ] F4.4 Implementar checkout y generación de ticket
  - Consumir `POST /pos/ventas` al hacer clic en `"Cobrar"`
  - Manejar error 409 de stock insuficiente con mensaje por producto
  - `Ticket.tsx` con todos los campos del ticket
  - Botón `"Imprimir"` con `window.print()` y estilos de impresión

- [ ] F4.5 Implementar cierre de sesión de caja e historial
  - Resumen de la sesión al cerrar (total de ventas, monto final)
  - Consumir `PUT /pos/sesiones/{sesionId}/cerrar`
  - Historial de ventas con `GET /pos/sesiones/{sesionId}/ventas`

---

## Fase F5 — Dashboard, Validaciones y Pulido (Avanzado — Bonificación)

- [ ] F5.1 Implementar Dashboard de Estadísticas
  - `Stats.tsx` con métricas: `totalProductos`, `totalStock`
  - Gráfico de barras con Recharts para `distribucionPorCategoria`
  - Lista de alerta para `productosConStockBajo`

- [ ] F5.2 Implementar sistema de notificaciones Toast
  - `Toast.tsx` para notificaciones de éxito y error
  - Integrar en todas las operaciones CRUD y POS

- [ ] F5.3 Implementar manejo global de errores
  - Capturar errores de red (sin conexión) con mensaje apropiado
  - Capturar errores 500 con mensaje genérico
  - Skeleton loaders en todas las secciones durante la carga

- [ ] F5.4 Pulido final y responsive
  - Verificar funcionamiento en pantallas de 1024px+
  - Consistencia visual con Tailwind en todos los módulos
  - Indicadores de carga en todos los botones de envío
  - Flujo completo: login → productos → POS → ticket → logout

---

## Notas Generales

- Tareas con `*` son opcionales — pueden omitirse para un MVP más rápido
- Tareas con `[x]` están completadas y verificadas
- Los tests PBT del backend validan las 22 propiedades de corrección del diseño
- El frontend cubre los puntos 1–34 del Parcial Práctico y el Workshop SDD completo


---

# Frontend POS — Plan de Implementación

> Cubre los requisitos del **Workshop SDD con Kiro AWS** y el **Parcial Práctico de Frontend**.
> Consume la Serverless Inventory API construida en las fases anteriores.
>
> **Stack:** React 18 · TypeScript · Vite · Tailwind CSS · React Query · Axios
>
> | Nivel | Nota | Alcance |
> |-------|------|---------|
> | Básico | 3.0 | Fases FE-1 y FE-2 (login + listado de productos) |
> | Intermedio | 4.0 | Fases FE-1, FE-2 y FE-3 (+ CRUD completo) |
> | Avanzado | 5.0 | Todas las fases (+ POS + stats + paginación) |
> | Bonificación | +0.5 | Estilos Tailwind coherentes, spinners, componentes reutilizables |

---

## Fase FE-1 — Setup y Autenticación (Básico)

- [ ] FE-1.1 Inicializar proyecto con Vite + React + TypeScript
  - Ejecutar `npm create vite@latest pos-frontend -- --template react-ts`
  - Instalar: `axios`, `react-router-dom`, `@tanstack/react-query`, `react-hook-form`, `zod`, `recharts`
  - Configurar Tailwind CSS y variable de entorno `VITE_API_URL`

- [ ] FE-1.2 Implementar cliente HTTP con interceptores JWT
  - Crear `src/api/client.ts` con instancia Axios
  - Interceptor de request: inyecta `Authorization: Bearer <token>` desde `localStorage`
  - Interceptor de response: captura 401 → elimina token → redirige a `/login`

- [ ] FE-1.3 Implementar AuthContext y hook useAuth
  - `login()` consume `POST /auth`, almacena token en `localStorage`
  - `logout()` elimina token y redirige a `/login`

- [ ] FE-1.4 Implementar pantalla de Login
  - Formulario con campos `usuario`, `contraseña` y botón `"Iniciar sesión"`
  - Mostrar error si backend retorna 401 o 403
  - Spinner en botón mientras la petición está en curso
  - Redirigir a `/productos` tras login exitoso

- [ ] FE-1.5 Implementar ProtectedRoute y Router principal
  - `ProtectedRoute` redirige a `/login` si no hay token
  - Redirigir `/login` → `/productos` si ya está autenticado

---

## Fase FE-2 — Layout y Listado de Productos (Básico)

- [ ] FE-2.1 Implementar layout principal con navegación
  - Sidebar con links: Productos, Clientes, Cobros, Créditos, POS, Stats
  - Header con nombre del usuario y botón `"Cerrar sesión"`
  - Componentes UI base: `Button`, `Input`, `Spinner`, `Table`

- [ ] FE-2.2 Implementar API y hook de Productos
  - `src/api/productos.api.ts` con `getProductos`, `createProducto`, `updateProducto`, `deleteProducto`
  - `src/hooks/useProductos.ts` con React Query

- [ ] FE-2.3 Implementar página de Productos — Listado
  - Tabla con: `nombre`, `categoria`, `precio`, `stock`
  - Skeleton loader mientras carga
  - Mensaje `"No se encontraron productos"` si lista vacía

- [ ] FE-2.4 Implementar búsqueda y filtro por categoría
  - Campo de búsqueda por nombre
  - Select de categoría → `GET /productos?categoria={valor}`
  - Filtros combinables simultáneamente

- [ ] FE-2.5 Implementar paginación
  - Controles `"Anterior"` / `"Siguiente"` y números de página
  - Query params `page` y `limit`
  - Mostrar `"Página {n} de {total} — {count} productos"`

---

## Fase FE-3 — CRUD Completo (Intermedio)

- [ ] FE-3.1 Implementar formulario de Producto (crear/editar)
  - React Hook Form + Zod: `nombre`, `categoria`, `precio > 0`, `stock >= 0`
  - Mensajes de validación junto a cada campo inválido

- [ ] FE-3.2 Implementar crear y editar Producto
  - Modal con `ProductoForm` para crear y editar
  - Actualizar lista automáticamente (React Query invalidation)
  - Toast de éxito/error

- [ ] FE-3.3 Implementar eliminar Producto
  - Confirmación antes de eliminar
  - Remover de lista sin recargar

- [ ] FE-3.4 Implementar CRUD de Clientes
  - Tabla, búsqueda local, formulario con validación de email
  - Manejar error 409 (email duplicado)

- [ ] FE-3.5 Implementar Cobros
  - Historial de cobros y formulario de nuevo cobro
  - Manejar error 409 de stock insuficiente

- [ ] FE-3.6 Implementar Créditos
  - Saldo de crédito en perfil del cliente
  - Formulario con validación de monto > 0

---

## Fase FE-4 — Módulo POS (Avanzado)

- [ ] FE-4.1 Implementar CartContext y lógica del carrito
  - Estado: `items`, `clienteId`, `sesionId`, `metodoPago`
  - Calcular en tiempo real: `subtotal`, `creditoAplicado`, `total`

- [ ] FE-4.2 Implementar apertura de sesión de caja
  - Formulario de `montoInicial` → `POST /pos/sesiones`

- [ ] FE-4.3 Implementar pantalla de venta (carrito)
  - Buscador de productos, lista del carrito, totales en tiempo real
  - Selector de método de pago: Efectivo, Tarjeta, Crédito

- [ ] FE-4.4 Implementar checkout y generación de ticket
  - `POST /pos/ventas` → manejar error 409 de stock
  - Ticket con todos los campos + botón `"Imprimir"` (`window.print()`)

- [ ] FE-4.5 Implementar cierre de sesión de caja e historial
  - `PUT /pos/sesiones/{sesionId}/cerrar`
  - Historial de ventas de la sesión

---

## Fase FE-5 — Dashboard, Validaciones y Pulido (Avanzado)

- [ ] FE-5.1 Implementar Dashboard de Estadísticas
  - `GET /stats` → gráfico de barras con Recharts para `distribucionPorCategoria`
  - Lista de alerta para `productosConStockBajo`

- [ ] FE-5.2 Implementar sistema de notificaciones Toast

- [ ] FE-5.3 Implementar manejo global de errores
  - Errores de red, errores 500, skeleton loaders en todas las secciones

- [ ] FE-5.4 Pulido final y responsive
  - Verificar en pantallas 1024px+
  - Flujo completo: login → productos → POS → ticket → logout
