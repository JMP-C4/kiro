# Module: Charges and Credits

## Requirement 7 — Charges System

**User Story:** As a cashier, I want to register charges associated with customers and products, to keep track of sales transactions.

### Acceptance Criteria

1. WHEN a POST request is received at `/charges` with a valid JSON body, THE API SHALL register the charge and return HTTP 201 with the created charge object, including its generated `id` and the calculated `total`.
2. THE Validator SHALL verify that the request body contains the required fields: `customerId` (non-empty string) and `items` (non-empty array of objects with `productId` and `quantity`).
3. IF the `customerId` does not correspond to any active customer, THEN THE API SHALL return HTTP 404 with the message `"Customer not found"`.
4. IF any `productId` within `items` does not correspond to any active product, THEN THE API SHALL return HTTP 404 with the message `"Product not found: {productId}"`.
5. IF the requested `quantity` of a product exceeds the available `stock`, THEN THE API SHALL return HTTP 409 with the message `"Insufficient stock for product: {productId}"`.
6. WHEN a charge is successfully registered, THE Repository SHALL decrement the `stock` of each product included in the charge by the indicated `quantity`.
7. THE API SHALL calculate the charge `total` as the sum of `price * quantity` for each item, applying the customer's available credits if the `applyCredit` field is `true`.
8. WHEN a GET request is received at `/charges/{id}`, THE API SHALL return HTTP 200 with the corresponding charge object.
9. WHEN a GET request is received at `/charges` with the `customerId` parameter, THE API SHALL return HTTP 200 with all charges associated with that customer.

---

## Requirement 8 — Credits System

**User Story:** As a financial administrator, I want to manage credits assigned to customers, to allow customers to apply balances in their favor to future charges.

### Acceptance Criteria

1. WHEN a POST request is received at `/credits` with a valid JSON body, THE API SHALL register the credit and return HTTP 201 with the created credit object.
2. THE Validator SHALL verify that the request body contains the required fields: `customerId` (non-empty string) and `amount` (number greater than 0).
3. IF the `customerId` does not correspond to any active customer, THEN THE API SHALL return HTTP 404 with the message `"Customer not found"`.
4. IF the `amount` field contains a value less than or equal to 0, THEN THE Validator SHALL return HTTP 400 with the message `"Credit amount must be greater than 0"`.
5. WHEN a GET request is received at `/credits/{customerId}`, THE API SHALL return HTTP 200 with the customer's total available credit balance.
6. WHEN a credit is applied to a charge, THE Repository SHALL decrement the customer's credit balance by the applied amount, without the resulting balance being negative.
7. IF the customer's available credit balance is less than the amount to apply in a charge, THEN THE API SHALL apply only the available balance and record the remaining amount as debt in the charge.
