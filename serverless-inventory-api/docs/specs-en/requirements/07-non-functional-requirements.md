# Non-Functional Requirements (NFR)

## NFR-01: Performance

1. WHILE the system is under normal load (up to 100 concurrent requests), THE Lambda SHALL complete the execution of each request in a maximum of **1000 ms** measured from event receipt to response.
2. WHEN a Lambda is invoked cold (cold start), THE Lambda SHALL complete initialization and return a response in a maximum of **3000 ms**.
3. THE Stats_Engine SHALL calculate and return inventory metrics in a maximum of **2000 ms** regardless of the number of active products.

---

## NFR-02: Availability

1. THE API SHALL maintain a minimum availability of **99.5% monthly**, excluding scheduled maintenance windows notified at least 24 hours in advance.
2. IF an underlying infrastructure component (DynamoDB, API Gateway) experiences degradation, THEN THE API SHALL return appropriate error responses instead of silent timeouts.

---

## NFR-03: Security

1. THE API SHALL require authentication via a valid JWT token on all endpoints, except `/health`.
2. THE API SHALL authorize each request by verifying that the user's role in the JWT token has permission for the requested operation, according to the role matrix defined in the system configuration.
3. THE API SHALL transmit all data exclusively over **HTTPS/TLS 1.2** or higher.
4. THE Repository SHALL store sensitive customer data (email, phone) with encryption at rest using DynamoDB's encryption capabilities.
5. IF a JWT token is expired or invalid, THEN THE API SHALL return HTTP 401 with the message `"Unauthorized"` without exposing details of the authentication mechanism.

---

## NFR-04: Scalability

1. THE Lambda SHALL automatically scale to handle up to **500 concurrent requests** without performance degradation above the thresholds defined in NFR-01.
2. THE Repository SHALL use DynamoDB with **on-demand capacity** to automatically scale storage and throughput according to load.
3. WHILE concurrent load exceeds 200 simultaneous requests, THE API SHALL maintain an error rate below **1%** for read operations.

---

## NFR-05: Maintainability

1. THE API SHALL maintain a minimum unit test coverage of **80%** over the business logic of each Lambda, measured by the coverage tool configured in the project.
2. THE API SHALL expose updated **OpenAPI 3.0** documentation at the `/docs` endpoint, automatically generated from the SAM template definitions.
3. THE Repository SHALL follow the hexagonal architecture defined in the project, separating domain, application, and infrastructure into independent and verifiable layers.

---

## NFR-06: Observability

1. THE Lambda SHALL emit structured logs in JSON format for each processed request, including the fields: `requestId`, `path`, `method`, `statusCode`, `durationMs`, and `timestamp`.
2. WHEN a Lambda throws an exception, THE Lambda SHALL log the `error` field with the exception message and the `stack` field with the complete stack trace, without exposing this information in the HTTP response.
3. THE Lambda SHALL propagate the `X-Correlation-ID` header received in the request to all logs and responses generated during processing, to enable distributed traceability.
4. THE API SHALL emit custom metrics to AWS CloudWatch for the events: Lambda invocation, validation error, insufficient stock error, and completed POS sale.
