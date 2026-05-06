# Module: POS (Point of Sale)

## Requirement 9 — Inventory Statistics

**User Story:** As an operations manager, I want to query metrics about total stock and distribution by categories, to make informed inventory decisions.

### Acceptance Criteria

1. WHEN a GET request is received at `/stats`, THE Stats_Engine SHALL return HTTP 200 with a JSON object containing: `totalProducts`, `totalStock`, `distributionByCategory`, and `lowStockProducts`.
2. THE Stats_Engine SHALL calculate `totalStock` as the sum of `stock` values of all active products.
3. THE Stats_Engine SHALL calculate `distributionByCategory` as an object where each key is a category name and its value is the count of active products in that category.
4. THE Stats_Engine SHALL include in `lowStockProducts` all active products whose `stock` is less than 5 units.
5. WHEN the inventory contains no active products, THE Stats_Engine SHALL return `totalProducts` with value 0, `totalStock` with value 0, `distributionByCategory` as an empty object, and `lowStockProducts` as an empty array.

---

## Requirement 10 — Global Error Handling

**User Story:** As an API consumer, I want to receive consistent and descriptive error responses, to diagnose and fix issues in my integrations.

### Acceptance Criteria

1. THE API SHALL return all error responses in JSON format with the fields `error` (descriptive string) and `code` (error identifier string).
2. IF a request is received at an undefined route, THEN THE API SHALL return HTTP 404 with the message `"Route not found"`.
3. IF a request uses an HTTP method not allowed for an existing route, THEN THE API SHALL return HTTP 405 with the message `"Method not allowed"`.
4. IF a Lambda throws an unhandled exception, THEN THE API SHALL return HTTP 500 with the message `"Internal server error"` without exposing internal stack trace details.
5. THE API SHALL include in all responses the `Content-Type: application/json` header.
6. THE API SHALL include in all responses the necessary CORS headers to allow requests from origins configured in the `ALLOWED_ORIGINS` environment variable.

---

## Requirement 11 — POS Module (Point of Sale)

**User Story:** As a cashier, I want to manage cash sessions and register in-person sales with automatic stock deduction, to integrate the point of sale with inventory and the billing system.

### Cash Session

1. WHEN a POST request is received at `/pos/sessions` with the fields `cashierId` and `initialAmount` (number greater than or equal to 0), THE POS_Manager SHALL create a new cash session with status `"open"` and return HTTP 201 with the session object, including its generated `id` and `openedAt`.
2. IF a cash session with status `"open"` already exists for the same `cashierId`, THEN THE POS_Manager SHALL return HTTP 409 with the message `"An open cash session already exists for this cashier"`.
3. WHEN a PUT request is received at `/pos/sessions/{sessionId}/close` with the field `finalAmount` (number greater than or equal to 0), THE POS_Manager SHALL update the session status to `"closed"`, record the `closedAt`, and return HTTP 200 with the updated session object.
4. IF the `sessionId` does not correspond to any registered session, THEN THE POS_Manager SHALL return HTTP 404 with the message `"Cash session not found"`.
5. IF a close request is received for a session with status `"closed"`, THEN THE POS_Manager SHALL return HTTP 409 with the message `"Cash session is already closed"`.

### Point of Sale Transaction

6. WHEN a POST request is received at `/pos/sales` with a valid JSON body, THE POS_Manager SHALL register the sale, decrement the stock of involved products, and return HTTP 201 with the created sale object, including its generated `id` and the calculated `total`.
7. THE Validator SHALL verify that the sale request body contains the required fields: `sessionId` (non-empty string), `customerId` (non-empty string), `items` (non-empty array of objects with `productId` and `quantity`), and `paymentMethod` (one of: `"cash"`, `"card"`, or `"credit"`).
8. IF the `sessionId` corresponds to a session with status `"closed"`, THEN THE POS_Manager SHALL return HTTP 409 with the message `"Cannot register a sale in a closed session"`.
9. IF the requested `quantity` of any product exceeds the available `stock`, THEN THE POS_Manager SHALL return HTTP 409 with the message `"Insufficient stock for product: {productId}"`.
10. WHEN the `paymentMethod` field is `"credit"`, THE POS_Manager SHALL apply the customer's available credit balance to the sale total, following the same rules defined in Requirement 8.
11. WHEN a sale is successfully registered, THE Repository SHALL atomically decrement the `stock` of each included product by the indicated `quantity`.

### Ticket Generation

12. WHEN a sale is successfully registered, THE POS_Manager SHALL generate a ticket with the fields: `saleId`, `sessionId`, `cashierId`, `customerId`, `items` (with name, quantity, and unit price for each product), `subtotal`, `appliedCredit`, `total`, `paymentMethod`, and `saleDate`.
13. WHEN a GET request is received at `/pos/sales/{saleId}/ticket`, THE POS_Manager SHALL return HTTP 200 with the ticket object corresponding to that sale.
14. IF the `saleId` does not correspond to any registered sale, THEN THE POS_Manager SHALL return HTTP 404 with the message `"Sale not found"`.

### Sales History by Session

15. WHEN a GET request is received at `/pos/sessions/{sessionId}/sales`, THE POS_Manager SHALL return HTTP 200 with a JSON array of all sales registered in that session, ordered by `saleDate` ascending.
16. WHEN the `sessionId` exists but has no registered sales, THE POS_Manager SHALL return HTTP 200 with an empty array.
