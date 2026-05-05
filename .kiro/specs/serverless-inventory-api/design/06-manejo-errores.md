# Manejo de Errores

## Jerarquía de Errores de Dominio

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
    super(`${resource} no encontrado`, 'NOT_FOUND', 404)
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

## Middleware Global de Errores

```javascript
// src/shared/middleware/errorHandler.js
function errorHandler(error, correlationId) {
  if (error instanceof DomainError) {
    return {
      statusCode: error.statusCode,
      body: JSON.stringify({ error: error.message, codigo: error.code }),
      headers: { 'Content-Type': 'application/json', 'X-Correlation-ID': correlationId }
    }
  }
  // Error no controlado: log completo, respuesta genérica
  console.error(JSON.stringify({ error: error.message, stack: error.stack, correlationId }))
  return {
    statusCode: 500,
    body: JSON.stringify({ error: 'Error interno del servidor', codigo: 'INTERNAL_ERROR' }),
    headers: { 'Content-Type': 'application/json', 'X-Correlation-ID': correlationId }
  }
}
```

---

## Tabla de Códigos de Error

| Código HTTP | Código de Error | Escenario |
|-------------|-----------------|-----------|
| 400 | `VALIDATION_ERROR` | Campo faltante, tipo inválido, valor fuera de rango |
| 400 | `INVALID_BODY` | Body no es JSON válido |
| 401 | `UNAUTHORIZED` | Token JWT inválido o expirado |
| 404 | `NOT_FOUND` | Recurso no encontrado por id |
| 405 | `METHOD_NOT_ALLOWED` | Método HTTP no permitido para la ruta |
| 409 | `CONFLICT` | Email duplicado, sesión ya abierta, sesión ya cerrada |
| 409 | `INSUFFICIENT_STOCK` | Stock insuficiente para el producto |
| 500 | `INTERNAL_ERROR` | Excepción no controlada |
