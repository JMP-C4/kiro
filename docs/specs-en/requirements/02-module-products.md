# Module: Products

## Requirement 1 — System Health Monitoring

**User Story:** As a system operator, I want to check the API status and version, to verify the service is operational before performing critical operations.

### Acceptance Criteria

1. WHEN a GET request is received at `/health`, THE Health_Checker SHALL respond with HTTP 200 and a JSON object containing the fields `status`, `version`, and `timestamp`.
2. WHILE the system is operational, THE Health_Checker SHALL return the `status` field with the value `"ok"`.
3. IF the health check Lambda cannot initialize correctly, THEN THE Health_Checker SHALL return HTTP 503 with a descriptive error message.
4. THE Health_Checker SHALL include in the response the current system version defined in the `APP_VERSION` environment variable.

---

## Requirement 2 — Product Catalog Query

**User Story:** As an API user, I want to list inventory products with category filtering capability, to quickly find the items I need.

### Acceptance Criteria

1. WHEN a GET request is received at `/products`, THE API SHALL return HTTP 200 with a JSON array of all active products.
2. WHEN a GET request is received at `/products` with the `category` query parameter, THE API SHALL return only products whose category exactly matches the provided value.
3. IF the `category` parameter does not match any registered category, THEN THE API SHALL return HTTP 200 with an empty array.
4. THE API SHALL return each product with the fields: `id`, `name`, `category`, `price`, `stock`, and `createdAt`.
5. WHEN the inventory contains no registered products, THE API SHALL return HTTP 200 with an empty array.

---

## Requirement 3 — New Product Registration

**User Story:** As an inventory administrator, I want to register new products with built-in data validations, to maintain catalog integrity.

### Acceptance Criteria

1. WHEN a POST request is received at `/products` with a valid JSON body, THE API SHALL create the product and return HTTP 201 with the created product object, including its generated `id`.
2. THE Validator SHALL verify that the request body contains the required fields: `name` (non-empty string), `category` (non-empty string), `price` (number greater than 0), and `stock` (integer greater than or equal to 0).
3. IF the request body omits any required field, THEN THE Validator SHALL return HTTP 400 with a message identifying the missing field.
4. IF the `price` field contains a value less than or equal to 0, THEN THE Validator SHALL return HTTP 400 with the message `"Price must be greater than 0"`.
5. IF the `stock` field contains a negative value, THEN THE Validator SHALL return HTTP 400 with the message `"Stock cannot be negative"`.
6. IF the request body is not valid JSON, THEN THE API SHALL return HTTP 400 with the message `"Invalid request body"`.
7. THE Repository SHALL assign a unique identifier (`id`) to the product at the time of creation.

---

## Requirement 4 — Product Update

**User Story:** As an inventory administrator, I want to update an existing product's data, to keep the catalog information current.

### Acceptance Criteria

1. WHEN a PUT request is received at `/products/{id}` with a valid JSON body, THE API SHALL update the corresponding product and return HTTP 200 with the updated product object.
2. THE Validator SHALL verify that the fields provided in the update comply with the same validation rules defined in Requirement 3.
3. IF the provided `id` does not correspond to any registered product, THEN THE API SHALL return HTTP 404 with the message `"Product not found"`.
4. THE Repository SHALL preserve fields not included in the update request with their previous values.

---

## Requirement 5 — Product Deletion

**User Story:** As an inventory administrator, I want to delete products from the catalog, to keep the inventory free of obsolete items.

### Acceptance Criteria

1. WHEN a DELETE request is received at `/products/{id}`, THE API SHALL delete the corresponding product and return HTTP 200 with the message `"Product deleted successfully"`.
2. IF the provided `id` does not correspond to any registered product, THEN THE API SHALL return HTTP 404 with the message `"Product not found"`.
3. THE Repository SHALL perform a logical deletion of the product, setting the `active` field to `false`, without physically deleting the database record.
