# Correctness Properties

*A property is a characteristic or behavior that must hold in all valid executions of the system. They serve as a bridge between human-readable specifications and machine-verifiable correctness guarantees.*

---

| # | Property | Validates Requirements |
|---|----------|----------------------|
| P-01 | Active product filtering | 2.1, 2.5 |
| P-02 | Exact category filtering | 2.2, 2.3 |
| P-03 | Complete serialized product structure | 2.4 |
| P-04 | System version reflection | 1.4 |
| P-05 | Invalid input rejection | 3.2–3.5, 6.2, 6.3, 8.2, 8.4 |
| P-06 | Generated identifier uniqueness | 3.7 |
| P-07 | Preservation of non-updated fields | 4.4 |
| P-08 | Logical deletion preserves record | 5.3, 6.9 |
| P-09 | Customer email uniqueness | 6.4 |
| P-10 | Correct charge/sale total calculation | 7.7, 11.6, 11.10 |
| P-11 | Insufficient stock rejection | 7.5, 11.9 |
| P-12 | Atomic stock decrement post-charge/sale | 7.6, 11.11 |
| P-13 | Credit balance never negative | 8.6, 8.7 |
| P-14 | Inventory statistics correctness | 9.1–9.5 |
| P-15 | Error response structure | 10.1 |
| P-16 | Open session uniqueness per cashier | 11.2 |
| P-17 | Cash session state transition | 11.3, 11.5 |
| P-18 | Sale rejection in closed session | 11.8 |
| P-19 | Generated ticket completeness | 11.12 |
| P-20 | Ticket query round-trip | 11.13 |
| P-21 | Ascending sale order by session | 11.15, 11.16 |
| P-22 | Payment method validation | 11.7 |

---

## Property Details

### P-01: Active product filtering
*For any* collection of products (mix of active and inactive), GET `/products` must return only those with `active = true`.

### P-02: Exact category filtering
*For any* category and product collection, GET `/products?category={X}` returns only exact matches. If none match → empty array.

### P-03: Complete serialized product structure
*For any* active product, its JSON must contain exactly: `id`, `name`, `category`, `price`, `stock`, `createdAt`.

### P-04: System version reflection
*For any* value in `APP_VERSION`, the `/health` response must contain that same value in the `version` field.

### P-05: Invalid input rejection
*For any* request that omits a required field or includes an out-of-range value (price ≤ 0, negative stock, amount ≤ 0, invalid email) → HTTP 400, without creating or modifying the resource.

### P-06: Generated identifier uniqueness
*For any* set of created resources, all assigned `id` values must be distinct from each other.

### P-07: Preservation of non-updated fields
*For any* PUT with a subset of fields, fields not included retain exactly their previous values.

### P-08: Logical deletion preserves record
*For any* DELETE, the record persists in DynamoDB with `active = false` and does not appear in active listings.

### P-09: Customer email uniqueness
*For any* already registered email, a new customer with that email → HTTP 409, without creating a duplicate.

### P-10: Correct charge/sale total calculation
`subtotal = Σ(unitPrice × quantity)`. If `applyCredit = true`: `total = subtotal - min(availableBalance, subtotal)`.

### P-11: Insufficient stock rejection
*For any* charge/sale where `quantity > stock` for at least one product → HTTP 409, without modifying stock or creating the record.

### P-12: Atomic stock decrement post-charge/sale
*For any* successful charge/sale: `new_stock = previous_stock - quantity` for each included product.

### P-13: Credit balance never negative
*For any* sequence of assignments and applications, the resulting balance is always `>= 0`. If the amount to apply exceeds the balance, only the available balance is applied.

### P-14: Inventory statistics correctness
- `totalProducts` = count of products with `active = true`
- `totalStock` = Σ `stock` of active products
- `distributionByCategory` = map category → count of active products
- `lowStockProducts` = active products with `stock < 5`

### P-15: Error response structure
*For any* error (400, 401, 404, 405, 409, 500), the response is JSON with `error` (string) and `code` (string), with `Content-Type: application/json` header.

### P-16: Open session uniqueness per cashier
*For any* cashier with an `"open"` session, opening another → HTTP 409, without creating a second session.

### P-17: Cash session state transition
`"open"` session → close changes status to `"closed"` and records `closedAt`. `"closed"` session → close again → HTTP 409.

### P-18: Sale rejection in closed session
*For any* `"closed"` session, registering a sale → HTTP 409, without creating the record.

### P-19: Generated ticket completeness
*For any* successful sale, the ticket contains: `saleId`, `sessionId`, `cashierId`, `customerId`, `items` (with `name`, `quantity`, `unitPrice`), `subtotal`, `appliedCredit`, `total`, `paymentMethod`, `saleDate`.

### P-20: Ticket query round-trip
*For any* successful sale, GET `/pos/sales/{saleId}/ticket` returns the same data generated at the time of sale registration.

### P-21: Ascending sale order by session
*For any* session with sales, GET `/pos/sessions/{sessionId}/sales` returns sales ordered ascending by `saleDate`.

### P-22: Payment method validation
*For any* POS sale request where `paymentMethod` is not `"cash"`, `"card"`, or `"credit"` → HTTP 400, without creating the record.
