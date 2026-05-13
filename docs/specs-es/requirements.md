# Documento de Requisitos — Serverless Inventory API + POS Frontend

## Introducción

Proyecto completo de gestión de inventario y punto de venta compuesto por:

- **Backend:** API REST serverless sobre AWS SAM (API Gateway + Lambda Node.js 20.x + DynamoDB)
- **Frontend:** SPA React 18 + TypeScript que consume el backend con autenticación JWT

Cubre los requisitos del **Workshop SDD con Kiro AWS** y el **Parcial Práctico de Frontend**.

---

## Parte 1 — Backend: Serverless Inventory API

**Stack:** Node.js 20.x · AWS SAM · API Gateway · DynamoDB · Arquitectura Hexagonal

### Módulos del Backend

- Monitoreo del estado (Health Check)
- Gestión de productos (CRUD + inventario)
- Gestión de clientes
- Sistema de cobros y facturación
- Sistema de créditos a clientes
- Estadísticas y métricas
- Módulo POS (Point of Sale): sesiones de caja, ventas, tickets, múltiples métodos de pago

### Índice de Documentos — Backend

| Archivo | Contenido |
|---------|-----------|
| [01-glosario.md](requirements/01-glosario.md) | Definición de términos del dominio |
| [02-modulo-productos.md](requirements/02-modulo-productos.md) | Req. 1–5: Health Check y CRUD de Productos |
| [03-modulo-clientes.md](requirements/03-modulo-clientes.md) | Req. 6: Gestión de Clientes |
| [04-modulo-cobros-creditos.md](requirements/04-modulo-cobros-creditos.md) | Req. 7–8: Cobros y Créditos |
| [05-modulo-pos.md](requirements/05-modulo-pos.md) | Req. 9–11: Stats, Errores y POS |
| [06-requisitos-funcionales.md](requirements/06-requisitos-funcionales.md) | RF-01 a RF-16 |
| [07-requisitos-no-funcionales.md](requirements/07-requisitos-no-funcionales.md) | RNF: Rendimiento, Seguridad, Escalabilidad, Observabilidad |

### Resumen de Requisitos — Backend

| # | Módulo | User Story |
|---|--------|-----------|
| Req-01 | Health | Como operador, quiero consultar el estado de la API para verificar que está operativa. |
| Req-02 | Productos | Como usuario, quiero listar productos con filtrado por categoría. |
| Req-03 | Productos | Como admin, quiero registrar nuevos productos con validaciones. |
| Req-04 | Productos | Como admin, quiero actualizar datos de productos existentes. |
| Req-05 | Productos | Como admin, quiero eliminar productos del catálogo. |
| Req-06 | Clientes | Como admin, quiero gestionar el CRUD completo de clientes. |
| Req-07 | Cobros | Como cajero, quiero registrar cobros con descuento automático de stock. |
| Req-08 | Créditos | Como admin financiero, quiero gestionar créditos aplicables en cobros. |
| Req-09 | Stats | Como gerente, quiero consultar métricas del inventario. |
| Req-10 | Errores | Como consumidor, quiero respuestas de error consistentes. |
| Req-11 | POS | Como cajero, quiero gestionar sesiones de caja y ventas presenciales. |

---

## Parte 2 — Frontend: POS Frontend

**Stack:** React 18 · TypeScript · Vite · Tailwind CSS · React Query · Axios

Cubre el **Workshop SDD** (POS de supermercado) y el **Parcial Práctico** (CRUD de productos con JWT).

### Módulos del Frontend

- Autenticación JWT (login, logout, protección de rutas)
- Gestión de Productos (CRUD + búsqueda + filtros + paginación)
- Gestión de Clientes (CRUD)
- Cobros y Créditos
- POS — Punto de Venta (sesiones de caja, carrito, checkout, recibo)
- Dashboard de Estadísticas

### Índice de Documentos — Frontend

| Archivo | Contenido |
|---------|-----------|
| [08-frontend-autenticacion.md](requirements/08-frontend-autenticacion.md) | Login, JWT, protección de rutas |
| [09-frontend-productos.md](requirements/09-frontend-productos.md) | CRUD, búsqueda, filtros, paginación |
| [10-frontend-clientes.md](requirements/10-frontend-clientes.md) | CRUD de clientes |
| [11-frontend-cobros-creditos.md](requirements/11-frontend-cobros-creditos.md) | Registro de cobros y créditos |
| [12-frontend-pos.md](requirements/12-frontend-pos.md) | Sesiones de caja, carrito, checkout, recibo |
| [13-frontend-estadisticas.md](requirements/13-frontend-estadisticas.md) | Dashboard de métricas |
| [14-frontend-ux.md](requirements/14-frontend-ux.md) | Validaciones, loaders, mensajes de error, offline |

### Resumen de Requisitos — Frontend

| # | Módulo | User Story | Parcial |
|---|--------|-----------|---------|
| FReq-01 | Auth | Como cajero, quiero iniciar sesión con usuario y contraseña. | Puntos 1–6 |
| FReq-02 | Auth | Como cajero, quiero que mi sesión persista hasta cerrar sesión. | Punto 10 |
| FReq-03 | Auth | Como sistema, quiero proteger todas las rutas excepto /login. | Punto 6 |
| FReq-04 | Productos | Como cajero, quiero ver la lista de productos con búsqueda y filtros. | Puntos 7–9, 28–31 |
| FReq-05 | Productos | Como admin, quiero crear, editar y eliminar productos. | Puntos 12–23 |
| FReq-06 | Productos | Como usuario, quiero paginar los resultados de productos. | Puntos 32–34 |
| FReq-07 | Clientes | Como cajero, quiero gestionar el CRUD completo de clientes. | — |
| FReq-08 | Cobros | Como cajero, quiero registrar cobros asociados a clientes. | — |
| FReq-09 | Créditos | Como admin, quiero asignar y consultar créditos de clientes. | — |
| FReq-10 | POS | Como cajero, quiero abrir una sesión de caja y registrar ventas. | Workshop |
| FReq-11 | POS | Como cajero, quiero agregar productos al carrito y procesar el pago. | Workshop |
| FReq-12 | POS | Como cajero, quiero generar y visualizar el ticket de cada venta. | Workshop |
| FReq-13 | Stats | Como gerente, quiero ver métricas del inventario en un dashboard. | — |
| FReq-14 | UX | Como usuario, quiero ver indicadores de carga y mensajes de error claros. | Bonificación |
