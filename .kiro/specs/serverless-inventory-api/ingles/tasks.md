# Implementation Plan: Serverless Inventory API

## Overview

Incremental implementation of a serverless REST API on AWS SAM with hexagonal architecture. The plan is organized in **6 phases** progressing from base infrastructure to deployment, allowing review and validation between each task.

**Stack:** Node.js 20.x · AWS SAM · API Gateway · DynamoDB · Jest · fast-check

**Optional task convention:** Sub-tasks marked with `*` are tests (unit or PBT) and can be skipped for a faster MVP, but are recommended to achieve the minimum 80% coverage.

---

## Phase 1 — Setup: Project Initialization

- [ ] 1.1 Initialize SAM project and configure root `package.json`
  - Run `sam init` with `nodejs20.x` runtime and custom project structure
  - Create root `package.json` with scripts: `test`, `test:unit`, `test:integration`, `lint`
  - Install production dependencies: `@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`, `uuid`
  - Install dev dependencies: `jest`, `fast-check`, `aws-sdk-client-mock`, `eslint`
  - Configure `jest.config.js` with `testEnvironment: node`, `coverageThreshold: 80%`

- [ ] 1.2 Create project folder structure
  - Create full directory tree per `design/02-project-structure.md`
  - Directories: `src/shared/`, `src/health/`, `src/products/`, `src/customers/`, `src/charges/`, `src/credits/`, `src/stats/`, `src/pos/`
  - Subdirectories per module: `domain/`, `application/ports/`, `application/use-cases/`, `infrastructure/`
  - Create `tests/unit/`, `tests/integration/api/`, and `tests/arbitraries/`

- [ ] 1.3 Implement shared utilities — Domain errors
  - Create `src/shared/domain/errors/DomainError.js` with base class
  - Create `NotFoundError.js` (HTTP 404, code `NOT_FOUND`)
  - Create `ValidationError.js` (HTTP 400, code `VALIDATION_ERROR`)
  - Create `ConflictError.js` (HTTP 409, code `CONFLICT`)

- [ ] 1.4 Implement shared utilities — Infrastructure and middleware
  - Create `src/shared/domain/value-objects/UniqueId.js` using `uuid` v4
  - Create `src/shared/infrastructure/DynamoDBClient.js` as singleton
  - Create `src/shared/infrastructure/ResponseBuilder.js` with `ok`, `created`, `error` methods
  - Create `src/shared/middleware/errorHandler.js`
  - Create `src/shared/middleware/correlationId.js`

- [ ]* 1.5 Write unit tests for shared utilities
- [ ]* 1.6 Write property test P-15 — Error response structure
- [ ] 1.7 Checkpoint — Verify initial setup

---

## Phase 2 — Core Domain: Entities and Ports

- [ ] 2.1 Implement `Product` domain entity
- [ ]* 2.2 Write unit tests for `Product` entity
- [ ]* 2.3 Write property test P-05 (partial) — Invalid input rejection for Product
- [ ] 2.4 Implement `Customer` domain entity
- [ ]* 2.5 Write unit tests for `Customer` entity
- [ ] 2.6 Implement `Charge` and `Credit` domain entities
- [ ]* 2.7 Write unit tests for `Charge` and `Credit`
- [ ]* 2.8 Write property test P-13 — Credit balance never negative
- [ ] 2.9 Implement POS domain entities: `CashSession`, `Sale`, `Ticket`
- [ ]* 2.10 Write unit tests for POS entities
- [ ] 2.11 Implement Ports (interfaces) for all modules
- [ ] 2.12 Checkpoint — Verify domain and ports

---

## Phase 3 — Infrastructure: DynamoDB Adapters

- [ ] 3.1 Implement `DynamoProductRepository`
- [ ]* 3.2 Write unit tests for `DynamoProductRepository`
- [ ] 3.3 Implement `DynamoCustomerRepository`
- [ ]* 3.4 Write unit tests for `DynamoCustomerRepository`
- [ ] 3.5 Implement `DynamoChargeRepository`
- [ ] 3.6 Implement `DynamoCreditRepository`
- [ ]* 3.7 Write unit tests for `DynamoChargeRepository` and `DynamoCreditRepository`
- [ ] 3.8 Implement `DynamoSessionRepository` and `DynamoSaleRepository`
- [ ]* 3.9 Write unit tests for `DynamoSessionRepository` and `DynamoSaleRepository`
- [ ] 3.10 Checkpoint — Verify DynamoDB adapters

---

## Phase 4 — Lambda Handlers: Use Cases and Handlers

### Health Module
- [ ] 4.1 Implement Health Check handler
- [ ]* 4.2 Write unit tests for Health handler
- [ ]* 4.3 Write property test P-04 — System version reflection

### Products Module
- [ ] 4.4 Implement Products use cases
- [ ] 4.5 Implement Products handler
- [ ]* 4.6 Write unit tests for Products use cases
- [ ]* 4.7 Write property tests P-01, P-02, P-03 — Filtering and structure
- [ ]* 4.8 Write property tests P-06, P-07, P-08 — Uniqueness, preservation, logical deletion

### Customers Module
- [ ] 4.9 Implement Customers use cases
- [ ] 4.10 Implement Customers handler
- [ ]* 4.11 Write unit tests for Customers use cases
- [ ]* 4.12 Write property tests P-09 and P-08 (Customers)

### Charges Module
- [ ] 4.13 Implement `RegisterCharge` use case
- [ ] 4.14 Implement `GetCharge` use case and Charges handler
- [ ]* 4.15 Write unit tests for Charges use cases
- [ ]* 4.16 Write property tests P-10, P-11, P-12

### Credits Module
- [ ] 4.17 Implement Credits use cases and handler
- [ ]* 4.18 Write unit tests for Credits use cases

### Stats Module
- [ ] 4.19 Implement `GetStatistics` use case and handler
- [ ]* 4.20 Write unit tests for `GetStatistics`
- [ ]* 4.21 Write property test P-14 — Statistics correctness

### POS Module
- [ ] 4.22 Implement `OpenSession` and `CloseSession` use cases
- [ ]* 4.23 Write unit tests for `OpenSession` and `CloseSession`
- [ ]* 4.24 Write property tests P-16 and P-17
- [ ] 4.25 Implement `RegisterSale` use case
- [ ]* 4.26 Write unit tests for `RegisterSale`
- [ ]* 4.27 Write property tests P-18, P-22, P-10 (POS)
- [ ] 4.28 Implement `GetTicket` and `ListSalesBySession` use cases
- [ ]* 4.29 Write unit tests for `GetTicket` and `ListSalesBySession`
- [ ]* 4.30 Write property tests P-19, P-20, P-21
- [ ] 4.31 Implement POS handler
- [ ] 4.32 Checkpoint — Verify all handlers and use cases

---

## Phase 5 — Testing: Arbitraries and Integration Tests

- [ ] 5.1 Create shared fast-check arbitraries
- [ ]* 5.2 Write property test P-05 — Invalid input rejection (global coverage)
- [ ]* 5.3 Write property test P-11 (POS) — Insufficient stock rejection in sales
- [ ]* 5.4 Write property test P-12 (POS) — Atomic stock decrement post-sale
- [ ]* 5.5 Verify test coverage by module (≥ 80%)
- [ ] 5.6 Checkpoint — Verify coverage and properties

---

## Phase 6 — IaC & Deploy: SAM Template and CI/CD

- [ ] 6.1 Create `template.yaml` — Global resources and DynamoDB tables
- [ ] 6.2 Create `template.yaml` — API Gateway and Lambda Authorizer
- [ ] 6.3 Create `template.yaml` — Lambda functions
- [ ] 6.4 Create `samconfig.toml` with environment configuration
- [ ] 6.5 Create `template.yaml` — Outputs and parameters
- [ ]* 6.6 Create basic CI/CD script
- [ ] 6.7 Final checkpoint — Verify SAM template and deployment

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for full traceability
- Checkpoints at the end of each phase ensure incremental validation
- PBT tests validate all 22 correctness properties defined in `design/05-correctness-properties.md`
- Dependency injection (ports) allows mocking repositories in all tests without real DynamoDB
