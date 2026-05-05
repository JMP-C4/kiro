# Arquitectura del Sistema

## Visión General

La **Serverless Inventory API** es un sistema de gestión de inventario y punto de venta construido sobre AWS SAM. Expone una API REST a través de API Gateway, ejecuta lógica de negocio en funciones AWS Lambda (Node.js 20.x) y persiste datos en Amazon DynamoDB. El sistema sigue una **arquitectura hexagonal** con principios SOLID, separando claramente el dominio de negocio de los detalles de infraestructura.

### Objetivos de Diseño

- Separación estricta entre dominio, aplicación e infraestructura (Hexagonal Architecture)
- Cada módulo funcional es una Lambda independiente con responsabilidad única
- Validación centralizada en la capa de aplicación antes de tocar el dominio
- Respuestas de error consistentes en toda la API
- Escalabilidad automática mediante DynamoDB on-demand y Lambda concurrency

### Módulos del Sistema

| Módulo | Descripción |
|--------|-------------|
| Health Check | Estado y versión del sistema |
| Productos | CRUD del catálogo de inventario |
| Clientes | CRUD de compradores registrados |
| Cobros | Registro de transacciones de pago |
| Créditos | Saldos a favor de clientes |
| Estadísticas | Métricas e indicadores del inventario |
| POS | Sesiones de caja, ventas y tickets |

---

## Diagrama General

```mermaid
graph TB
    Client["Cliente HTTP<br/>(Frontend / Integración)"]

    subgraph AWS["AWS Cloud"]
        APIGW["API Gateway<br/>(REST API)"]
        Auth["Lambda Authorizer<br/>(JWT Validator)"]

        subgraph Lambdas["Funciones Lambda (Node.js 20.x)"]
            LH["HealthCheckFunction"]
            LP["ProductosFunction"]
            LC["ClientesFunction"]
            LCO["CobrosFunction"]
            LCR["CreditosFunction"]
            LS["StatsFunction"]
            LPOS["POSFunction"]
        end

        subgraph DynamoDB["Amazon DynamoDB"]
            TP["Tabla: Productos"]
            TCL["Tabla: Clientes"]
            TCO["Tabla: Cobros"]
            TCR["Tabla: Creditos"]
            TPOS["Tabla: POS_Sesiones"]
            TV["Tabla: POS_Ventas"]
        end

        CW["CloudWatch Logs & Metrics"]
    end

    Client -->|HTTPS| APIGW
    APIGW -->|Autoriza| Auth
    Auth -->|Token válido| Lambdas
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

    Lambdas -->|Logs estructurados| CW
```

---

## Flujo de una Solicitud HTTP

```mermaid
sequenceDiagram
    participant C as Cliente HTTP
    participant AG as API Gateway
    participant AU as Lambda Authorizer
    participant L as Lambda Handler
    participant V as Validator
    participant UC as Use Case
    participant R as Repository
    participant DB as DynamoDB

    C->>AG: HTTP Request + JWT
    AG->>AU: Verificar token
    AU-->>AG: Allow / Deny
    AG->>L: Evento Lambda
    L->>V: Validar input
    V-->>L: OK / Error 400
    L->>UC: Ejecutar caso de uso
    UC->>R: Operación de datos
    R->>DB: Query / PutItem / UpdateItem
    DB-->>R: Resultado
    R-->>UC: Entidad de dominio
    UC-->>L: Resultado
    L-->>AG: Respuesta HTTP
    AG-->>C: JSON Response
```

---

## Ciclo de Vida del Dato (Logic Flow)

```mermaid
flowchart TD
    A["Input HTTP<br/>(API Gateway Event)"] --> B["Handler<br/>Extrae método, path, body, headers"]
    B --> C["Validator<br/>Verifica campos obligatorios y tipos"]
    C -->|Inválido| E1["HTTP 400 / 409<br/>Error de validación"]
    C -->|Válido| D["Use Case<br/>Lógica de negocio pura"]
    D --> F["Repository Port<br/>(Interfaz)"]
    F --> G["DynamoDB Adapter<br/>(Implementación)"]
    G -->|PutItem / UpdateItem / Query| H["DynamoDB"]
    H --> G
    G --> F
    F --> D
    D -->|Entidad de dominio| I["ResponseBuilder<br/>Serializa a JSON"]
    I --> J["HTTP 200/201<br/>Respuesta exitosa"]
    D -->|Error de dominio| K["errorHandler<br/>Middleware"]
    K --> L["HTTP 404/409/500<br/>Error estructurado"]
```
