# Estructura del Proyecto SAM

```
serverless-inventory-api/
├── template.yaml                    # Definición SAM (API Gateway + Lambdas + DynamoDB)
├── samconfig.toml                   # Configuración de despliegue por entorno
├── package.json                     # Dependencias raíz (shared)
│
├── src/
│   ├── shared/                      # Código compartido entre módulos
│   │   ├── domain/
│   │   │   ├── errors/
│   │   │   │   ├── DomainError.js
│   │   │   │   ├── NotFoundError.js
│   │   │   │   ├── ValidationError.js
│   │   │   │   └── ConflictError.js
│   │   │   └── value-objects/
│   │   │       └── UniqueId.js
│   │   ├── infrastructure/
│   │   │   ├── DynamoDBClient.js    # Cliente DynamoDB singleton
│   │   │   └── ResponseBuilder.js  # Construcción de respuestas HTTP
│   │   └── middleware/
│   │       ├── errorHandler.js      # Middleware global de errores
│   │       └── correlationId.js     # Propagación X-Correlation-ID
│   │
│   ├── health/
│   │   └── handler.js
│   │
│   ├── productos/
│   │   ├── domain/
│   │   │   └── Producto.js
│   │   ├── application/
│   │   │   ├── ports/
│   │   │   │   └── IProductoRepository.js
│   │   │   └── use-cases/
│   │   │       ├── ListarProductos.js
│   │   │       ├── CrearProducto.js
│   │   │       ├── ActualizarProducto.js
│   │   │       └── EliminarProducto.js
│   │   ├── infrastructure/
│   │   │   └── DynamoProductoRepository.js
│   │   └── handler.js
│   │
│   ├── clientes/
│   │   ├── domain/
│   │   │   └── Cliente.js
│   │   ├── application/
│   │   │   ├── ports/
│   │   │   │   └── IClienteRepository.js
│   │   │   └── use-cases/
│   │   │       ├── ListarClientes.js
│   │   │       ├── ObtenerCliente.js
│   │   │       ├── CrearCliente.js
│   │   │       ├── ActualizarCliente.js
│   │   │       └── EliminarCliente.js
│   │   ├── infrastructure/
│   │   │   └── DynamoClienteRepository.js
│   │   └── handler.js
│   │
│   ├── cobros/
│   │   ├── domain/
│   │   │   └── Cobro.js
│   │   ├── application/
│   │   │   ├── ports/
│   │   │   │   └── ICobroRepository.js
│   │   │   └── use-cases/
│   │   │       ├── RegistrarCobro.js
│   │   │       └── ObtenerCobro.js
│   │   ├── infrastructure/
│   │   │   └── DynamoCobroRepository.js
│   │   └── handler.js
│   │
│   ├── creditos/
│   │   ├── domain/
│   │   │   └── Credito.js
│   │   ├── application/
│   │   │   ├── ports/
│   │   │   │   └── ICreditoRepository.js
│   │   │   └── use-cases/
│   │   │       ├── RegistrarCredito.js
│   │   │       └── ObtenerSaldoCredito.js
│   │   ├── infrastructure/
│   │   │   └── DynamoCreditoRepository.js
│   │   └── handler.js
│   │
│   ├── stats/
│   │   ├── application/
│   │   │   └── use-cases/
│   │   │       └── ObtenerEstadisticas.js
│   │   └── handler.js
│   │
│   └── pos/
│       ├── domain/
│       │   ├── SesionDeCaja.js
│       │   ├── Venta.js
│       │   └── Ticket.js
│       ├── application/
│       │   ├── ports/
│       │   │   ├── ISesionRepository.js
│       │   │   └── IVentaRepository.js
│       │   └── use-cases/
│       │       ├── AbrirSesion.js
│       │       ├── CerrarSesion.js
│       │       ├── RegistrarVenta.js
│       │       ├── ObtenerTicket.js
│       │       └── ListarVentasPorSesion.js
│       ├── infrastructure/
│       │   ├── DynamoSesionRepository.js
│       │   └── DynamoVentaRepository.js
│       └── handler.js
│
└── tests/
    ├── unit/
    │   ├── productos/
    │   ├── clientes/
    │   ├── cobros/
    │   ├── creditos/
    │   ├── stats/
    │   └── pos/
    └── integration/
        └── api/
```
