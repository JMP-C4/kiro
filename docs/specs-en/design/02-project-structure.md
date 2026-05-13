# SAM Project Structure

```
serverless-inventory-api/
├── template.yaml                    # SAM definition (API Gateway + Lambdas + DynamoDB)
├── samconfig.toml                   # Deployment configuration per environment
├── package.json                     # Root dependencies (shared)
│
├── src/
│   ├── shared/                      # Code shared across modules
│   │   ├── domain/
│   │   │   ├── errors/
│   │   │   │   ├── DomainError.js
│   │   │   │   ├── NotFoundError.js
│   │   │   │   ├── ValidationError.js
│   │   │   │   └── ConflictError.js
│   │   │   └── value-objects/
│   │   │       └── UniqueId.js
│   │   ├── infrastructure/
│   │   │   ├── DynamoDBClient.js    # DynamoDB singleton client
│   │   │   └── ResponseBuilder.js  # HTTP response builder
│   │   └── middleware/
│   │       ├── errorHandler.js      # Global error middleware
│   │       └── correlationId.js     # X-Correlation-ID propagation
│   │
│   ├── health/
│   │   └── handler.js
│   │
│   ├── products/
│   │   ├── domain/
│   │   │   └── Product.js
│   │   ├── application/
│   │   │   ├── ports/
│   │   │   │   └── IProductRepository.js
│   │   │   └── use-cases/
│   │   │       ├── ListProducts.js
│   │   │       ├── CreateProduct.js
│   │   │       ├── UpdateProduct.js
│   │   │       └── DeleteProduct.js
│   │   ├── infrastructure/
│   │   │   └── DynamoProductRepository.js
│   │   └── handler.js
│   │
│   ├── customers/
│   │   ├── domain/
│   │   │   └── Customer.js
│   │   ├── application/
│   │   │   ├── ports/
│   │   │   │   └── ICustomerRepository.js
│   │   │   └── use-cases/
│   │   │       ├── ListCustomers.js
│   │   │       ├── GetCustomer.js
│   │   │       ├── CreateCustomer.js
│   │   │       ├── UpdateCustomer.js
│   │   │       └── DeleteCustomer.js
│   │   ├── infrastructure/
│   │   │   └── DynamoCustomerRepository.js
│   │   └── handler.js
│   │
│   ├── charges/
│   │   ├── domain/
│   │   │   └── Charge.js
│   │   ├── application/
│   │   │   ├── ports/
│   │   │   │   └── IChargeRepository.js
│   │   │   └── use-cases/
│   │   │       ├── RegisterCharge.js
│   │   │       └── GetCharge.js
│   │   ├── infrastructure/
│   │   │   └── DynamoChargeRepository.js
│   │   └── handler.js
│   │
│   ├── credits/
│   │   ├── domain/
│   │   │   └── Credit.js
│   │   ├── application/
│   │   │   ├── ports/
│   │   │   │   └── ICreditRepository.js
│   │   │   └── use-cases/
│   │   │       ├── RegisterCredit.js
│   │   │       └── GetCreditBalance.js
│   │   ├── infrastructure/
│   │   │   └── DynamoCreditRepository.js
│   │   └── handler.js
│   │
│   ├── stats/
│   │   ├── application/
│   │   │   └── use-cases/
│   │   │       └── GetStatistics.js
│   │   └── handler.js
│   │
│   └── pos/
│       ├── domain/
│       │   ├── CashSession.js
│       │   ├── Sale.js
│       │   └── Ticket.js
│       ├── application/
│       │   ├── ports/
│       │   │   ├── ISessionRepository.js
│       │   │   └── ISaleRepository.js
│       │   └── use-cases/
│       │       ├── OpenSession.js
│       │       ├── CloseSession.js
│       │       ├── RegisterSale.js
│       │       ├── GetTicket.js
│       │       └── ListSalesBySession.js
│       ├── infrastructure/
│       │   ├── DynamoSessionRepository.js
│       │   └── DynamoSaleRepository.js
│       └── handler.js
│
└── tests/
    ├── unit/
    │   ├── products/
    │   ├── customers/
    │   ├── charges/
    │   ├── credits/
    │   ├── stats/
    │   └── pos/
    └── integration/
        └── api/
```
