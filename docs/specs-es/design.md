# Documento de Diseño Técnico — Serverless Inventory API + POS Frontend

## Visión General del Proyecto

Sistema completo de gestión de inventario y punto de venta con dos componentes:

| Componente | Stack | Descripción |
|-----------|-------|-------------|
| **Backend** | Node.js 20.x · AWS SAM · DynamoDB | API REST serverless con arquitectura hexagonal |
| **Frontend** | React 18 · TypeScript · Vite · Tailwind | SPA que consume el backend con autenticación JWT |

---

## Parte 1 — Backend: Serverless Inventory API

**Stack:** API Gateway → Lambda (Node.js 20.x) → DynamoDB

### Índice de Documentos — Backend

| Archivo | Contenido |
|---------|-----------|
| [01-arquitectura.md](design/01-arquitectura.md) | Diagrama AWS, flujo HTTP, ciclo de vida del dato |
| [02-estructura-proyecto.md](design/02-estructura-proyecto.md) | Árbol de carpetas del proyecto SAM |
| [03-endpoints-hexagonal.md](design/03-endpoints-hexagonal.md) | Mapeo de endpoints, Ports & Adapters, validación por capas |
| [04-modelos-datos.md](design/04-modelos-datos.md) | Entidades de dominio y tablas DynamoDB con GSIs |
| [05-propiedades-correccion.md](design/05-propiedades-correccion.md) | 22 propiedades formales de corrección (PBT) |
| [06-manejo-errores.md](design/06-manejo-errores.md) | Jerarquía de errores, middleware, tabla de códigos |
| [07-estrategia-testing.md](design/07-estrategia-testing.md) | Jest + fast-check, arbitrarios, cobertura por módulo |

### Resumen de Decisiones — Backend

| Decisión | Elección | Razón |
|----------|----------|-------|
| Runtime | Node.js 20.x | LTS activo, cold starts bajos |
| Persistencia | DynamoDB on-demand | Escalabilidad automática |
| Autenticación | Lambda Authorizer + JWT | Desacoplado de la lógica de negocio |
| Arquitectura | Hexagonal (Ports & Adapters) | Testabilidad, intercambiabilidad de adapters |
| PBT | fast-check | Madurez, integración con Jest |
| IaC | AWS SAM | Nativo para Lambda, simplifica despliegue |

### Módulos y Lambdas

| Lambda | Endpoints | Tablas DynamoDB |
|--------|-----------|-----------------|
| HealthCheckFunction | GET /health | — |
| ProductosFunction | GET/POST/PUT/DELETE /productos | Productos |
| ClientesFunction | GET/POST/PUT/DELETE /clientes | Clientes |
| CobrosFunction | POST/GET /cobros | Cobros, Productos, Creditos |
| CreditosFunction | POST/GET /creditos | Creditos, Clientes |
| StatsFunction | GET /stats | Productos |
| POSFunction | POST/PUT/GET /pos/* | POS_Sesiones, POS_Ventas, Productos, Creditos |

---

## Parte 2 — Frontend: POS Frontend

**Stack:** React 18 · TypeScript · Vite · Tailwind CSS · React Router v6 · React Query · Axios · Recharts

### Índice de Documentos — Frontend

| Archivo | Contenido |
|---------|-----------|
| [08-frontend-arquitectura.md](design/08-frontend-arquitectura.md) | Estructura de capas, diagrama de componentes, routing |
| [09-frontend-api-client.md](design/09-frontend-api-client.md) | Cliente HTTP, interceptores JWT, manejo de errores |
| [10-frontend-componentes.md](design/10-frontend-componentes.md) | Árbol de componentes por módulo |
| [11-frontend-estado.md](design/11-frontend-estado.md) | Gestión de estado con React Query y Context |
| [12-frontend-pos-flow.md](design/12-frontend-pos-flow.md) | Flujo POS: sesión → carrito → checkout → ticket |

### Resumen de Decisiones — Frontend

| Decisión | Elección | Razón |
|----------|----------|-------|
| Framework | React 18 + TypeScript | Ecosistema maduro, tipado estático |
| Build tool | Vite | Cold start rápido, HMR eficiente |
| Estilos | Tailwind CSS | Utility-first, consistencia visual rápida |
| Routing | React Router v6 | Estándar de facto para SPAs React |
| Data fetching | React Query (TanStack) | Cache, loading states, refetch automático |
| HTTP client | Axios | Interceptores para JWT, manejo de errores centralizado |
| Gráficos | Recharts | Ligero, compatible con React |
| Formularios | React Hook Form + Zod | Validación declarativa, rendimiento |

### Mapeo de Rutas — Frontend

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
