# Requirements Document — Supermarket POS System

## Introduction

A Point of Sale (POS) system for a supermarket composed of two independent projects:

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS v4 with glassmorphism aesthetic.
- **Backend:** Node.js + AWS Lambda + DynamoDB (JSON documents) with a REST API.

The system allows cashiers to register sales, manage the shopping cart, apply VAT, process payments and print receipts. Supervisors additionally access reports. Administrators have full control over products, users and system configuration.

The POS operates primarily through standard supermarket keyboard shortcuts (no touchscreen), with navigation via function keys (F1–F9) and arrow keys.

---

## Glossary

- **POS:** Point of Sale — the terminal where the cashier registers sales.
- **System:** The complete frontend + backend POS set.
- **Frontend:** React application running in the cashier's browser.
- **Backend:** Serverless REST API that persists JSON documents in DynamoDB (non-relational tables).
- **Cashier:** User with role `CASHIER` — exclusive access to the POS module.
- **Supervisor:** User with role `SUPERVISOR` — access to POS, reports and product lookup.
- **Admin:** User with role `ADMIN` — full access to all modules.
- **JWT:** JSON Web Token — authentication token issued by the Backend upon login.
- **Cart:** List of items in the current sale, visible in the POS.
- **Item:** An individual line within the Cart, corresponding to a product with quantity and price.
- **Sale:** Completed transaction including one or more Items, payment method and generated receipt.
- **Receipt:** Proof of Sale, printable on thermal paper or exportable as PDF.
- **VAT:** Value Added Tax — standard rate of 19%.
- **Base_Price:** Product price before VAT when the product does not include VAT.
- **Price_With_VAT:** Final product price with VAT included.
- **Weight_Product:** Product whose unit of sale is kilograms, grams or pounds.
- **Modal:** Overlay window on the POS for capturing data or confirming actions.
- **Search Bar:** Text field in the POS for searching products by barcode or name.
- **Payment_Method:** How the customer pays for the sale: Cash, Card or Transfer.
- **Change:** Difference between the cash amount received and the Sale total.
- **Role:** Access level assigned to a user: `CASHIER`, `SUPERVISOR` or `ADMIN`.
- **Interceptor:** Frontend module that automatically attaches the JWT to every HTTP request.
- **Glassmorphism:** Visual style with `backdrop-blur`, semi-transparent backgrounds and subtle borders.
- **Bento:** Grid-type card component used in the administration panel.
- **Thermal_Paper_80mm:** Standard print format for 80mm thermal printers.
- **Thermal_Paper_58mm:** Print format for 58mm thermal printers.
- **Letter_Paper:** Standard letter (carta) print format.

---

## Requirements

### Requirement 1: Authentication and Session Management

**User Story:** As a cashier, I want to log in with a username and password, so I can access the POS securely and the system identifies my role.

#### Acceptance Criteria

1. THE Frontend SHALL display a login screen with `username` and `password` fields and a "Sign in" button as the sole entry point of the application.
2. WHEN the user submits valid credentials, THE Backend SHALL issue a signed JWT that includes the user identifier, the role and the expiration date.
3. WHEN the Backend issues a JWT, THE Frontend SHALL store the JWT in `localStorage` and redirect the user directly to the POS module.
4. WHEN the user submits invalid credentials, THE Backend SHALL respond with HTTP 401 and THE Frontend SHALL display a visible error message without redirecting.
5. WHEN the user attempts to access a protected route without a stored JWT, THE Frontend SHALL redirect to login.
6. THE Interceptor SHALL attach the `Authorization: Bearer <token>` header to all HTTP requests to the Backend.
7. WHEN the Backend responds with HTTP 401 or 403, THE Frontend SHALL remove the JWT from `localStorage`, display a session-expired message and redirect to login.
8. WHEN the user activates the F9 shortcut, THE Frontend SHALL remove the JWT from `localStorage` and redirect to login.
9. THE Backend SHALL reject requests without a valid JWT with HTTP 401.
10. THE Backend SHALL reject requests from inactive users with HTTP 403.

---

### Requirement 2: POS Module — Product Search

**User Story:** As a cashier, I want to search products by barcode or name with the keyboard, so I can add items to the cart quickly without using the mouse.

#### Acceptance Criteria

1. WHEN the cashier presses F1, THE Frontend SHALL place focus on the Search Bar.
2. WHEN the cashier types in the Search Bar, THE Frontend SHALL query the Backend for products whose code or name match the entered text.
3. WHEN the Backend receives a search query, THE Backend SHALL respond with the list of active matching products within a maximum of 300 ms.
4. WHEN the search returns results, THE Frontend SHALL display a dropdown list with the name, code and price of each product.
5. WHEN the cashier presses Enter on a selected product, THE Frontend SHALL add a new individual line to the Cart without accumulating on existing lines.
6. WHEN the selected product is a Weight_Product, THE Frontend SHALL open a Modal requesting the weight before adding the Item to the Cart.
7. WHEN the cashier enters the weight in the weight Modal and confirms, THE Frontend SHALL calculate the Item subtotal by multiplying the unit price by the entered weight and add the Item to the Cart.
8. IF the weight entered in the weight Modal is less than or equal to zero, THEN THE Frontend SHALL display an error message and keep the Modal open.
9. WHEN the cashier presses Esc in the weight Modal, THE Frontend SHALL close the Modal without adding any Item to the Cart.
10. WHEN the search returns no results, THE Frontend SHALL display "Product not found" in the Search Bar.

---

### Requirement 3: POS Module — Shopping Cart

**User Story:** As a cashier, I want to view and manage the shopping cart with the keyboard, so I can review, correct and complete the sale without interruptions.

#### Acceptance Criteria

1. THE Frontend SHALL display the Cart as a `ul > li` list where each Item occupies a line with name and quantity on the left, and unit price and subtotal on the right.
2. WHILE the Cart contains at least one Item, THE Frontend SHALL display the subtotal without VAT, the 19% VAT amount and the total with VAT in the summary section.
3. WHEN the cashier presses ↑ or ↓, THE Frontend SHALL move the selection focus among Cart Items.
4. WHEN the cashier presses Del with an Item selected, THE Frontend SHALL remove that Item from the Cart and recalculate totals.
5. WHEN the cashier presses F2, THE Frontend SHALL remove the last Item added to the Cart and recalculate totals.
6. WHEN the cashier presses F3, THE Frontend SHALL open a confirmation Modal before clearing the entire Cart.
7. WHEN the cashier confirms clearing in the F3 Modal, THE Frontend SHALL empty the Cart and reset totals to zero.
8. WHEN the cashier presses Esc in the F3 confirmation Modal, THE Frontend SHALL close the Modal without modifying the Cart.
9. THE Frontend SHALL automatically recalculate subtotal, VAT and total every time an Item is added or removed from the Cart.
10. WHEN a product has the `includes_vat` flag set to `true`, THE Frontend SHALL treat its price as Price_With_VAT and break out the included VAT in the summary.
11. WHEN a product has the `includes_vat` flag set to `false`, THE Frontend SHALL treat its price as Base_Price and add 19% VAT when calculating the total.

---

### Requirement 4: POS Module — VAT and Discounts

**User Story:** As a cashier, I want to view and adjust the VAT breakdown and apply global discounts, so I can offer the correct prices to the customer.

#### Acceptance Criteria

1. WHEN the cashier presses F4, THE Frontend SHALL open the VAT/Discount Modal.
2. THE VAT/Discount Modal SHALL display the subtotal without VAT, the calculated 19% VAT amount and the total with VAT for the current sale.
3. WHEN the cashier enters a global discount percentage in the VAT/Discount Modal, THE Frontend SHALL recalculate the total applying the discount to the subtotal before calculating VAT.
4. IF the entered discount percentage is less than 0 or greater than 100, THEN THE Frontend SHALL display an error message and not apply the discount.
5. WHEN the cashier confirms the discount in the Modal, THE Frontend SHALL update the Cart summary with the newly calculated values.
6. WHEN the cashier presses Esc in the VAT/Discount Modal, THE Frontend SHALL close the Modal without modifying Cart values.

---

### Requirement 5: POS Module — Payment Method

**User Story:** As a cashier, I want to select the payment method with the keyboard, so I can record how the customer pays for the sale.

#### Acceptance Criteria

1. WHEN the cashier presses F5, THE Frontend SHALL open the Payment_Method Modal.
2. THE Payment_Method Modal SHALL present the Cash, Card and Transfer options navigable with the ↑ and ↓ keys.
3. WHEN the cashier presses Enter on an option, THE Frontend SHALL select that Payment_Method.
4. WHEN the cashier selects Cash, THE Frontend SHALL display a field for entering the received amount and calculate Change automatically.
5. WHEN the received cash amount is less than the Sale total, THE Frontend SHALL display an error message and disable the confirm payment button.
6. WHEN the cashier confirms the Payment_Method, THE Frontend SHALL record the selection and close the Modal.
7. WHEN the cashier presses Esc in the Payment_Method Modal, THE Frontend SHALL close the Modal without recording any Payment_Method.

---

### Requirement 6: POS Module — Sale Processing and Receipt

**User Story:** As a cashier, I want to process the payment and generate the receipt, so I can complete the sale and hand the customer their proof of purchase.

#### Acceptance Criteria

1. WHEN the cashier presses F6, THE Frontend SHALL initiate the checkout process by sending the Sale to the Backend.
2. THE Backend SHALL persist the Sale with all its Items, the Payment_Method, the total with VAT, the broken-out VAT and the cashier identifier.
3. WHEN the Backend persists the Sale successfully, THE Backend SHALL respond with the generated sale number and THE Frontend SHALL open the Receipt Modal.
4. THE Receipt Modal SHALL display: sale number, date and time, cashier name, list of Items (name, quantity, unit price, subtotal), subtotal without VAT, 19% VAT, total with VAT, Payment_Method and Change if payment was in cash.
5. WHEN the cashier presses F7 or clicks "Print", THE Frontend SHALL invoke `window.print()` with print styles adapted to the configured paper format.
6. WHEN the cashier clicks "Save PDF", THE Frontend SHALL invoke `window.print()` targeting the browser PDF destination to download the Receipt as a PDF file.
7. WHEN the cashier presses F8 or clicks "New Sale", THE Frontend SHALL close the Receipt Modal, empty the Cart and reset the POS for a new sale.
8. IF the Cart is empty when the cashier presses F6, THEN THE Frontend SHALL display an error message and not send the Sale to the Backend.
9. IF no Payment_Method has been selected when the cashier presses F6, THEN THE Frontend SHALL display an error message indicating that a payment method must be selected.
10. IF the Backend responds with an error when persisting the Sale, THEN THE Frontend SHALL display a descriptive error message and keep the Cart intact.

---

### Requirement 7: POS Module — Keyboard Navigation and Overflow Menu

**User Story:** As a cashier, I want to operate the POS entirely with the keyboard using function keys, so I can maintain service speed without needing a mouse.

#### Acceptance Criteria

1. THE Frontend SHALL intercept keys F1 through F9 globally while the POS is active and execute the corresponding action according to the defined shortcut table.
2. THE Frontend SHALL intercept the M key globally while the POS is active and open a dropdown menu with the available secondary shortcuts.
3. WHEN a Modal is open, THE Frontend SHALL intercept the Esc key and close the active Modal without executing other actions.
4. THE Frontend SHALL display the table of active keyboard shortcuts on screen as a permanent visual reference for the cashier.
5. WHEN the cashier presses F9, THE Frontend SHALL close the cashier's session by removing the JWT and redirecting to login.
6. THE Frontend SHALL disable POS keyboard shortcuts while a Modal is open, except Esc.

---

### Requirement 8: Products Module — CRUD

**User Story:** As an administrator, I want to create, edit, deactivate and look up products, so I can keep the catalog updated with correct prices and data.

#### Acceptance Criteria

1. THE Backend SHALL expose the `GET /products` endpoint that returns a paginated product list with support for filters by name, category and status.
2. THE Backend SHALL expose the `POST /products` endpoint that creates a new product with the fields: code, name, description, category, price, `includes_vat`, unit of measure and status.
3. THE Backend SHALL expose the `PUT /products/:id` endpoint that updates an existing product's data.
4. THE Backend SHALL expose the `DELETE /products/:id` endpoint that logically deactivates the product (status `inactive`) without physically deleting it from the database.
5. WHEN the Admin sends a `POST /products` request with missing required fields, THE Backend SHALL respond with HTTP 400 and a descriptive message per invalid field.
6. WHEN the Admin sends a duplicate product code, THE Backend SHALL respond with HTTP 409.
7. THE Frontend SHALL display the product creation and editing form with client-side validation before sending to the Backend.
8. WHEN the Supervisor accesses the products module, THE Frontend SHALL display the product list in read-only mode without edit or delete buttons.
9. WHEN a user with role `CASHIER` attempts to access the `/products` endpoint with POST, PUT or DELETE method, THE Backend SHALL respond with HTTP 403.

---

### Requirement 9: Users Module — CRUD

**User Story:** As an administrator, I want to create, edit and deactivate system users, so I can control who has access to the POS and with what permissions.

#### Acceptance Criteria

1. THE Backend SHALL expose the `GET /users` endpoint that returns the list of users with their role and status, accessible only to the `ADMIN` role.
2. THE Backend SHALL expose the `POST /users` endpoint that creates a new user with the fields: first name, last name, username, password, role and status.
3. THE Backend SHALL expose the `PUT /users/:id` endpoint that updates an existing user's data, including role and status changes.
4. THE Backend SHALL expose the `DELETE /users/:id` endpoint that logically deactivates the user without physically deleting them.
5. WHEN the Admin creates a user with a duplicate username, THE Backend SHALL respond with HTTP 409.
6. THE Backend SHALL store passwords using a secure hashing algorithm (bcrypt) and never return them in responses.
7. WHEN a user with a role other than `ADMIN` attempts to access any `/users` endpoint, THE Backend SHALL respond with HTTP 403.
8. THE Frontend SHALL display the user management module only to users with role `ADMIN`.

---

### Requirement 10: Reports Module

**User Story:** As a supervisor or administrator, I want to view sales reports by period, so I can analyze business performance.

#### Acceptance Criteria

1. THE Backend SHALL expose the `GET /reports/sales` endpoint that accepts start date and end date parameters and returns the sales summary for the period.
2. THE Backend SHALL include in the report: total number of sales, total amount sold, breakdown by Payment_Method and list of individual sales with cashier, total and items.
3. THE Frontend SHALL display the reports module with period filters: today, this week and this month, as well as a custom date range.
4. WHEN the Admin or Supervisor selects a period, THE Frontend SHALL query the Backend and display results in summary tables and charts.
5. WHEN a user with role `CASHIER` attempts to access the `/reports` endpoint, THE Backend SHALL respond with HTTP 403.
6. THE Frontend SHALL display the reports module only to users with role `ADMIN` or `SUPERVISOR`.

---

### Requirement 11: Configuration Module

**User Story:** As an administrator, I want to configure system parameters, so I can adapt the POS to the business (name, VAT, print format).

#### Acceptance Criteria

1. THE Backend SHALL expose the `GET /configuration` endpoint that returns the current system parameters.
2. THE Backend SHALL expose the `PUT /configuration` endpoint that updates the parameters: business name, VAT rate, print paper format and logo.
3. THE Frontend SHALL display the configuration module only to users with role `ADMIN`.
4. WHEN the Admin updates the paper format, THE Frontend SHALL apply the new format to the Receipt print styles in the next print.
5. WHEN the Admin updates the VAT rate, THE Frontend SHALL use the new rate in all Cart calculations from that point on.
6. WHEN a user with a role other than `ADMIN` attempts to access the `/configuration` endpoint with PUT method, THE Backend SHALL respond with HTTP 403.

---

### Requirement 12: Receipt Printing and Formats

**User Story:** As a cashier, I want to print or save the receipt in the correct format for the business printer, so I can give the customer a readable proof of purchase.

#### Acceptance Criteria

1. THE Frontend SHALL apply CSS print styles (`@media print`) that hide all interface elements except the Receipt content.
2. WHERE the configured format is Thermal_Paper_80mm, THE Frontend SHALL apply a print width of 80mm with 10pt monospace font.
3. WHERE the configured format is Thermal_Paper_58mm, THE Frontend SHALL apply a print width of 58mm with 8pt monospace font.
4. WHERE the configured format is Letter_Paper, THE Frontend SHALL apply the standard letter format with 2cm margins.
5. THE Receipt SHALL include the configured business name in the header of each print.
6. WHEN the cashier saves the Receipt as PDF, THE Frontend SHALL invoke `window.print()` targeting the browser PDF destination without requiring external PDF generation libraries.

---

## Functional Requirements

| ID | Module | Description | Minimum Role |
|----|--------|-------------|--------------|
| FR-01 | Authentication | Login with username/password and JWT issuance | All |
| FR-02 | Authentication | JWT storage in localStorage | All |
| FR-03 | Authentication | Automatic JWT interceptor on HTTP requests | All |
| FR-04 | Authentication | Logout with F9 or button | All |
| FR-05 | Authentication | Automatic redirect to login on invalid token | All |
| FR-06 | POS | Product search by code or name with F1 | Cashier |
| FR-07 | POS | Add item to cart with Enter (always new line) | Cashier |
| FR-08 | POS | Weight modal for Weight_Products | Cashier |
| FR-09 | POS | Remove last item with F2 | Cashier |
| FR-10 | POS | Clear cart with F3 + confirmation | Cashier |
| FR-11 | POS | VAT/Discount modal with F4 | Cashier |
| FR-12 | POS | Payment_Method modal with F5 (↑↓ + Enter) | Cashier |
| FR-13 | POS | Automatic Change calculation for cash payment | Cashier |
| FR-14 | POS | Sale processing with F6 | Cashier |
| FR-15 | POS | Receipt modal with all required fields | Cashier |
| FR-16 | POS | Receipt printing with F7 / `window.print()` | Cashier |
| FR-17 | POS | Save Receipt as PDF | Cashier |
| FR-18 | POS | New sale with F8 | Cashier |
| FR-19 | POS | Cart navigation with ↑↓ and deletion with Del | Cashier |
| FR-20 | POS | Overflow menu with M | Cashier |
| FR-21 | POS | VAT calculation (19%) with breakdown in summary | Cashier |
| FR-22 | POS | Support for prices with and without VAT per product | Cashier |
| FR-23 | Products | Paginated listing with filters | Supervisor |
| FR-24 | Products | Product creation (Admin) | Admin |
| FR-25 | Products | Product editing (Admin) | Admin |
| FR-26 | Products | Logical product deactivation (Admin) | Admin |
| FR-27 | Users | User listing | Admin |
| FR-28 | Users | User creation with role | Admin |
| FR-29 | Users | User editing (role, status) | Admin |
| FR-30 | Users | Logical user deactivation | Admin |
| FR-31 | Reports | Sales report by period (today/week/month/range) | Supervisor |
| FR-32 | Reports | Breakdown by payment method in reports | Supervisor |
| FR-33 | Configuration | Update business name, VAT and paper format | Admin |
| FR-34 | Configuration | Immediate application of configuration changes in POS | Admin |

---

## Non-Functional Requirements

### Performance

| ID | Description |
|----|-------------|
| NFR-01 | THE Backend SHALL respond to product searches within a maximum of 300 ms under normal load (up to 50 concurrent requests). |
| NFR-02 | THE Backend SHALL respond to Sale creation within a maximum of 500 ms. |
| NFR-03 | THE Frontend SHALL render Cart changes (add/remove Item) within a maximum of 100 ms from the cashier's action. |
| NFR-04 | THE Backend SHALL support at least 10 concurrent cashier sessions without performance degradation. |

### Security

| ID | Description |
|----|-------------|
| NFR-05 | THE Backend SHALL sign JWTs with a secret of at least 256 bits and a maximum expiration of 8 hours. |
| NFR-06 | THE Backend SHALL store passwords using bcrypt with a minimum cost factor of 10. |
| NFR-07 | THE Backend SHALL validate the user's role on every protected endpoint and reject unauthorized access with HTTP 403. |
| NFR-08 | THE Backend SHALL configure CORS to accept requests only from the configured Frontend origin. |
| NFR-09 | THE Frontend SHALL sanitize all user inputs before sending them to the Backend to prevent data injection. |
| NFR-10 | THE Backend SHALL log all failed authentication attempts with timestamp and source IP. |

### Usability and Keyboard Accessibility

| ID | Description |
|----|-------------|
| NFR-11 | THE Frontend SHALL allow completing a full sale (search product → add → pay → print receipt) without using the mouse. |
| NFR-12 | THE Frontend SHALL display a permanent visual reference of active keyboard shortcuts on the POS screen. |
| NFR-13 | WHEN the cashier presses a function key (F1–F9), THE Frontend SHALL execute the corresponding action in less than 50 ms. |
| NFR-14 | THE Frontend SHALL maintain visible focus on the active element at all times through a clear visual indicator. |
| NFR-15 | THE Frontend SHALL apply the glassmorphism style with `backdrop-blur`, `bg-white/10` backgrounds and `border-white/20` borders consistently across all components. |
| NFR-16 | THE Frontend SHALL offer a dark/light mode toggle accessible from the main interface. |
| NFR-17 | THE Frontend SHALL use the 12-column grid layout defined in `estructura.html` as the base for the POS layout. |

### Availability and Maintainability

| ID | Description |
|----|-------------|
| NFR-18 | THE Backend SHALL expose a `GET /health` endpoint that returns the service status for monitoring. |
| NFR-19 | THE Backend SHALL version the data schema through JSON seed files in `db/dynamodb/seed/` and table definitions in SAM (`template.yaml`). |
| NFR-20 | THE Frontend SHALL separate business logic (VAT calculations, totals) from presentation components into independent modules. |
| NFR-21 | THE Backend SHALL return structured error messages in JSON format with `code`, `message` and `details` fields in all error responses. |
