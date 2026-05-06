# Estrategia de Testing

## Enfoque Dual: Unitario + Basado en Propiedades

La estrategia combina tests unitarios para casos concretos y tests basados en propiedades (PBT) para verificar invariantes universales.

**Librería PBT**: [fast-check](https://fast-check.dev/)

```bash
npm install --save-dev fast-check
```

---

## Configuración de Tests de Propiedades

Cada test de propiedad se ejecuta con mínimo **100 iteraciones** y está etiquetado con la propiedad que valida:

```javascript
import fc from 'fast-check'

test('P-02: filtrado por categoría retorna solo productos de esa categoría', () => {
  fc.assert(
    fc.property(
      fc.array(productoArbitrary()),
      fc.string({ minLength: 1 }),
      (productos, categoria) => {
        const resultado = filtrarPorCategoria(productos, categoria)
        return resultado.every(p => p.categoria === categoria)
      }
    ),
    { numRuns: 100 }
  )
})
```

---

## Arbitrarios (Generadores) Principales

```javascript
// tests/arbitraries/producto.js
const productoArbitrary = () => fc.record({
  id: fc.uuid(),
  nombre: fc.string({ minLength: 1, maxLength: 100 }),
  categoria: fc.string({ minLength: 1, maxLength: 50 }),
  precio: fc.float({ min: 0.01, max: 99999 }),
  stock: fc.integer({ min: 0, max: 9999 }),
  activo: fc.boolean(),
  fechaCreacion: fc.date().map(d => d.toISOString())
})

// tests/arbitraries/venta.js
const itemVentaArbitrary = () => fc.record({
  productoId: fc.uuid(),
  nombre: fc.string({ minLength: 1 }),
  cantidad: fc.integer({ min: 1, max: 100 }),
  precioUnitario: fc.float({ min: 0.01, max: 99999 })
})
```

---

## Cobertura por Módulo

| Módulo | Tests Unitarios | Tests PBT | Cobertura Mínima |
|--------|----------------|-----------|-----------------|
| Health | 3 | 1 (P-04) | 80% |
| Productos | 10 | 6 (P-01,02,03,05,06,07,08) | 80% |
| Clientes | 10 | 4 (P-05,06,08,09) | 80% |
| Cobros | 8 | 4 (P-10,11,12,13) | 80% |
| Créditos | 6 | 2 (P-13) | 80% |
| Stats | 5 | 1 (P-14) | 80% |
| POS | 15 | 8 (P-16,17,18,19,20,21,22) | 80% |
| Shared/Errors | 5 | 1 (P-15) | 80% |

---

## Mapeo Propiedad → Test

| Propiedad | Módulo | Descripción del Test |
|-----------|--------|---------------------|
| P-01 | Productos | `fc.array(productoArbitrary())` → solo activos en respuesta |
| P-02 | Productos | `fc.array + fc.string` → filtro exacto por categoría |
| P-03 | Productos | `productoArbitrary()` → todos los campos presentes en JSON |
| P-04 | Health | `fc.string()` como APP_VERSION → reflejada en respuesta |
| P-05 | Shared | `fc.record` con campos omitidos → siempre HTTP 400 |
| P-06 | Shared | `fc.array` de creaciones → ids únicos |
| P-07 | Productos/Clientes | Actualización parcial → campos no tocados iguales |
| P-08 | Productos/Clientes | DELETE → `activo=false`, no aparece en listados |
| P-09 | Clientes | Email duplicado → siempre HTTP 409 |
| P-10 | Cobros/POS | `fc.array(itemArbitrary())` → total calculado correctamente |
| P-11 | Cobros/POS | `cantidad > stock` → siempre HTTP 409, stock sin cambios |
| P-12 | Cobros/POS | Cobro exitoso → stock decrementado exactamente |
| P-13 | Créditos | Secuencia de ops → saldo siempre `>= 0` |
| P-14 | Stats | `fc.array(productoArbitrary())` → métricas correctas |
| P-15 | Shared | Cualquier error → estructura JSON con `error` y `codigo` |
| P-16 | POS | Cajero con sesión abierta → segundo intento = HTTP 409 |
| P-17 | POS | Sesión abierta → cierre cambia estado; cerrada → HTTP 409 |
| P-18 | POS | Sesión cerrada → venta retorna HTTP 409 |
| P-19 | POS | `ventaArbitrary()` → ticket contiene todos los campos |
| P-20 | POS | Crear venta → GET ticket retorna mismos datos |
| P-21 | POS | `fc.array(ventaArbitrary())` → ordenadas por `fechaVenta` asc |
| P-22 | POS | `fc.string()` como `metodoPago` inválido → siempre HTTP 400 |

---

## Tests de Integración

Los siguientes escenarios requieren tests de integración contra DynamoDB Local o staging:

- Verificación de GSIs en consultas reales
- Operaciones condicionales de DynamoDB (`ConditionExpression` para saldo de crédito)
- Propagación del header `X-Correlation-ID` end-to-end
- Emisión de métricas a CloudWatch
- Autenticación JWT con Lambda Authorizer

---

## Herramientas

| Herramienta | Uso |
|-------------|-----|
| [Jest](https://jestjs.io/) | Test runner principal |
| [fast-check](https://fast-check.dev/) | Property-based testing |
| [aws-sdk-client-mock](https://github.com/m-radzikowski/aws-sdk-client-mock) | Mock de DynamoDB en tests unitarios |
| [DynamoDB Local](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html) | Tests de integración locales |
| jest-coverage | Cobertura mínima 80% |
