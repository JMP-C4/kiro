# Implementation Plan — Supermarket POS System

## Overview

Incremental implementation of a supermarket POS system with two separate projects. The plan is organized into **8 phases** that progress from base infrastructure to deployment.

**Frontend:** React 18 · TypeScript · Vite · Tailwind CSS v4 · Glassmorphism
**Backend:** Node.js 20 · AWS Lambda · API Gateway · DynamoDB (JSON, non-relational) · JWT

---

## Phase 1 — Setup: Base Projects

- [x] 1.1 Initialize frontend project
  - Run `npm create vite@latest pos-frontend -- --template react-ts`
  - Install: `axios`, `react-router-dom`, `@tanstack/react-query`, `react-hook-form`, `zod`, `@hookform/resolvers`, `nanoid`
  - Install dev: `@tailwindcss/postcss`, `tailwindcss`
  - Create `.env` with `VITE_API_URL=http://localhost:8080`
  - Configure `index.css` with glassmorphism tokens and `@media print`
  - _Requirements: NFR-15, NFR-17_

- [-] 1.2 Initialize serverless backend project
  - Create `serverless-inventory-api/` with AWS SAM (`template.yaml`)
  - Define DynamoDB tables: `pos-users`, `pos-products`, `pos-sales`, `pos-configuration`
  - Configure JWT secret, CORS in Lambda environment variables
  - _Requirements: NFR-08, NFR-19_

- [x] 1.3 Create seed JSON — initial DynamoDB schema
  - Document schema in `docs/database/dynamodb-schema.md`
  - Create `db/dynamodb/seed/*.json`: users, products, configuration, sales
  - Script `serverless-inventory-api/scripts/seed.mjs` to load data
  - Sales: items embedded in JSON (`items[]`), no separate `sale_items` table
  - _Requirements: Req-9, Req-11_

- [-] 1.4 Configure base security
  - Create JWT middleware with public routes (`/auth/login`, `/health`) and protected routes
  - Create JWT service for token issuance and validation
  - Create JWT auth filter/middleware
  - Create role enum with values `CASHIER`, `SUPERVISOR`, `ADMIN`
  - _Requirements: FR-01, NFR-05, NFR-07_

---

## Phase 2 — Authentication

- [x] 2.1 Backend — Login endpoint
  - Create login handler with `POST /auth/login`
  - Validate credentials with bcrypt and issue JWT
  - JWT must include: `sub` (username), `rol`, `nombre`, `exp` (8 hours)
  - Create `GET /health` returning `{ status: "ok" }`
  - _Requirements: FR-01, NFR-05, NFR-06_

- [x] 2.2 Frontend — AuthContext and HTTP client
  - Create `AuthContext.tsx` with state `token`, `rol`, `nombre`, `login()`, `logout()`
  - Create `src/api/client.ts` with Axios instance and automatic JWT interceptor
  - Response interceptor: catches 401/403 → removes token → redirects to login
  - _Requirements: FR-02, FR-03, FR-05_

- [x] 2.3 Frontend — Login screen
  - Create `Login.tsx` with glassmorphism, `username` and `password` fields
  - Zod validation: required fields
  - Show error on 401 (invalid credentials) and 403 (inactive user)
  - On successful login → redirect to Dashboard (quick access to modules)
  - _Requirements: FR-01, NFR-15_

- [x] 2.4 Frontend — ProtectedRoute and Router
  - Create `ProtectedRoute.tsx` that verifies JWT and redirects to login if absent
  - Create `App.tsx` with routes: `/login` (public), `/pos`, `/products`, `/users`, `/reports`, `/configuration` (protected)
  - Role protection: `/users` ADMIN only, `/reports` SUPERVISOR+
  - _Requirements: FR-04, FR-05_

---

## Phase 3 — Backend Core: Products and Users

- [x] 3.1 Backend — Products CRUD
  - Create products handler with all fields from the schema
  - Implement repository with search queries by code and name
  - Create service with business logic and validations
  - Expose GET/POST/PUT/DELETE endpoints
  - Search: `GET /products?q=text` responds in maximum 300ms
  - _Requirements: FR-23, FR-24, FR-25, FR-26, NFR-01_

- [x] 3.2 Backend — Users CRUD
  - Create users handler with bcrypt password hashing
  - Implement repository
  - Create service — never return `password_hash`
  - Expose GET/POST/PUT/DELETE endpoints
  - Accessible only to ADMIN role
  - _Requirements: FR-27, FR-28, FR-29, FR-30, NFR-06, P-07_

- [x] 3.3 Backend — Global error handling
  - Return always `{ code, message, details }` on errors
  - Handle: 400 (validation), 401 (unauthenticated), 403 (unauthorized), 404 (not found), 409 (duplicate)
  - _Requirements: NFR-21_

---

## Phase 4 — Frontend: Base Components and POS Layout

- [x] 4.1 Base glassmorphism UI components
  - Create `GlassCard.tsx`, `GlassInput.tsx`, `GlassModal.tsx`
  - Create `ThemeToggle.tsx` with localStorage persistence
  - Create `Spinner.tsx` — `border-4 border-dashed rounded-full animate-spin`
  - _Requirements: NFR-15, NFR-16_

- [x] 4.2 Centralized keyboard shortcuts hook
  - Create `useKeyboardShortcuts.ts` with ONE single global event listener
  - Receives array of `{ key, action, disabled, description }`
  - Disables all shortcuts when `modalOpen=true`, except Esc
  - _Requirements: FR-06 through FR-20, NFR-11, NFR-13, P-11_

- [x] 4.3 Pure VAT logic
  - Create `src/lib/calculateTotals.ts` — pure function with no React dependencies
  - Implement: `calculateTotals(items, vatRate, discountPct): Totals`
  - Handle `includes_vat=true` (break out included VAT) and `includes_vat=false` (add VAT)
  - _Requirements: FR-21, FR-22, P-01, P-02, P-03_

- [x] 4.4 POS Layout — 12-column grid
  - Create `POS.tsx` with `grid grid-cols-12` layout
  - Left column (col-span-3): search bar + shortcuts panel
  - Center column (col-span-6): cart
  - Right column (col-span-3): summary + checkout button
  - Top bar with `KeyboardShortcutsBar` and `OverflowMenu`
  - _Requirements: NFR-12, NFR-17_

---

## Phase 5 — POS: Search and Cart

- [x] 5.1 ProductSearch component
  - Create `ProductSearch.tsx` — fieldset with hidden label, span with magnifier button
  - F1 places focus on the input
  - Enter searches and adds product (always new line)
  - Show dropdown with search results
  - Show "Product not found" if no results
  - _Requirements: FR-06, FR-07, P-05_

- [x] 5.2 Cart reducer — `usePOS`
  - Create `usePOS.ts` with `useReducer`
  - Actions: ADD_ITEM, REMOVE_ITEM, REMOVE_LAST, CLEAR_CART, SET_DISCOUNT, SET_PAYMENT_METHOD, SET_AMOUNT_PAID, SELECT_ITEM, MOVE_SELECTION, SET_MODAL
  - Each ADD_ITEM creates a new line with `nanoid()` — never accumulates
  - _Requirements: FR-07, FR-09, FR-10, P-05_

- [x] 5.3 CartList and CartItem components
  - Create `CartList.tsx` — `ul` with `space-y-2`
  - Create `CartItem.tsx` — `li flex items-start justify-between`
  - Left: name + quantity (`x3` in violet)
  - Right: subtotal + unit price (`@ $price`)
  - Selected item highlighted with violet border
  - ↑↓ navigation between items, Del removes selected
  - _Requirements: FR-19, NFR-14_

- [x] 5.4 CartSummary component
  - Create `CartSummary.tsx` with summary structure
  - Show: subtotal without VAT, 19% VAT, total with VAT
  - Automatic update on every cart change
  - "F6 — Checkout" button disabled if cart is empty
  - _Requirements: FR-21, FR-14_

- [x] 5.5 Weight modal for bulk products
  - Create `WeightModal.tsx` — opens automatically for `unit_of_measure` kg/g/lb
  - Numeric input with automatic focus
  - Shows price/unit and calculates subtotal in real time
  - Enter confirms, Esc cancels without adding to cart
  - _Requirements: FR-08_

---

## Phase 6 — POS: Payment and Receipt Modals

- [x] 6.1 VAT/Discount modal (F4)
  - Create `VATModal.tsx` — shows breakdown: subtotal, 19% VAT, total
  - Field for global discount (0-100%)
  - Validate discount is between 0 and 100
  - Recalculate totals on confirm using `calculateTotals`
  - _Requirements: FR-11, P-03_

- [x] 6.2 Payment Method modal (F5)
  - Create `PaymentModal.tsx` — Cash, Card, Transfer options
  - ↑↓ navigation, confirm with Enter
  - For Cash: received amount field → calculate change automatically
  - Disable confirm if received amount < total
  - _Requirements: FR-12, FR-13, P-04_

- [x] 6.3 Backend — Sales endpoint
  - Create sales handler
  - Calculate VAT in backend as well (validation)
  - Expose `POST /sales`
  - Generate unique `sale_number` (e.g. `SLE-20260525-0001`)
  - Return complete sale with generated number
  - _Requirements: FR-14, P-08_

- [x] 6.4 Receipt modal (F7)
  - Create `ReceiptModal.tsx` with all required fields
  - "Print" button → `window.print()` with configured format class
  - "Save PDF" button → `window.print()` (user selects PDF in dialog)
  - "New Sale" button (F8) → close modal + clear cart
  - `@media print` styles that hide everything except `#receipt-print`
  - _Requirements: FR-15, FR-16, FR-17, FR-18_

- [x] 6.5 F6 integration — Complete sale processing
  - On F6 press: validate cart is not empty and payment method is selected
  - Send `POST /sales` to backend
  - On success: open ReceiptModal with returned data
  - On error: show descriptive message, keep cart intact
  - _Requirements: FR-14, P-12_

- [x] 6.6 Overflow menu (M key)
  - Create `OverflowMenu.tsx` — glassmorphism dropdown
  - M key opens/closes the menu
  - Shows secondary shortcuts with description
  - ↑↓ navigation within the menu
  - _Requirements: FR-20_

---

## Phase 7 — Admin Modules

- [x] 7.1 Frontend — Products module (Admin/Supervisor)
  - Create `Products.tsx` with glassmorphism table + search bar
  - Admin: create, edit, deactivate buttons
  - Supervisor: read-only without edit buttons
  - Create `ProductForm.tsx` with React Hook Form + Zod
  - _Requirements: FR-23, FR-24, FR-25, FR-26_

- [x] 7.2 Frontend — Users module (Admin only)
  - Create `Users.tsx` with users table
  - Create creation/editing form with fields: first name, last name, username, password, role, status
  - Visible only to ADMIN role
  - _Requirements: FR-27, FR-28, FR-29, FR-30_

- [x] 7.3 Backend — Reports endpoint
  - Create reports handler with `GET /reports/sales?from=&to=`
  - Return: total sales count, total amount, breakdown by payment method, list of individual sales
  - Accessible only to SUPERVISOR and ADMIN
  - _Requirements: FR-31, FR-32_

- [x] 7.4 Frontend — Reports module (Supervisor/Admin)
  - Create `Reports.tsx` with filters: today, week, month, custom range
  - Show summary in glassmorphism bento cards
  - Individual sales table
  - Visible only to SUPERVISOR and ADMIN
  - _Requirements: FR-31, FR-32_

- [x] 7.5 Backend + Frontend — System configuration
  - Backend: `GET /configuration` and `PUT /configuration`
  - Frontend: `Configuration.tsx` with form for business name, VAT rate, paper format
  - On save: update configuration context in frontend
  - Visible only to ADMIN
  - _Requirements: FR-33, FR-34_

---

## Phase 8 — Testing and Polish

- [x] 8.1 Unit tests — VAT logic
  - Tests for `calculateTotals`: VAT included, VAT excluded, with discount, no items
  - Verify P-01, P-02, P-03, P-04
  - _Requirements: P-01, P-02, P-03, P-04_

- [x] 8.2 Unit tests — cart reducer
  - Tests for `usePOS`: ADD_ITEM always creates new line, REMOVE_LAST, CLEAR_CART
  - Verify P-05
  - _Requirements: P-05_

- [x] 8.3 Backend tests — authentication and authorization
  - Tests for login handler: valid login, invalid credentials, inactive user
  - Authorization tests: CASHIER cannot POST /products (P-06)
  - _Requirements: P-06, P-07, P-10_

- [x] 8.4 Backend tests — sales
  - Tests for sales handler: VAT calculation, unique sale number
  - Verify P-08, P-12
  - _Requirements: P-08, P-12_

- [x] 8.5 Keyboard shortcut verification
  - Verify F1-F9 work in less than 50ms (NFR-13)
  - Verify shortcuts are disabled with modal open (P-11)
  - Verify complete keyboard-only flow: search → add → pay → print
  - _Requirements: NFR-11, NFR-13, P-11_

- [x] 8.6 Print format verification
  - Test receipt in 80mm, 58mm and letter formats
  - Verify `@media print` correctly hides the interface
  - Verify PDF save
  - _Requirements: FR-15, FR-16, FR-17_

- [x] 8.7 Final checkpoint
  - Run complete frontend and backend test suite
  - Verify complete flow: login → POS → sale → receipt → new sale
  - Verify role-based access in all modules
  - Document start commands in each project's README

---

## Notes

- Backend and frontend are independent projects in separate folders
- Backend runs at `https://6ant23fjfk.execute-api.us-east-1.amazonaws.com` (production)
- Frontend runs at `http://pos-supermarket-frontend.s3-website-us-east-1.amazonaws.com` (production)
- VAT logic is calculated both in frontend (UX) and backend (validation)
- Keyboard shortcuts are centralized in `useKeyboardShortcuts` to avoid conflicts
- The receipt uses native `window.print()` — no external PDF libraries required
