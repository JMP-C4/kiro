# Requirements Document — Serverless Inventory API

## Introduction

Serverless REST API for startup inventory management, built on AWS SAM. Exposes HTTP endpoints via API Gateway, executes business logic in AWS Lambda (Node.js 20.x), and follows hexagonal architecture with SOLID principles.

**System Modules:**
- System health monitoring (Health Check)
- Product management (CRUD + inventory)
- Customer management
- Billing and charges system
- Customer credits system
- Statistics and metrics
- POS Module (Point of Sale): cash sessions, in-person sales, tickets, multiple payment methods

---

## Document Index

| File | Content |
|------|---------|
| [01-glossary.md](requirements/01-glossary.md) | Domain term definitions |
| [02-module-products.md](requirements/02-module-products.md) | Req. 1–5: Health Check and Products CRUD |
| [03-module-customers.md](requirements/03-module-customers.md) | Req. 6: Customer Management |
| [04-module-charges-credits.md](requirements/04-module-charges-credits.md) | Req. 7–8: Charges and Credits |
| [05-module-pos.md](requirements/05-module-pos.md) | Req. 9–11: Stats, Errors and POS |
| [06-functional-requirements.md](requirements/06-functional-requirements.md) | FR-01 to FR-16 table |
| [07-non-functional-requirements.md](requirements/07-non-functional-requirements.md) | NFR: Performance, Security, Scalability, Observability |

---

## Requirements Summary

| # | Module | User Story |
|---|--------|-----------|
| Req-01 | Health | As an operator, I want to check the API status to verify it is operational. |
| Req-02 | Products | As a user, I want to list products with category filtering. |
| Req-03 | Products | As an admin, I want to register new products with validations. |
| Req-04 | Products | As an admin, I want to update existing product data. |
| Req-05 | Products | As an admin, I want to delete products from the catalog. |
| Req-06 | Customers | As an admin, I want to manage the full CRUD of customers. |
| Req-07 | Charges | As a cashier, I want to register charges with automatic stock deduction. |
| Req-08 | Credits | As a financial admin, I want to manage credits applicable to charges. |
| Req-09 | Stats | As a manager, I want to query inventory metrics. |
| Req-10 | Errors | As a consumer, I want consistent error responses. |
| Req-11 | POS | As a cashier, I want to manage cash sessions and in-person sales. |
