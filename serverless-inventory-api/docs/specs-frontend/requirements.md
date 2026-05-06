# Documento de Requisitos — POS Frontend

## Introducción

Aplicación frontend para el sistema de gestión de inventario y punto de venta. Consume la **Serverless Inventory API** (backend AWS SAM) y provee una interfaz de cajero para autenticación, gestión de productos, clientes, cobros, créditos y operaciones POS en caja.

Cubre los requisitos del **Workshop SDD con Kiro AWS** y el **Parcial Práctico de Frontend**.

**Stack:** React 18 + TypeScript + Vite + Tailwind CSS

---

## Módulos del Sistema

- Autenticación JWT (login, logout, protección de rutas)
- Gestión de Productos (CRUD + búsqueda + filtros + paginación)
- Gestión de Clientes (CRUD)
- Cobros y Créditos
- POS — Punto de Venta (sesiones de caja, carrito, checkout, recibo)
- Dashboard de Estadísticas

---

## Índice de Documentos

| Archivo | Contenido |
|---------|-----------|
| [01-autenticacion.md](requirements/01-autenticacion.md) | Login, JWT, protección de rutas |
| [02-productos.md](requirements/02-productos.md) | CRUD, búsqueda, filtros, paginación |
| [03-clientes.md](requirements/03-clientes.md) | CRUD de clientes |
| [04-cobros-creditos.md](requirements/04-cobros-creditos.md) | Registro de cobros y créditos |
| [05-pos.md](requirements/05-pos.md) | Sesiones de caja, carrito, checkout, recibo |
| [06-estadisticas.md](requirements/06-estadisticas.md) | Dashboard de métricas |
| [07-ux-transversal.md](requirements/07-ux-transversal.md) | Validaciones, loaders, mensajes de error, offline |

---

## Resumen de Requisitos

| # | Módulo | User Story |
|---|--------|-----------|
| Req-01 | Auth | Como cajero, quiero iniciar sesión con usuario y contraseña para obtener acceso al sistema. |
| Req-02 | Auth | Como cajero, quiero que mi sesión persista hasta que cierre sesión manualmente. |
| Req-03 | Auth | Como sistema, quiero proteger todas las rutas excepto /login. |
| Req-04 | Productos | Como cajero, quiero ver la lista de productos con búsqueda y filtros. |
| Req-05 | Productos | Como admin, quiero crear, editar y eliminar productos desde la interfaz. |
| Req-06 | Productos | Como usuario, quiero paginar los resultados de productos. |
| Req-07 | Clientes | Como cajero, quiero gestionar el CRUD completo de clientes. |
| Req-08 | Cobros | Como cajero, quiero registrar cobros asociados a clientes y productos. |
| Req-09 | Créditos | Como admin, quiero asignar y consultar créditos de clientes. |
| Req-10 | POS | Como cajero, quiero abrir una sesión de caja y registrar ventas. |
| Req-11 | POS | Como cajero, quiero agregar productos al carrito y procesar el pago. |
| Req-12 | POS | Como cajero, quiero generar y visualizar el ticket de cada venta. |
| Req-13 | Stats | Como gerente, quiero ver métricas del inventario en un dashboard. |
| Req-14 | UX | Como usuario, quiero ver indicadores de carga y mensajes de error claros. |
