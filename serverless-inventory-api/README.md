# Serverless Inventory API

API REST serverless para gestión de inventario, construida sobre AWS SAM con arquitectura hexagonal.

## Stack

- **Runtime:** Node.js 20.x
- **Framework IaC:** AWS SAM (Serverless Application Model)
- **API:** Amazon API Gateway (REST)
- **Base de datos:** Amazon DynamoDB
- **Testing:** Jest + fast-check (property-based testing)
- **Linting:** ESLint

## Módulos

| Módulo | Descripción |
|--------|-------------|
| `health` | Health check del sistema |
| `productos` | CRUD de productos del inventario |
| `clientes` | CRUD de clientes |
| `cobros` | Registro y consulta de cobros |
| `creditos` | Gestión de saldo de crédito por cliente |
| `stats` | Estadísticas del inventario |
| `pos` | Punto de venta (sesiones y ventas) |

## Estructura de carpetas

```
serverless-inventory-api/
├── template.yaml          # Definición SAM
├── samconfig.toml         # Configuración de despliegue
├── package.json           # Dependencias y scripts
├── jest.config.js         # Configuración de Jest
├── .eslintrc.js           # Configuración de ESLint
│
├── src/
│   ├── shared/            # Utilidades compartidas (errores, middleware, infra)
│   ├── health/            # Handler de health check
│   ├── productos/         # Módulo de productos
│   ├── clientes/          # Módulo de clientes
│   ├── cobros/            # Módulo de cobros
│   ├── creditos/          # Módulo de créditos
│   ├── stats/             # Módulo de estadísticas
│   └── pos/               # Módulo de punto de venta
│
└── tests/
    ├── unit/              # Tests unitarios por módulo
    ├── integration/       # Tests de integración
    └── arbitraries/       # Generadores fast-check compartidos
```

Cada módulo sigue la arquitectura hexagonal:

```
<modulo>/
├── domain/                # Entidades y reglas de negocio
├── application/
│   ├── ports/             # Interfaces (contratos de repositorios)
│   └── use-cases/         # Casos de uso de la aplicación
├── infrastructure/        # Adaptadores DynamoDB
└── handler.js             # Punto de entrada Lambda
```

## Comandos de desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar todos los tests con cobertura
npm test

# Ejecutar solo tests unitarios
npm run test:unit

# Ejecutar solo tests de integración
npm run test:integration

# Ejecutar tests en modo watch
npm run test:watch

# Linting
npm run lint

# Linting con auto-fix
npm run lint:fix
```

## Despliegue con SAM

```bash
# Build
sam build

# Deploy (primera vez — modo guiado)
sam deploy --guided

# Deploy subsiguientes
sam deploy

# Ejecutar localmente
sam local start-api
```

## Variables de entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `NODE_ENV` | Entorno de ejecución | `dev` |
| `APP_VERSION` | Versión de la aplicación | `1.0.0` |
| `PRODUCTOS_TABLE` | Nombre de la tabla DynamoDB de productos | — |
| `CLIENTES_TABLE` | Nombre de la tabla DynamoDB de clientes | — |
| `COBROS_TABLE` | Nombre de la tabla DynamoDB de cobros | — |
| `CREDITOS_TABLE` | Nombre de la tabla DynamoDB de créditos | — |
| `POS_SESIONES_TABLE` | Nombre de la tabla DynamoDB de sesiones POS | — |
| `POS_VENTAS_TABLE` | Nombre de la tabla DynamoDB de ventas POS | — |

## Cobertura de tests

El proyecto requiere una cobertura mínima del **80%** en líneas, ramas, funciones y sentencias. La configuración de umbral está definida en `jest.config.js`.
