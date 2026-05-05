# Documento de Requisitos — Serverless Inventory API

## Introducción

API REST serverless para gestión de inventario de una startup, construida sobre AWS SAM. Expone endpoints HTTP vía API Gateway, ejecuta lógica de negocio en AWS Lambda (Node.js 20.x) y sigue arquitectura hexagonal con principios SOLID.

**Módulos del sistema:**
- Monitoreo del estado (Health Check)
- Gestión de productos (CRUD + inventario)
- Gestión de clientes
- Sistema de cobros y facturación
- Sistema de créditos a clientes
- Estadísticas y métricas
- Módulo POS (Point of Sale): sesiones de caja, ventas, tickets, múltiples métodos de pago

---

## Índice de Documentos

| Archivo | Contenido |
|---------|-----------|
| [01-glosario.md](requirements/01-glosario.md) | Definición de términos del dominio |
| [02-modulo-productos.md](requirements/02-modulo-productos.md) | Req. 1–5: Health Check y CRUD de Productos |
| [03-modulo-clientes.md](requirements/03-modulo-clientes.md) | Req. 6: Gestión de Clientes |
| [04-modulo-cobros-creditos.md](requirements/04-modulo-cobros-creditos.md) | Req. 7–8: Cobros y Créditos |
| [05-modulo-pos.md](requirements/05-modulo-pos.md) | Req. 9–11: Stats, Errores y POS |
| [06-requisitos-funcionales.md](requirements/06-requisitos-funcionales.md) | Tabla RF-01 a RF-16 |
| [07-requisitos-no-funcionales.md](requirements/07-requisitos-no-funcionales.md) | RNF: Rendimiento, Seguridad, Escalabilidad, Observabilidad |

---

## Resumen de Requisitos

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
