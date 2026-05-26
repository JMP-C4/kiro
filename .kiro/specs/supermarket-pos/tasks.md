# Plan de Implementación — Sistema POS Supermercado

## Visión General

Implementación incremental de un sistema POS de supermercado con dos proyectos separados. El plan está organizado en **8 fases** que progresan desde la infraestructura base hasta el despliegue.

**Frontend:** React 18 · TypeScript · Vite · Tailwind CSS v4 · Glassmorphism
**Backend:** Spring Boot 3 · Java 17 · PostgreSQL · Spring Security · JWT

---

## Fase 1 — Setup: Proyectos Base

- [x] 1.1 Inicializar proyecto frontend
  - Ejecutar `npm create vite@latest pos-frontend -- --template react-ts`
  - Instalar: `axios`, `react-router-dom`, `@tanstack/react-query`, `react-hook-form`, `zod`, `@hookform/resolvers`, `nanoid`
  - Instalar dev: `@tailwindcss/postcss`, `tailwindcss`
  - Crear `.env` con `VITE_API_URL=http://localhost:8080`
  - Configurar `index.css` con tokens glassmorphism y `@media print`
  - _Requisitos: RNF-15, RNF-17_

- [x] 1.2 Inicializar proyecto backend Spring Boot
  - Crear proyecto con Spring Initializr: Spring Web, Spring Security, Spring Data JPA, PostgreSQL Driver, Flyway, Lombok, Validation
  - Configurar `application.yml` con datasource PostgreSQL, JWT secret, CORS
  - Crear base de datos PostgreSQL local: `pos_supermarket`
  - _Requisitos: RNF-08, RNF-19_

- [x] 1.3 Crear migraciones Flyway — esquema inicial
  - Crear `V1__init.sql` con tablas: `usuarios`, `productos`, `ventas`, `venta_items`, `configuracion`
  - Crear `V2__seed.sql` con usuario admin inicial y configuración por defecto
  - Verificar que Flyway aplica las migraciones al iniciar el backend
  - _Requisitos: Req-9, Req-11_

- [-] 1.4 Configurar Spring Security base
  - Crear `SecurityConfig.java` con rutas públicas (`/auth/login`, `/health`) y protegidas
  - Crear `JwtService.java` para emisión y validación de tokens
  - Crear `JwtAuthFilter.java` como filtro de Spring Security
  - Crear enum `Rol.java` con valores `CAJERO`, `SUPERVISOR`, `ADMIN`
  - _Requisitos: Req-1, RNF-05, RNF-07_

---

## Fase 2 — Autenticación

- [ ] 2.1 Backend — Endpoint de login
  - Crear `AuthController.java` con `POST /auth/login`
  - Crear `AuthService.java` que valida credenciales con bcrypt y emite JWT
  - JWT debe incluir: `sub` (username), `rol`, `nombre`, `exp` (8 horas)
  - Crear `GET /health` que retorna `{ status: "ok" }`
  - _Requisitos: Req-1 (1.2, 1.9, 1.10), RNF-05, RNF-06_

- [x] 2.2 Frontend — AuthContext y cliente HTTP
  - Crear `AuthContext.tsx` con estado `token`, `rol`, `nombre`, `login()`, `logout()`
  - Crear `src/api/client.ts` con instancia Axios e interceptor JWT automático
  - Interceptor de response: captura 401/403 → elimina token → redirige al login
  - _Requisitos: Req-1 (1.3, 1.6, 1.7), RNF-03_

- [x] 2.3 Frontend — Pantalla de Login
  - Crear `Login.tsx` con glassmorphism, campos `usuario` y `contraseña`
  - Validación con Zod: campos obligatorios
  - Mostrar error en 401 (credenciales inválidas) y 403 (usuario inactivo)
  - Al login exitoso → redirigir directo al POS
  - _Requisitos: Req-1 (1.1, 1.4, 1.5), RNF-15_

- [x] 2.4 Frontend — ProtectedRoute y Router
  - Crear `ProtectedRoute.tsx` que verifica JWT y redirige al login si no existe
  - Crear `App.tsx` con rutas: `/login` (pública), `/pos`, `/productos`, `/usuarios`, `/reportes`, `/configuracion` (protegidas)
  - Protección por rol: `/usuarios` solo ADMIN, `/reportes` SUPERVISOR+
  - _Requisitos: Req-1 (1.5), Req-7 (7.5)_

---

## Fase 3 — Backend Core: Productos y Usuarios

- [ ] 3.1 Backend — CRUD de Productos
  - Crear `Producto.java` (@Entity) con todos los campos del esquema
  - Crear `ProductoRepository.java` con queries de búsqueda por código y nombre
  - Crear `ProductoService.java` con lógica de negocio y validaciones
  - Crear `ProductoController.java` con endpoints GET/POST/PUT/DELETE
  - Búsqueda: `GET /productos?q=texto` retorna en máximo 300ms
  - _Requisitos: Req-8, RNF-01_

- [ ] 3.2 Backend — CRUD de Usuarios
  - Crear `Usuario.java` (@Entity) con bcrypt en `@PrePersist`
  - Crear `UsuarioRepository.java`
  - Crear `UsuarioService.java` — nunca retornar `password_hash`
  - Crear `UsuarioController.java` con endpoints GET/POST/PUT/DELETE
  - Solo accesible para rol ADMIN
  - _Requisitos: Req-9, RNF-06, P-07_

- [ ] 3.3 Backend — Manejo global de errores
  - Crear `GlobalExceptionHandler.java` con `@ControllerAdvice`
  - Retornar siempre `{ codigo, mensaje, detalles }` en errores
  - Manejar: 400 (validación), 401 (no autenticado), 403 (sin permiso), 404 (no encontrado), 409 (duplicado)
  - _Requisitos: RNF-21_

---

## Fase 4 — Frontend: Componentes Base y POS Layout

- [x] 4.1 Componentes UI base glassmorphism
  - Crear `GlassCard.tsx`, `GlassInput.tsx`, `GlassModal.tsx`
  - Crear `ThemeToggle.tsx` con persistencia en localStorage
  - Crear `Spinner.tsx` — `border-4 border-dashed rounded-full animate-spin` (loading.html)
  - _Requisitos: RNF-15, RNF-16_

- [x] 4.2 Hook centralizado de atajos de teclado
  - Crear `useKeyboardShortcuts.ts` con UN solo event listener global
  - Recibe array de `{ key, action, disabled, description }`
  - Desactiva todos los atajos cuando `modalOpen=true`, excepto Esc
  - _Requisitos: Req-7, RNF-11, RNF-13, P-11_

- [x] 4.3 Lógica pura de IVA
  - Crear `src/lib/calcularTotales.ts` — función pura sin dependencias React
  - Implementar: `calcularTotales(items, tasaIVA, descuentoPct): Totales`
  - Manejar `incluye_iva=true` (desglosar IVA incluido) y `incluye_iva=false` (agregar IVA)
  - _Requisitos: Req-3 (3.10, 3.11), Req-4, P-01, P-02, P-03_

- [x] 4.4 Layout del POS — grid 12 columnas
  - Crear `POS.tsx` con layout `grid grid-cols-12` (estructura.html)
  - Col izquierda (col-span-3): buscador + panel atajos
  - Col central (col-span-6): carrito
  - Col derecha (col-span-3): resumen + botón cobrar
  - Barra superior con `KeyboardShortcutsBar` y `OverflowMenu`
  - _Requisitos: Req-7 (7.4), RNF-17_

---

## Fase 5 — POS: Buscador y Carrito

- [x] 5.1 Componente ProductSearch
  - Crear `ProductSearch.tsx` — fieldset con label hidden, span con botón lupa (search.html)
  - F1 coloca foco en el input
  - Enter busca y agrega producto (siempre línea nueva)
  - Mostrar dropdown con resultados de búsqueda
  - Mostrar "Producto no encontrado" si no hay resultados
  - _Requisitos: Req-2, P-05_

- [x] 5.2 Reducer del carrito — `usePOS`
  - Crear `usePOS.ts` con `useReducer`
  - Acciones: ADD_ITEM, REMOVE_ITEM, REMOVE_LAST, CLEAR_CART, SET_DESCUENTO, SET_METODO_PAGO, SET_MONTO_PAGADO, SELECT_ITEM, MOVE_SELECTION, SET_MODAL
  - Cada ADD_ITEM crea línea nueva con `nanoid()` — nunca acumula
  - _Requisitos: Req-3, P-05_

- [x] 5.3 Componente CartList y CartItem
  - Crear `CartList.tsx` — `ul` con `space-y-2` (Shopping_cart.html)
  - Crear `CartItem.tsx` — `li flex items-start justify-between`
  - Izquierda: nombre + cantidad (`x3` en violeta)
  - Derecha: subtotal + precio unitario (`à $precio`)
  - Ítem seleccionado resaltado con borde violeta
  - Navegación ↑↓ entre ítems, Del elimina seleccionado
  - _Requisitos: Req-3 (3.1, 3.3, 3.4), RNF-14_

- [x] 5.4 Componente CartSummary
  - Crear `CartSummary.tsx` con estructura de Shopping_cart.html
  - Mostrar: subtotal sin IVA, IVA 19%, total con IVA
  - Actualización automática en cada cambio del carrito
  - Botón "F6 — Cobrar" deshabilitado si carrito vacío
  - _Requisitos: Req-3 (3.2, 3.9), Req-6 (6.8)_

- [x] 5.5 Modal de peso para productos a granel
  - Crear `WeightModal.tsx` — se abre automáticamente para `unidad_medida` kg/g/lb
  - Input numérico con foco automático
  - Muestra precio/unidad y calcula subtotal en tiempo real
  - Enter confirma, Esc cancela sin agregar al carrito
  - _Requisitos: Req-2 (2.6, 2.7, 2.8, 2.9)_

---

## Fase 6 — POS: Modales de Pago y Ticket

- [x] 6.1 Modal de IVA/Descuento (F4)
  - Crear `IVAModal.tsx` — muestra desglose: subtotal, IVA 19%, total
  - Campo para descuento global (0-100%)
  - Validar que descuento esté entre 0 y 100
  - Recalcular totales al confirmar usando `calcularTotales`
  - _Requisitos: Req-4, P-03_

- [x] 6.2 Modal de Método de Pago (F5)
  - Crear `PaymentModal.tsx` — opciones Efectivo, Tarjeta, Transferencia
  - Navegación con ↑↓, confirmar con Enter
  - Para Efectivo: campo monto recibido → calcular cambio automático
  - Deshabilitar confirmar si monto recibido < total
  - _Requisitos: Req-5, P-04_

- [ ] 6.3 Backend — Endpoint de ventas
  - Crear `Venta.java` y `VentaItem.java` (@Entity)
  - Crear `VentaService.java` — calcular IVA en backend también (validación)
  - Crear `VentaController.java` con `POST /ventas`
  - Generar `numero_venta` único (ej: `VTA-20260525-0001`)
  - Retornar venta completa con número generado
  - _Requisitos: Req-6 (6.2, 6.3), P-08_

- [x] 6.4 Modal de Ticket (F7)
  - Crear `TicketModal.tsx` con todos los campos requeridos
  - Botón "Imprimir" → `window.print()` con clase del formato configurado
  - Botón "Guardar PDF" → `window.print()` (el usuario elige PDF en el diálogo)
  - Botón "Nueva Venta" (F8) → cerrar modal + limpiar carrito
  - Estilos `@media print` que ocultan todo excepto `#ticket-print`
  - _Requisitos: Req-6 (6.4, 6.5, 6.6, 6.7), Req-12_

- [x] 6.5 Integración F6 — Procesar venta completa
  - Al presionar F6: validar carrito no vacío y método de pago seleccionado
  - Enviar `POST /ventas` al backend
  - Si éxito: abrir TicketModal con datos retornados
  - Si error: mostrar mensaje descriptivo, mantener carrito intacto
  - _Requisitos: Req-6 (6.1, 6.8, 6.9, 6.10)_

- [x] 6.6 Menú de desbordamiento (tecla M)
  - Crear `OverflowMenu.tsx` — dropdown glassmorphism
  - Tecla M abre/cierra el menú
  - Muestra atajos secundarios con descripción
  - Navegación con ↑↓ dentro del menú
  - _Requisitos: Req-7 (7.2)_

---

## Fase 7 — Módulos Admin

- [x] 7.1 Frontend — Módulo de Productos (Admin/Supervisor)
  - Crear `Productos.tsx` con tabla glassmorphism + buscador (search.html)
  - Admin: botones crear, editar, desactivar
  - Supervisor: solo lectura sin botones de edición
  - Crear `ProductoForm.tsx` con React Hook Form + Zod
  - _Requisitos: Req-8 (8.7, 8.8)_

- [ ] 7.2 Frontend — Módulo de Usuarios (solo Admin)
  - Crear `Usuarios.tsx` con tabla de usuarios
  - Crear formulario de creación/edición con campos: nombre, apellido, username, contraseña, rol, estado
  - Solo visible para rol ADMIN
  - _Requisitos: Req-9 (9.8)_

- [ ] 7.3 Backend — Endpoint de reportes
  - Crear `ReporteController.java` con `GET /reportes/ventas?desde=&hasta=`
  - Retornar: total ventas, monto total, desglose por método de pago, lista de ventas
  - Solo accesible para SUPERVISOR y ADMIN
  - _Requisitos: Req-10_

- [ ] 7.4 Frontend — Módulo de Reportes (Supervisor/Admin)
  - Crear `Reportes.tsx` con filtros: hoy, semana, mes, rango personalizado
  - Mostrar resumen en bento cards glassmorphism
  - Tabla de ventas individuales
  - Solo visible para SUPERVISOR y ADMIN
  - _Requisitos: Req-10 (10.3, 10.4, 10.6)_

- [ ] 7.5 Backend + Frontend — Configuración del sistema
  - Backend: `GET /configuracion` y `PUT /configuracion`
  - Frontend: `Configuracion.tsx` con formulario para nombre negocio, tasa IVA, formato papel
  - Al guardar: actualizar contexto de configuración en el frontend
  - Solo visible para ADMIN
  - _Requisitos: Req-11_

---

## Fase 8 — Testing y Pulido

- [ ] 8.1 Tests unitarios — lógica de IVA
  - Tests para `calcularTotales`: IVA incluido, IVA excluido, con descuento, sin ítems
  - Verificar P-01, P-02, P-03, P-04
  - _Requisitos: P-01, P-02, P-03, P-04_

- [ ] 8.2 Tests unitarios — reducer del carrito
  - Tests para `usePOS`: ADD_ITEM siempre crea línea nueva, REMOVE_LAST, CLEAR_CART
  - Verificar P-05
  - _Requisitos: P-05_

- [ ] 8.3 Tests backend — autenticación y autorización
  - Tests JUnit para `AuthService`: login válido, credenciales inválidas, usuario inactivo
  - Tests de autorización: CAJERO no puede POST /productos (P-06)
  - _Requisitos: P-06, P-07, P-10_

- [ ] 8.4 Tests backend — ventas
  - Tests para `VentaService`: cálculo IVA, número de venta único
  - Verificar P-08, P-12
  - _Requisitos: P-08, P-12_

- [ ] 8.5 Verificación de atajos de teclado
  - Verificar que F1-F9 funcionan en menos de 50ms (RNF-13)
  - Verificar que atajos se desactivan con modal abierto (P-11)
  - Verificar flujo completo sin ratón: buscar → agregar → pagar → imprimir
  - _Requisitos: RNF-11, RNF-13, P-11_

- [ ] 8.6 Verificación de formatos de impresión
  - Probar ticket en formato 80mm, 58mm y carta
  - Verificar que `@media print` oculta correctamente la interfaz
  - Verificar guardado como PDF
  - _Requisitos: Req-12_

- [ ] 8.7 Checkpoint final
  - Ejecutar suite completa de tests frontend y backend
  - Verificar flujo completo: login → POS → venta → ticket → nueva venta
  - Verificar acceso por roles en todos los módulos
  - Documentar comandos de inicio en README de cada proyecto

---

## Notas

- El backend y frontend son proyectos independientes en carpetas separadas
- El backend corre en `http://localhost:8080`, el frontend en `http://localhost:5173`
- La lógica de IVA se calcula tanto en frontend (UX) como en backend (validación)
- Los atajos de teclado están centralizados en `useKeyboardShortcuts` para evitar conflictos
- El ticket usa `window.print()` nativo — no requiere librerías externas de PDF
