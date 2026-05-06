# Data Models

## Domain Entities

### Product

```javascript
// src/products/domain/Product.js
{
  id: string,        // UUID v4 — Partition Key
  name: string,      // Required, non-empty
  category: string,  // Required, non-empty
  price: number,     // > 0
  stock: number,     // >= 0, integer
  active: boolean,   // true by default; false = logical deletion
  createdAt: string  // ISO 8601
}
```

### Customer

```javascript
// src/customers/domain/Customer.js
{
  id: string,        // UUID v4 — Partition Key
  name: string,      // Required, non-empty
  email: string,     // Valid email format, unique in system
  phone: string,     // Required, non-empty
  active: boolean,   // true by default
  createdAt: string  // ISO 8601
}
```

### Charge

```javascript
// src/charges/domain/Charge.js
{
  id: string,            // UUID v4 — Partition Key
  customerId: string,    // FK → Customer.id
  items: [
    {
      productId: string, // FK → Product.id
      quantity: number,  // Integer > 0
      unitPrice: number
    }
  ],
  subtotal: number,
  appliedCredit: number, // >= 0
  total: number,         // subtotal - appliedCredit
  applyCredit: boolean,
  chargedAt: string      // ISO 8601
}
```

### Credit

```javascript
// src/credits/domain/Credit.js
{
  customerId: string, // Partition Key (accumulated balance per customer)
  balance: number,    // >= 0
  history: [
    {
      amount: number,
      type: "assignment" | "application",
      date: string    // ISO 8601
    }
  ]
}
```

### CashSession

```javascript
// src/pos/domain/CashSession.js
{
  id: string,           // UUID v4 — Partition Key
  cashierId: string,    // Cashier identifier
  status: "open" | "closed",
  initialAmount: number,// >= 0
  finalAmount: number,  // >= 0, only present when closed
  openedAt: string,     // ISO 8601
  closedAt: string      // ISO 8601, only present when closed
}
```

### Sale

```javascript
// src/pos/domain/Sale.js
{
  id: string,            // UUID v4 — Partition Key
  sessionId: string,     // FK → CashSession.id
  customerId: string,    // FK → Customer.id
  items: [
    {
      productId: string,
      name: string,
      quantity: number,
      unitPrice: number
    }
  ],
  subtotal: number,
  appliedCredit: number,
  total: number,
  paymentMethod: "cash" | "card" | "credit",
  saleDate: string       // ISO 8601
}
```

### Ticket

```javascript
// src/pos/domain/Ticket.js
// Projection of Sale enriched with session data
{
  saleId: string,
  sessionId: string,
  cashierId: string,
  customerId: string,
  items: [
    {
      name: string,
      quantity: number,
      unitPrice: number
    }
  ],
  subtotal: number,
  appliedCredit: number,
  total: number,
  paymentMethod: string,
  saleDate: string
}
```

---

## DynamoDB Tables

### Table: `Products`

| Attribute | Type | Role |
|-----------|------|------|
| `id` | String | Partition Key (PK) |
| `name` | String | Attribute |
| `category` | String | Attribute / GSI |
| `price` | Number | Attribute |
| `stock` | Number | Attribute |
| `active` | Boolean | Attribute |
| `createdAt` | String | Attribute |

- **GSI-1**: `category-index` → PK: `category`, SK: `createdAt`

### Table: `Customers`

| Attribute | Type | Role |
|-----------|------|------|
| `id` | String | Partition Key (PK) |
| `name` | String | Attribute |
| `email` | String | Attribute / GSI |
| `phone` | String | Attribute |
| `active` | Boolean | Attribute |
| `createdAt` | String | Attribute |

- **GSI-1**: `email-index` → PK: `email` (email uniqueness)

### Table: `Charges`

| Attribute | Type | Role |
|-----------|------|------|
| `id` | String | Partition Key (PK) |
| `customerId` | String | Attribute / GSI |
| `items` | List | Attribute |
| `subtotal` | Number | Attribute |
| `appliedCredit` | Number | Attribute |
| `total` | Number | Attribute |
| `chargedAt` | String | Sort Key in GSI |

- **GSI-1**: `customerId-index` → PK: `customerId`, SK: `chargedAt`

### Table: `Credits`

| Attribute | Type | Role |
|-----------|------|------|
| `customerId` | String | Partition Key (PK) |
| `balance` | Number | Attribute |
| `history` | List | Attribute |

- One item per customer. Balance updated with `UpdateItem` + `ConditionExpression` to prevent negative balance.

### Table: `POS_Sessions`

| Attribute | Type | Role |
|-----------|------|------|
| `id` | String | Partition Key (PK) |
| `cashierId` | String | Attribute / GSI |
| `status` | String | Attribute |
| `initialAmount` | Number | Attribute |
| `finalAmount` | Number | Attribute |
| `openedAt` | String | Attribute |
| `closedAt` | String | Attribute |

- **GSI-1**: `cashierId-status-index` → PK: `cashierId`, SK: `status`

### Table: `POS_Sales`

| Attribute | Type | Role |
|-----------|------|------|
| `id` | String | Partition Key (PK) |
| `sessionId` | String | Attribute / GSI |
| `customerId` | String | Attribute |
| `items` | List | Attribute |
| `subtotal` | Number | Attribute |
| `appliedCredit` | Number | Attribute |
| `total` | Number | Attribute |
| `paymentMethod` | String | Attribute |
| `saleDate` | String | Sort Key in GSI |

- **GSI-1**: `sessionId-index` → PK: `sessionId`, SK: `saleDate` (ascending ordered history)
