# Error Handling

## Domain Error Hierarchy

```javascript
// src/shared/domain/errors/DomainError.js
class DomainError extends Error {
  constructor(message, code, statusCode) {
    super(message)
    this.code = code
    this.statusCode = statusCode
  }
}

class NotFoundError extends DomainError {
  constructor(resource) {
    super(`${resource} not found`, 'NOT_FOUND', 404)
  }
}

class ValidationError extends DomainError {
  constructor(message) {
    super(message, 'VALIDATION_ERROR', 400)
  }
}

class ConflictError extends DomainError {
  constructor(message) {
    super(message, 'CONFLICT', 409)
  }
}
```

---

## Global Error Middleware

```javascript
// src/shared/middleware/errorHandler.js
function errorHandler(error, correlationId) {
  if (error instanceof DomainError) {
    return {
      statusCode: error.statusCode,
      body: JSON.stringify({ error: error.message, code: error.code }),
      headers: { 'Content-Type': 'application/json', 'X-Correlation-ID': correlationId }
    }
  }
  // Unhandled error: full log, generic response
  console.error(JSON.stringify({ error: error.message, stack: error.stack, correlationId }))
  return {
    statusCode: 500,
    body: JSON.stringify({ error: 'Internal server error', code: 'INTERNAL_ERROR' }),
    headers: { 'Content-Type': 'application/json', 'X-Correlation-ID': correlationId }
  }
}
```

---

## Error Code Table

| HTTP Code | Error Code | Scenario |
|-----------|-----------|----------|
| 400 | `VALIDATION_ERROR` | Missing field, invalid type, out-of-range value |
| 400 | `INVALID_BODY` | Body is not valid JSON |
| 401 | `UNAUTHORIZED` | Invalid or expired JWT token |
| 404 | `NOT_FOUND` | Resource not found by id |
| 405 | `METHOD_NOT_ALLOWED` | HTTP method not allowed for the route |
| 409 | `CONFLICT` | Duplicate email, session already open, session already closed |
| 409 | `INSUFFICIENT_STOCK` | Insufficient stock for product |
| 500 | `INTERNAL_ERROR` | Unhandled exception |
