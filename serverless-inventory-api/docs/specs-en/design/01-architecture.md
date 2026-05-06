# System Architecture

## Overview

The **Serverless Inventory API** is an inventory management and point of sale system built on AWS SAM. It exposes a REST API through API Gateway, executes business logic in AWS Lambda functions (Node.js 20.x), and persists data in Amazon DynamoDB. The system follows **hexagonal architecture** with SOLID principles, clearly separating business domain from infrastructure details.

### Design Goals

- Strict separation between domain, application, and infrastructure (Hexagonal Architecture)
- Each functional module is an independent Lambda with single responsibility
- Centralized validation in the application layer before touching the domain
- Consistent error responses throughout the API
- Automatic scalability via DynamoDB on-demand and Lambda concurrency

### System Modules

| Module | Description |
|--------|-------------|
| Health Check | System status and version |
| Products | Inventory catalog CRUD |
| Customers | Registered buyers CRUD |
| Charges | Payment transaction registration |
| Credits | Customer credit balances |
| Statistics | Inventory metrics and indicators |
| POS | Cash sessions, sales, and tickets |

---

## General Diagram

```mermaid
graph TB
    Client["HTTP Client<br/>(Frontend / Integration)"]

    subgraph AWS["AWS Cloud"]
        APIGW["API Gateway<br/>(REST API)"]
        Auth["Lambda Authorizer<br/>(JWT Validator)"]

        subgraph Lambdas["Lambda Functions (Node.js 20.x)"]
            LH["HealthCheckFunction"]
            LP["ProductsFunction"]
            LC["CustomersFunction"]
            LCO["ChargesFunction"]
            LCR["CreditsFunction"]
            LS["StatsFunction"]
            LPOS["POSFunction"]
        end

        subgraph DynamoDB["Amazon DynamoDB"]
            TP["Table: Products"]
            TCL["Table: Customers"]
            TCO["Table: Charges"]
            TCR["Table: Credits"]
            TPOS["Table: POS_Sessions"]
            TV["Table: POS_Sales"]
        end

        CW["CloudWatch Logs & Metrics"]
    end

    Client -->|HTTPS| APIGW
    APIGW -->|Authorize| Auth
    Auth -->|Valid token| Lambdas
    APIGW --> LH
    APIGW --> LP
    APIGW --> LC
    APIGW --> LCO
    APIGW --> LCR
    APIGW --> LS
    APIGW --> LPOS

    LP <-->|R/W| TP
    LC <-->|R/W| TCL
    LCO <-->|R/W| TCO
    LCO <-->|R/W| TP
    LCO <-->|R/W| TCR
    LCR <-->|R/W| TCR
    LCR <-->|R| TCL
    LS <-->|R| TP
    LPOS <-->|R/W| TPOS
    LPOS <-->|R/W| TV
    LPOS <-->|R/W| TP
    LPOS <-->|R/W| TCR

    Lambdas -->|Structured logs| CW
```

---

## HTTP Request Flow

```mermaid
sequenceDiagram
    participant C as HTTP Client
    participant AG as API Gateway
    participant AU as Lambda Authorizer
    participant L as Lambda Handler
    participant V as Validator
    participant UC as Use Case
    participant R as Repository
    participant DB as DynamoDB

    C->>AG: HTTP Request + JWT
    AG->>AU: Verify token
    AU-->>AG: Allow / Deny
    AG->>L: Lambda Event
    L->>V: Validate input
    V-->>L: OK / Error 400
    L->>UC: Execute use case
    UC->>R: Data operation
    R->>DB: Query / PutItem / UpdateItem
    DB-->>R: Result
    R-->>UC: Domain entity
    UC-->>L: Result
    L-->>AG: HTTP Response
    AG-->>C: JSON Response
```

---

## Data Lifecycle (Logic Flow)

```mermaid
flowchart TD
    A["HTTP Input<br/>(API Gateway Event)"] --> B["Handler<br/>Extracts method, path, body, headers"]
    B --> C["Validator<br/>Checks required fields and types"]
    C -->|Invalid| E1["HTTP 400 / 409<br/>Validation error"]
    C -->|Valid| D["Use Case<br/>Pure business logic"]
    D --> F["Repository Port<br/>(Interface)"]
    F --> G["DynamoDB Adapter<br/>(Implementation)"]
    G -->|PutItem / UpdateItem / Query| H["DynamoDB"]
    H --> G
    G --> F
    F --> D
    D -->|Domain entity| I["ResponseBuilder<br/>Serializes to JSON"]
    I --> J["HTTP 200/201<br/>Successful response"]
    D -->|Domain error| K["errorHandler<br/>Middleware"]
    K --> L["HTTP 404/409/500<br/>Structured error"]
```
