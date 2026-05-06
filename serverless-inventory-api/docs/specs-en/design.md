# Technical Design Document — Serverless Inventory API

## Overview

Inventory management and point of sale system built on AWS SAM. Hexagonal architecture with SOLID principles, separating domain, application, and infrastructure. Each functional module is an independent Lambda with single responsibility.

**Stack:** API Gateway → Lambda (Node.js 20.x) → DynamoDB

---

## Document Index

| File | Content |
|------|---------|
| [01-architecture.md](design/01-architecture.md) | AWS diagram, HTTP flow, data lifecycle |
| [02-project-structure.md](design/02-project-structure.md) | SAM project folder tree |
| [03-endpoints-hexagonal.md](design/03-endpoints-hexagonal.md) | Endpoint mapping, Ports & Adapters, validation layers |
| [04-data-models.md](design/04-data-models.md) | Domain entities and DynamoDB tables with GSIs |
| [05-correctness-properties.md](design/05-correctness-properties.md) | 22 formal correctness properties (PBT) |
| [06-error-handling.md](design/06-error-handling.md) | Error hierarchy, middleware, error code table |
| [07-testing-strategy.md](design/07-testing-strategy.md) | Jest + fast-check, arbitraries, coverage by module |

---

## Design Decision Summary

| Decision | Choice | Reason |
|----------|--------|--------|
| Runtime | Node.js 20.x | Active LTS, low cold starts |
| Persistence | DynamoDB on-demand | Automatic scalability, no capacity management |
| Authentication | Lambda Authorizer + JWT | Decoupled from business logic |
| Architecture | Hexagonal (Ports & Adapters) | Testability, adapter interchangeability |
| PBT | fast-check | Maturity, Jest integration, powerful generators |
| IaC | AWS SAM | Native for Lambda, simplifies deployment |

---

## Modules and Lambdas

| Lambda | Endpoints | DynamoDB Tables |
|--------|-----------|-----------------|
| HealthCheckFunction | GET /health | — |
| ProductsFunction | GET/POST/PUT/DELETE /products | Products |
| CustomersFunction | GET/POST/PUT/DELETE /customers | Customers |
| ChargesFunction | POST/GET /charges | Charges, Products, Credits |
| CreditsFunction | POST/GET /credits | Credits, Customers |
| StatsFunction | GET /stats | Products |
| POSFunction | POST/PUT/GET /pos/* | POS_Sessions, POS_Sales, Products, Credits |
