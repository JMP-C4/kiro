# Testing Strategy

## Dual Approach: Unit + Property-Based

The strategy combines unit tests for concrete cases and property-based tests (PBT) to verify universal invariants.

**PBT Library**: [fast-check](https://fast-check.dev/)

```bash
npm install --save-dev fast-check
```

---

## Property Test Configuration

Each property test runs with a minimum of **100 iterations** and is labeled with the property it validates:

```javascript
import fc from 'fast-check'

test('P-02: category filter returns only products of that category', () => {
  fc.assert(
    fc.property(
      fc.array(productArbitrary()),
      fc.string({ minLength: 1 }),
      (products, category) => {
        const result = filterByCategory(products, category)
        return result.every(p => p.category === category)
      }
    ),
    { numRuns: 100 }
  )
})
```

---

## Main Arbitraries (Generators)

```javascript
// tests/arbitraries/product.js
const productArbitrary = () => fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  category: fc.string({ minLength: 1, maxLength: 50 }),
  price: fc.float({ min: 0.01, max: 99999 }),
  stock: fc.integer({ min: 0, max: 9999 }),
  active: fc.boolean(),
  createdAt: fc.date().map(d => d.toISOString())
})

// tests/arbitraries/sale.js
const saleItemArbitrary = () => fc.record({
  productId: fc.uuid(),
  name: fc.string({ minLength: 1 }),
  quantity: fc.integer({ min: 1, max: 100 }),
  unitPrice: fc.float({ min: 0.01, max: 99999 })
})
```

---

## Coverage by Module

| Module | Unit Tests | PBT Tests | Min Coverage |
|--------|-----------|-----------|-------------|
| Health | 3 | 1 (P-04) | 80% |
| Products | 10 | 6 (P-01,02,03,05,06,07,08) | 80% |
| Customers | 10 | 4 (P-05,06,08,09) | 80% |
| Charges | 8 | 4 (P-10,11,12,13) | 80% |
| Credits | 6 | 2 (P-13) | 80% |
| Stats | 5 | 1 (P-14) | 80% |
| POS | 15 | 8 (P-16,17,18,19,20,21,22) | 80% |
| Shared/Errors | 5 | 1 (P-15) | 80% |

---

## Property → Test Mapping

| Property | Module | Test Description |
|----------|--------|-----------------|
| P-01 | Products | `fc.array(productArbitrary())` → only active in response |
| P-02 | Products | `fc.array + fc.string` → exact category filter |
| P-03 | Products | `productArbitrary()` → all fields present in JSON |
| P-04 | Health | `fc.string()` as APP_VERSION → reflected in response |
| P-05 | Shared | `fc.record` with omitted fields → always HTTP 400 |
| P-06 | Shared | `fc.array` of creations → unique ids |
| P-07 | Products/Customers | Partial update → untouched fields unchanged |
| P-08 | Products/Customers | DELETE → `active=false`, not in listings |
| P-09 | Customers | Duplicate email → always HTTP 409 |
| P-10 | Charges/POS | `fc.array(itemArbitrary())` → correctly calculated total |
| P-11 | Charges/POS | `quantity > stock` → always HTTP 409, stock unchanged |
| P-12 | Charges/POS | Successful charge → stock decremented exactly |
| P-13 | Credits | Sequence of ops → balance always `>= 0` |
| P-14 | Stats | `fc.array(productArbitrary())` → correct metrics |
| P-15 | Shared | Any error → JSON structure with `error` and `code` |
| P-16 | POS | Cashier with open session → second attempt = HTTP 409 |
| P-17 | POS | Open session → close changes status; closed → HTTP 409 |
| P-18 | POS | Closed session → sale returns HTTP 409 |
| P-19 | POS | `saleArbitrary()` → ticket contains all fields |
| P-20 | POS | Create sale → GET ticket returns same data |
| P-21 | POS | `fc.array(saleArbitrary())` → ordered by `saleDate` asc |
| P-22 | POS | `fc.string()` as invalid `paymentMethod` → always HTTP 400 |

---

## Integration Tests

The following scenarios require integration tests against DynamoDB Local or staging:

- GSI verification in real queries
- DynamoDB conditional operations (`ConditionExpression` for credit balance)
- `X-Correlation-ID` header propagation end-to-end
- CloudWatch metrics emission
- JWT authentication with Lambda Authorizer

---

## Tools

| Tool | Use |
|------|-----|
| [Jest](https://jestjs.io/) | Main test runner |
| [fast-check](https://fast-check.dev/) | Property-based testing |
| [aws-sdk-client-mock](https://github.com/m-radzikowski/aws-sdk-client-mock) | DynamoDB mock in unit tests |
| [DynamoDB Local](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html) | Local integration tests |
| jest-coverage | Minimum 80% coverage |
