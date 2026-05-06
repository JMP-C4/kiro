# Documento de Diseño Técnico — Serverless Inventory API

## Visión General

Sistema de gestión de inventario y punto de venta sobre AWS SAM. Arquitectura hexagonal con principios SOLID, separando dominio, aplicación e infraestructura. Cada módulo funcional es una Lambda independiente con responsabilidad única.

**Stack:** API Gateway → Lambda (Node.js 20.x) → DynamoDB

---

## Índice de Documentos

| Archivo | Contenido |
|---------|-----------|
| [01-arquitectura.md](design/01-arquitectura.md) | Diagrama AWS, flujo HTTP, ciclo de vida del dato |
| [02-estructura-proyecto.md](design/02-estructura-proyecto.md) | Árbol de carpetas del proyecto SAM |
| [03-endpoints-hexagonal.md](design/03-endpoints-hexagonal.md) | Mapeo de endpoints, Ports & Adapters, validación por capas |
| [04-modelos-datos.md](design/04-modelos-datos.md) | Entidades de dominio y tablas DynamoDB con GSIs |
| [05-propiedades-correccion.md](design/05-propiedades-correccion.md) | 22 propiedades formales de corrección (PBT) |
| [06-manejo-errores.md](design/06-manejo-errores.md) | Jerarquía de errores, middleware, tabla de códigos |
| [07-estrategia-testing.md](design/07-estrategia-testing.md) | Jest + fast-check, arbitrarios, cobertura por módulo |

---

## Resumen de Decisiones de Diseño

| Decisión | Elección | Razón |
|----------|----------|-------|
| Runtime | Node.js 20.x | LTS activo, cold starts bajos |
| Persistencia | DynamoDB on-demand | Escalabilidad automática, sin gestión de capacidad |
| Autenticación | Lambda Authorizer + JWT | Desacoplado de la lógica de negocio |
| Arquitectura | Hexagonal (Ports & Adapters) | Testabilidad, intercambiabilidad de adapters |
| PBT | fast-check | Madurez, integración con Jest, generadores potentes |
| IaC | AWS SAM | Nativo para Lambda, simplifica despliegue |

---

## Módulos y Lambdas

| Lambda | Endpoints | Tablas DynamoDB |
|--------|-----------|-----------------|
| HealthCheckFunction | GET /health | — |
| ProductosFunction | GET/POST/PUT/DELETE /productos | Productos |
| ClientesFunction | GET/POST/PUT/DELETE /clientes | Clientes |
| CobrosFunction | POST/GET /cobros | Cobros, Productos, Creditos |
| CreditosFunction | POST/GET /creditos | Creditos, Clientes |
| StatsFunction | GET /stats | Productos |
| POSFunction | POST/PUT/GET /pos/* | POS_Sesiones, POS_Ventas, Productos, Creditos |
