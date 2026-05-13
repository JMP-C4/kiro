# Implementation Plan: Serverless Inventory API + POS Frontend

## Overview

Complete project organized in two parts:

- **Part A — Backend:** Serverless REST API on AWS SAM with hexagonal architecture (6 phases)
- **Part B — Frontend:** React 18 + TypeScript SPA consuming the backend (5 phases)

**Convention:** Tasks with `*` are optional (tests). Tasks with `[x]` are completed.

---

# PART A — Backend: Serverless Inventory API

**Stack:** Node.js 20.x · AWS SAM · API Gateway · DynamoDB · Jest · fast-check

---

## Phase 1 — Setup: Project Initialization

- [x] 1.1 Initialize SAM project and configure root `package.json`
  - Create `package.json` with scripts: `test`, `test:unit`, `test:integration`, `lint`
  - Install dependencies: `@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`, `uuid`
  - Install devDependencies: `jest`, `fast-check`, `aws-sdk-client-mock`, `eslint`
  - Configure `jest.config.js` with `testEnvironment: node`, `coverageThreshold: 80%`

- [x] 1.2 Create project folder structure
  - Directories: `src/shared/`, `src/health/`, `src/products/`, `src/customers/`, `src/charges/`, `src/credits/`, `src/stats/`, `src/pos/`
  - Subdirectories per module: `domain/`, `application/ports/`, `application/use-cases/`, `infrastructure/`
  - Create `tests/unit/`, `tests/integration/api/`, `tests/arbitraries/`

- [x] 1.3 Implement shared utilities — Domain errors
  - Create `src/shared/domain/errors/DomainError.js` with base class
  - Create `NotFoundError.js` (HTTP 404, code `NOT_FOUND`)
  - Create `ValidationError.js` (HTTP 400, code `VALIDATION_ERROR`)
  - Create `ConflictError.js` (HTTP 409, code `CONFLICT`)

- [x] 1.4 Implement shared utilities — Infrastructure and middleware
  - Create `src/shared/domain/value-objects/UniqueId.js` using `uuid` v4
  - Create `src/shared/infrastructure/DynamoDBClient.js` as singleton
  - Create `src/shared/infrastructure/ResponseBuilder.js` with `ok`, `created`, `noContent`, `error` methods
  - Create `src/shared/middleware/errorHandler.js`
  - Create `src/shared/middleware/correlationId.js`

- [ ]* 1.5 Write unit tests for shared utilities
- [ ]* 1.6 Write property test P-15 — Error response structure
- [ ] 1.7 Checkpoint — Verify initial setup

---

## Phase 2 — Core Domain: Entities and Ports

- [ ] 2.1 Implement `Product` domain entity
- [ ]* 2.2 Write unit tests for `Product` entity
- [ ]* 2.3 Write property test P-05 (partial) — Invalid input rejection
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
- [ ] 4.4 Implement Products use cases (List, Create, Update, Delete)
- [ ] 4.5 Implement Products handler
- [ ]* 4.6 Write unit tests for Products use cases
- [ ]* 4.7 Write property tests P-01, P-02, P-03
- [ ]* 4.8 Write property tests P-06, P-07, P-08

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
- [ ]* 5.3 Write property test P-11 (POS) — Insufficient stock in sales
- [ ]* 5.4 Write property test P-12 (POS) — Atomic stock decrement
- [ ]* 5.5 Verify test coverage by module (≥ 80%)
- [ ] 5.6 Checkpoint — Verify coverage and properties

---

## Phase 6 — IaC & Deploy: SAM Template and CI/CD

- [ ] 6.1 Create `template.yaml` — Global resources and DynamoDB tables (6 tables with GSIs)
- [ ] 6.2 Create `template.yaml` — API Gateway and JWT Lambda Authorizer
- [ ] 6.3 Create `template.yaml` — 7 Lambda functions with minimum IAM policies
- [ ] 6.4 Create `samconfig.toml` with environment configuration (dev/staging/prod)
- [ ] 6.5 Create `template.yaml` — Outputs and parameters
- [ ]* 6.6 Create basic CI/CD script (GitHub Actions)
- [ ] 6.7 Final checkpoint — `sam validate` + `sam build` + `npm test`

---

# PART B — Frontend: POS Frontend

**Stack:** React 18 · TypeScript · Vite · Tailwind CSS · React Query · Axios

**Exam Levels:**
- **Basic (3.0):** Phases F1 and F2 — login + product listing + token management
- **Intermediate (4.0):** Phases F1, F2 and F3 — + full CRUD for products and customers
- **Advanced (5.0):** All phases — + POS + stats + validations + pagination
- **Bonus (+0.5):** Consistent Tailwind styles + spinners/skeletons + reusable components

---

## Phase F1 — Setup and Authentication (Basic — Exam Points 1–6)

- [ ] F1.1 Initialize project with Vite + React + TypeScript
  - Run `npm create vite@latest pos-frontend -- --template react-ts`
  - Install: `axios`, `react-router-dom`, `@tanstack/react-query`, `react-hook-form`, `zod`, `recharts`
  - Configure Tailwind CSS with `npx tailwindcss init -p`
  - Configure `VITE_API_URL` environment variable pointing to SAM backend

- [ ] F1.2 Implement HTTP client with JWT interceptors
  - Create `src/api/client.ts` with Axios instance and `baseURL = import.meta.env.VITE_API_URL`
  - Request interceptor: inject `Authorization: Bearer <token>` from `localStorage`
  - Response interceptor: capture 401 → delete token → redirect to `/login`

- [ ] F1.3 Implement AuthContext and useAuth hook
  - Create `src/context/AuthContext.tsx` with state `token`, `user`, `login()`, `logout()`
  - `login()` consumes `POST /auth`, stores token in `localStorage`
  - `logout()` deletes token and redirects to `/login`

- [ ] F1.4 Implement Login screen
  - Form with `username`, `password` fields and `"Sign in"` button
  - Show error if backend returns 401 (`"Invalid credentials"`) or 403 (`"Inactive user"`)
  - Spinner on button while request is in progress
  - Redirect to `/products` after successful login

- [ ] F1.5 Implement ProtectedRoute and main Router
  - `ProtectedRoute.tsx`: redirects to `/login` if no token
  - `App.tsx` with React Router v6: public routes (`/login`) and protected (rest)
  - Redirect `/login` → `/products` if user is already authenticated

---

## Phase F2 — Layout and Product Listing (Basic — Exam Points 7–11)

- [ ] F2.1 Implement main layout with navigation
  - `Sidebar.tsx` with links to: Products, Customers, Charges, Credits, POS, Stats
  - `Header.tsx` with username and `"Sign out"` button
  - Base UI components: `Button.tsx`, `Input.tsx`, `Spinner.tsx`, `Table.tsx`

- [ ] F2.2 Implement Products API and hook
  - `src/api/products.api.ts`: `getProducts(filters)`, `createProduct()`, `updateProduct()`, `deleteProduct()`
  - `src/hooks/useProducts.ts` with React Query

- [ ] F2.3 Implement Products page — Listing
  - Table with: `name`, `category`, `price`, `stock`
  - Skeleton loader while loading
  - Message `"No products found"` if list is empty
  - `Authorization: Bearer <token>` header in every request

- [ ] F2.4 Implement search and category filter
  - Search field by name (local filter or `GET /products?name=...`)
  - Category select consuming `GET /products?category={value}`
  - Combine both filters simultaneously

- [ ] F2.5 Implement pagination
  - `"Previous"` / `"Next"` controls and page numbers
  - Consume endpoint with `page` and `limit` query params
  - Show `"Page {n} of {total} — {count} products"`

---

## Phase F3 — Full CRUD (Intermediate — Exam Points 12–23)

- [ ] F3.1 Implement Product form (create/edit)
  - `ProductForm.tsx` with React Hook Form + Zod
  - Validate: `name` not empty, `category` not empty, `price > 0`, `stock >= 0`
  - Validation messages next to each invalid field

- [ ] F3.2 Implement create and edit Product
  - `"New product"` button → modal with `ProductForm`
  - `"Edit"` button → loads current data in modal
  - Auto-update list after create/edit (React Query invalidation)
  - Success toast: `"Product created"` / `"Product updated"`

- [ ] F3.3 Implement delete Product
  - `"Delete"` button with confirmation (modal or `confirm()`)
  - Consume `DELETE /products/{id}` and remove from list without reload

- [ ] F3.4 Implement Customers CRUD
  - `customers.api.ts`, `useCustomers.ts`, `Customers.tsx`, `CustomerForm.tsx`
  - Email validation, handle 409 error (duplicate email)

- [ ] F3.5 Implement Charges
  - `charges.api.ts`, `useCharges.ts`, `Charges.tsx`
  - Handle 409 insufficient stock error

- [ ] F3.6 Implement Credits
  - `credits.api.ts`, `useCredits.ts`, `CreditForm.tsx`
  - Show credit balance in customer profile

---

## Phase F4 — POS Module (Advanced — Workshop)

- [ ] F4.1 Implement CartContext and cart logic
  - State: `items`, `customerId`, `sessionId`, `paymentMethod`
  - Actions: `addItem()`, `removeItem()`, `updateQuantity()`, `clearCart()`
  - Real-time calculation: `subtotal`, `appliedCredit`, `total`

- [ ] F4.2 Implement cash session opening
  - `OpenSession.tsx` with `initialAmount` form
  - Check active session when loading POS module
  - Consume `POST /pos/sessions`

- [ ] F4.3 Implement sale screen (cart)
  - `Cart.tsx` with product search and cart list
  - Real-time totals when adding/modifying items
  - Payment method selector: Cash, Card, Credit
  - Show available credit balance when `"Credit"` is selected

- [ ] F4.4 Implement checkout and ticket generation
  - Consume `POST /pos/sales` when clicking `"Charge"`
  - Handle 409 insufficient stock error with per-product message
  - `Ticket.tsx` with all ticket fields
  - `"Print"` button with `window.print()` and print styles

- [ ] F4.5 Implement cash session closing and history
  - Session summary when closing (total sales, final amount)
  - Consume `PUT /pos/sessions/{sessionId}/close`
  - Sales history with `GET /pos/sessions/{sessionId}/sales`

---

## Phase F5 — Dashboard, Validations and Polish (Advanced — Bonus)

- [ ] F5.1 Implement Statistics Dashboard
  - `Stats.tsx` with metrics: `totalProducts`, `totalStock`
  - Bar chart with Recharts for `distributionByCategory`
  - Alert list for `lowStockProducts`

- [ ] F5.2 Implement Toast notification system
  - `Toast.tsx` for success and error notifications
  - Integrate in all CRUD and POS operations

- [ ] F5.3 Implement global error handling
  - Capture network errors (no connection) with appropriate message
  - Capture 500 errors with generic message
  - Skeleton loaders in all sections during loading

- [ ] F5.4 Final polish and responsive
  - Verify functionality on 1024px+ screens
  - Visual consistency with Tailwind across all modules
  - Loading indicators on all submit buttons
  - Full flow: login → products → POS → ticket → logout

---

## General Notes

- Tasks with `*` are optional — can be skipped for a faster MVP
- Tasks with `[x]` are completed and verified
- Backend PBT tests validate all 22 correctness properties from the design
- Frontend covers exam points 1–34 and the complete SDD Workshop


---

# POS Frontend — Implementation Plan

> Covers the **SDD Workshop with Kiro AWS** and the **Frontend Practical Exam** requirements.
> Consumes the Serverless Inventory API built in the previous phases.
>
> **Stack:** React 18 · TypeScript · Vite · Tailwind CSS · React Query · Axios
>
> | Level | Grade | Scope |
> |-------|-------|-------|
> | Basic | 3.0 | Phases FE-1 and FE-2 (login + product listing) |
> | Intermediate | 4.0 | Phases FE-1, FE-2 and FE-3 (+ full CRUD) |
> | Advanced | 5.0 | All phases (+ POS + stats + pagination) |
> | Bonus | +0.5 | Consistent Tailwind styles, spinners, reusable components |

---

## Phase FE-1 — Setup and Authentication (Basic)

- [ ] FE-1.1 Initialize project with Vite + React + TypeScript
- [ ] FE-1.2 Implement HTTP client with JWT interceptors
- [ ] FE-1.3 Implement AuthContext and useAuth hook
- [ ] FE-1.4 Implement Login screen
- [ ] FE-1.5 Implement ProtectedRoute and main Router

## Phase FE-2 — Layout and Product Listing (Basic)

- [ ] FE-2.1 Implement main layout with navigation
- [ ] FE-2.2 Implement Products API and hook
- [ ] FE-2.3 Implement Products page — Listing
- [ ] FE-2.4 Implement search and category filter
- [ ] FE-2.5 Implement pagination

## Phase FE-3 — Full CRUD (Intermediate)

- [ ] FE-3.1 Implement Product form (create/edit) with React Hook Form + Zod
- [ ] FE-3.2 Implement create and edit Product
- [ ] FE-3.3 Implement delete Product
- [ ] FE-3.4 Implement Customers CRUD
- [ ] FE-3.5 Implement Charges
- [ ] FE-3.6 Implement Credits

## Phase FE-4 — POS Module (Advanced)

- [ ] FE-4.1 Implement CartContext and cart logic
- [ ] FE-4.2 Implement cash session opening
- [ ] FE-4.3 Implement sale screen (cart)
- [ ] FE-4.4 Implement checkout and ticket generation
- [ ] FE-4.5 Implement cash session closing and history

## Phase FE-5 — Dashboard, Validations and Polish (Advanced)

- [ ] FE-5.1 Implement Statistics Dashboard
- [ ] FE-5.2 Implement Toast notification system
- [ ] FE-5.3 Implement global error handling
- [ ] FE-5.4 Final polish and responsive
