# Module: Customers

## Requirement 6 — Customer Management

**User Story:** As a system administrator, I want to register, query, update, and delete customers, to maintain an up-to-date buyer database.

### Acceptance Criteria

1. WHEN a POST request is received at `/customers` with a valid JSON body, THE API SHALL create the customer and return HTTP 201 with the created customer object, including its generated `id`.
2. THE Validator SHALL verify that the customer creation request body contains the required fields: `name` (non-empty string), `email` (string with valid email format), and `phone` (non-empty string).
3. IF the `email` field does not have a valid email format, THEN THE Validator SHALL return HTTP 400 with the message `"Invalid email format"`.
4. IF the `email` is already registered in the system, THEN THE API SHALL return HTTP 409 with the message `"Email already registered"`.
5. WHEN a GET request is received at `/customers`, THE API SHALL return HTTP 200 with a JSON array of all active customers.
6. WHEN a GET request is received at `/customers/{id}`, THE API SHALL return HTTP 200 with the corresponding customer object.
7. IF the provided customer `id` does not correspond to any registered customer, THEN THE API SHALL return HTTP 404 with the message `"Customer not found"`.
8. WHEN a PUT request is received at `/customers/{id}` with a valid JSON body, THE API SHALL update the corresponding customer and return HTTP 200 with the updated customer object.
9. WHEN a DELETE request is received at `/customers/{id}`, THE API SHALL perform a logical deletion of the customer and return HTTP 200 with the message `"Customer deleted successfully"`.
