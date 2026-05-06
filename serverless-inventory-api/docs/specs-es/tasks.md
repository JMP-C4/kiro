# Plan de Implementación: Serverless Inventory API

## Visión General

Implementación incremental de una API REST serverless sobre AWS SAM con arquitectura hexagonal. El plan está organizado en **6 fases** que progresan desde la infraestructura base hasta el despliegue, permitiendo revisión y validación entre cada tarea.

**Stack:** Node.js 20.x · AWS SAM · API Gateway · DynamoDB · Jest · fast-check

**Convención de tareas opcionales:** Las sub-tareas marcadas con `*` son tests (unitarios o PBT) y pueden omitirse para un MVP más rápido, pero se recomienda ejecutarlas para alcanzar la cobertura mínima del 80%.

---

## Fase 1 — Setup: Inicialización del Proyecto

- [x] 1.1 Inicializar el proyecto SAM y configurar `package.json` raíz
  - Ejecutar `sam init` con runtime `nodejs20.x` y estructura de proyecto personalizada
  - Crear `package.json` raíz con scripts: `test`, `test:unit`, `test:integration`, `lint`
  - Instalar dependencias de producción: `@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`, `uuid`
  - Instalar dependencias de desarrollo: `jest`, `fast-check`, `aws-sdk-client-mock`, `eslint`
  - Configurar `jest.config.js` con `testEnvironment: node`, `coverageThreshold: 80%` y rutas de cobertura
  - _Requisitos: RNF (testing, cobertura 80%)_

- [x] 1.2 Crear la estructura de carpetas del proyecto
  - Crear árbol de directorios completo según `design/02-estructura-proyecto.md`
  - Directorios: `src/shared/`, `src/health/`, `src/productos/`, `src/clientes/`, `src/cobros/`, `src/creditos/`, `src/stats/`, `src/pos/`
  - Subdirectorios por módulo: `domain/`, `application/ports/`, `application/use-cases/`, `infrastructure/`
  - Crear `tests/unit/` y `tests/integration/api/` con subcarpetas por módulo
  - Crear `tests/arbitraries/` para los generadores fast-check compartidos
  - _Requisitos: Req-01 a Req-11 (estructura base para todos los módulos)_

- [x] 1.3 Implementar utilidades compartidas — Errores de dominio
  - Crear `src/shared/domain/errors/DomainError.js` con clase base (`message`, `code`, `statusCode`)
  - Crear `src/shared/domain/errors/NotFoundError.js` (HTTP 404, código `NOT_FOUND`)
  - Crear `src/shared/domain/errors/ValidationError.js` (HTTP 400, código `VALIDATION_ERROR`)
  - Crear `src/shared/domain/errors/ConflictError.js` (HTTP 409, código `CONFLICT`)
  - _Requisitos: Req-10 (RF-14, RF-15), RNF_

- [ ] 1.4 Implementar utilidades compartidas — Infraestructura y middleware
  - Crear `src/shared/domain/value-objects/UniqueId.js` usando `uuid` v4
  - Crear `src/shared/infrastructure/DynamoDBClient.js` como singleton con `DynamoDBDocumentClient`
  - Crear `src/shared/infrastructure/ResponseBuilder.js` con métodos `ok`, `created`, `noContent`, `error`
  - Crear `src/shared/middleware/errorHandler.js` que mapea `DomainError` a respuesta HTTP estructurada
  - Crear `src/shared/middleware/correlationId.js` que extrae o genera `X-Correlation-ID`
  - _Requisitos: Req-10 (RF-14, RF-15), RNF_

- [ ]* 1.5 Escribir tests unitarios para utilidades compartidas
  - Tests para `DomainError`, `NotFoundError`, `ValidationError`, `ConflictError`: verificar `statusCode` y `code`
  - Tests para `ResponseBuilder`: verificar estructura de respuesta para cada método
  - Tests para `errorHandler`: verificar mapeo de errores de dominio y errores no controlados
  - _Requisitos: Req-10_

- [ ]* 1.6 Escribir test de propiedad P-15 — Estructura de respuesta de error
  - **Propiedad P-15: Estructura de respuesta de error**
  - Para cualquier error (400, 401, 404, 409, 500), la respuesta JSON contiene `error` (string) y `codigo` (string) con `Content-Type: application/json`
  - Usar `fc.oneof(fc.constant(new NotFoundError('X')), fc.constant(new ValidationError('Y')), fc.constant(new ConflictError('Z')))` como arbitrario
  - **Valida: Req-10 (RF-14, RF-15)**

- [ ] 1.7 Checkpoint — Verificar setup inicial
  - Ejecutar `npm test` y confirmar que todos los tests del setup pasan
  - Verificar que la estructura de carpetas está completa
  - Confirmar que las dependencias están instaladas correctamente
  - Preguntar al usuario si hay ajustes antes de continuar con el dominio


---

## Fase 2 — Core Domain: Entidades y Ports

- [ ] 2.1 Implementar entidad de dominio `Producto`
  - Crear `src/productos/domain/Producto.js` con campos: `id`, `nombre`, `categoria`, `precio`, `stock`, `activo`, `fechaCreacion`
  - Incluir método estático `create(data)` que valida campos obligatorios y tipos (precio > 0, stock >= 0 entero)
  - Lanzar `ValidationError` si algún campo es inválido
  - _Requisitos: Req-02 (2.1–2.5), Req-03 (3.2–3.5), Req-04 (4.4), Req-05 (5.3)_

- [ ]* 2.2 Escribir tests unitarios para entidad `Producto`
  - Tests para `Producto.create()`: campos válidos, precio ≤ 0, stock negativo, campos faltantes
  - Verificar que `activo` es `true` por defecto y `fechaCreacion` es ISO 8601
  - _Requisitos: Req-03 (3.2–3.5)_

- [ ]* 2.3 Escribir test de propiedad P-05 (parcial) — Rechazo de entradas inválidas para Producto
  - **Propiedad P-05: Rechazo de entradas inválidas**
  - Usar `fc.record` con campos omitidos o valores fuera de rango (precio ≤ 0, stock negativo) → siempre lanza `ValidationError`
  - **Valida: Req-03 (3.2–3.5)**

- [ ] 2.4 Implementar entidad de dominio `Cliente`
  - Crear `src/clientes/domain/Cliente.js` con campos: `id`, `nombre`, `email`, `telefono`, `activo`, `fechaCreacion`
  - Incluir método estático `create(data)` con validación de formato email (regex básico)
  - Lanzar `ValidationError` si algún campo es inválido o email tiene formato incorrecto
  - _Requisitos: Req-06 (6.2, 6.3, 6.4, 6.9)_

- [ ]* 2.5 Escribir tests unitarios para entidad `Cliente`
  - Tests para `Cliente.create()`: email válido, email inválido, campos faltantes
  - _Requisitos: Req-06 (6.2, 6.3)_

- [ ] 2.6 Implementar entidades de dominio `Cobro` y `Credito`
  - Crear `src/cobros/domain/Cobro.js` con campos según `design/04-modelos-datos.md`
  - Incluir método estático `create(data)` con validación de `items` (array no vacío, cantidades > 0)
  - Crear `src/creditos/domain/Credito.js` con campos: `clienteId`, `saldo`, `historial`
  - Incluir método `aplicarCredito(monto)` que retorna `min(saldo, monto)` y nunca deja saldo negativo
  - _Requisitos: Req-07 (7.5, 7.6, 7.7), Req-08 (8.2, 8.4, 8.6, 8.7)_

- [ ]* 2.7 Escribir tests unitarios para `Cobro` y `Credito`
  - Tests para `Cobro.create()`: items válidos, items vacíos, cantidades inválidas
  - Tests para `Credito.aplicarCredito()`: monto menor al saldo, monto mayor al saldo, saldo cero
  - _Requisitos: Req-07 (7.7), Req-08 (8.6, 8.7)_

- [ ]* 2.8 Escribir test de propiedad P-13 — Saldo de crédito nunca negativo
  - **Propiedad P-13: Saldo de crédito nunca negativo**
  - Usar `fc.array(fc.record({ tipo: fc.constantFrom('asignacion', 'aplicacion'), monto: fc.float({ min: 0.01, max: 1000 }) }))` para generar secuencias de operaciones
  - Verificar que el saldo resultante es siempre `>= 0`
  - **Valida: Req-08 (8.6, 8.7)**

- [ ] 2.9 Implementar entidades de dominio POS: `SesionDeCaja`, `Venta` y `Ticket`
  - Crear `src/pos/domain/SesionDeCaja.js` con campos y método `cerrar(montoFinal)` que valida estado `"abierta"`
  - Crear `src/pos/domain/Venta.js` con validación de `metodoPago` (`"efectivo"`, `"tarjeta"`, `"credito"`)
  - Crear `src/pos/domain/Ticket.js` como proyección de `Venta` enriquecida con datos de sesión
  - _Requisitos: Req-11 (11.2, 11.3, 11.5, 11.6, 11.7, 11.10, 11.12)_

- [ ]* 2.10 Escribir tests unitarios para entidades POS
  - Tests para `SesionDeCaja.cerrar()`: sesión abierta, sesión ya cerrada (debe lanzar `ConflictError`)
  - Tests para `Venta.create()`: método de pago válido, método de pago inválido
  - _Requisitos: Req-11 (11.3, 11.5, 11.7)_

- [ ] 2.11 Implementar interfaces (Ports) de todos los módulos
  - Crear `src/productos/application/ports/IProductoRepository.js` con JSDoc de la interfaz
  - Crear `src/clientes/application/ports/IClienteRepository.js`
  - Crear `src/cobros/application/ports/ICobroRepository.js`
  - Crear `src/creditos/application/ports/ICreditoRepository.js`
  - Crear `src/pos/application/ports/ISesionRepository.js`
  - Crear `src/pos/application/ports/IVentaRepository.js`
  - Cada port define los métodos con JSDoc de parámetros y tipos de retorno (Promise)
  - _Requisitos: Req-02 a Req-11 (contratos de todos los módulos)_

- [ ] 2.12 Checkpoint — Verificar dominio y ports
  - Ejecutar `npm test` y confirmar que todos los tests del dominio pasan
  - Revisar que las entidades lanzan los errores correctos en casos inválidos
  - Preguntar al usuario si hay ajustes antes de continuar con los adapters


---

## Fase 3 — Infrastructure: Adapters DynamoDB

- [ ] 3.1 Implementar `DynamoProductoRepository`
  - Crear `src/productos/infrastructure/DynamoProductoRepository.js` implementando `IProductoRepository`
  - `findAll(filters)`: usa `scan` con `FilterExpression: activo = true`; si `categoria` presente, añade filtro exacto usando GSI `categoria-index`
  - `findById(id)`: usa `GetItem`; retorna `null` si no existe o `activo = false`
  - `save(producto)`: usa `PutItem`
  - `update(id, data)`: usa `UpdateItem` con expresión dinámica solo para campos presentes en `data`
  - `softDelete(id)`: usa `UpdateItem` para setear `activo = false`
  - _Requisitos: Req-02 (2.1–2.5), Req-03 (3.7), Req-04 (4.4), Req-05 (5.3)_

- [ ]* 3.2 Escribir tests unitarios para `DynamoProductoRepository`
  - Mockear `DynamoDBDocumentClient` con `aws-sdk-client-mock`
  - Tests para `findAll`: sin filtros, con filtro de categoría, solo retorna activos
  - Tests para `save`, `update`, `softDelete`: verificar comandos DynamoDB enviados
  - _Requisitos: Req-02, Req-03, Req-04, Req-05_

- [ ] 3.3 Implementar `DynamoClienteRepository`
  - Crear `src/clientes/infrastructure/DynamoClienteRepository.js` implementando `IClienteRepository`
  - `findByEmail(email)`: usa `Query` sobre GSI `email-index` para verificar unicidad
  - `findAll()`: usa `scan` con `FilterExpression: activo = true`
  - `findById(id)`: usa `GetItem`; retorna `null` si no existe o `activo = false`
  - `save`, `update`, `softDelete`: análogos a `DynamoProductoRepository`
  - _Requisitos: Req-06 (6.2, 6.4, 6.9)_

- [ ]* 3.4 Escribir tests unitarios para `DynamoClienteRepository`
  - Tests para `findByEmail`: email existente, email no existente
  - Tests para `findAll`, `findById`, `save`, `update`, `softDelete`
  - _Requisitos: Req-06_

- [ ] 3.5 Implementar `DynamoCobroRepository`
  - Crear `src/cobros/infrastructure/DynamoCobroRepository.js` implementando `ICobroRepository`
  - `findById(id)`: usa `GetItem`
  - `findByClienteId(clienteId)`: usa `Query` sobre GSI `clienteId-index` ordenado por `fechaCobro`
  - `save(cobro)`: usa `PutItem`
  - _Requisitos: Req-07 (7.1–7.7)_

- [ ] 3.6 Implementar `DynamoCreditoRepository`
  - Crear `src/creditos/infrastructure/DynamoCreditoRepository.js` implementando `ICreditoRepository`
  - `findSaldoByClienteId(clienteId)`: usa `GetItem` sobre tabla `Creditos`
  - `save(credito)`: usa `PutItem`
  - `decrementarSaldo(clienteId, monto)`: usa `UpdateItem` con `ConditionExpression: saldo >= :monto` para atomicidad; lanza `ConflictError` si condición falla
  - _Requisitos: Req-08 (8.6, 8.7)_

- [ ]* 3.7 Escribir tests unitarios para `DynamoCobroRepository` y `DynamoCreditoRepository`
  - Tests para `DynamoCobroRepository`: `findByClienteId` con GSI, `save`
  - Tests para `DynamoCreditoRepository`: `decrementarSaldo` exitoso, `decrementarSaldo` con saldo insuficiente
  - _Requisitos: Req-07, Req-08_

- [ ] 3.8 Implementar `DynamoSesionRepository` y `DynamoVentaRepository`
  - Crear `src/pos/infrastructure/DynamoSesionRepository.js` implementando `ISesionRepository`
  - `findAbiertaByCajeroId(cajeroId)`: usa `Query` sobre GSI `cajeroId-estado-index` con `estado = "abierta"`
  - `save`, `update`: operaciones estándar sobre tabla `POS_Sesiones`
  - Crear `src/pos/infrastructure/DynamoVentaRepository.js` implementando `IVentaRepository`
  - `findBySesionId(sesionId)`: usa `Query` sobre GSI `sesionId-index` ordenado por `fechaVenta` ascendente
  - `save`, `findById`: operaciones estándar sobre tabla `POS_Ventas`
  - _Requisitos: Req-11 (11.2, 11.8, 11.15, 11.16)_

- [ ]* 3.9 Escribir tests unitarios para `DynamoSesionRepository` y `DynamoVentaRepository`
  - Tests para `findAbiertaByCajeroId`: sesión abierta existente, sin sesión abierta
  - Tests para `findBySesionId`: ventas ordenadas por `fechaVenta`
  - _Requisitos: Req-11 (11.2, 11.15)_

- [ ] 3.10 Checkpoint — Verificar adapters DynamoDB
  - Ejecutar `npm test` y confirmar que todos los tests de infrastructure pasan
  - Verificar que los mocks de DynamoDB cubren los comandos correctos
  - Preguntar al usuario si hay ajustes antes de continuar con los use cases


---

## Fase 4 — Lambda Handlers: Use Cases y Handlers

### Módulo Health

- [ ] 4.1 Implementar handler de Health Check
  - Crear `src/health/handler.js` que responde `GET /health`
  - Retornar `{ status: "ok", version: process.env.APP_VERSION, timestamp: new Date().toISOString() }`
  - Usar `ResponseBuilder.ok()` para la respuesta
  - Propagar `X-Correlation-ID` usando el middleware `correlationId`
  - _Requisitos: Req-01 (1.1–1.4)_

- [ ]* 4.2 Escribir tests unitarios para handler Health
  - Tests: respuesta con `status: "ok"`, `version` refleja `APP_VERSION`, `timestamp` es ISO 8601
  - _Requisitos: Req-01_

- [ ]* 4.3 Escribir test de propiedad P-04 — Reflejo de versión del sistema
  - **Propiedad P-04: Reflejo de versión del sistema**
  - Usar `fc.string({ minLength: 1 })` como `APP_VERSION` → la respuesta contiene ese mismo valor en `version`
  - **Valida: Req-01 (1.4)**

### Módulo Productos

- [ ] 4.4 Implementar use cases de Productos
  - Crear `src/productos/application/use-cases/ListarProductos.js`: llama `repository.findAll(filters)`, retorna array
  - Crear `src/productos/application/use-cases/CrearProducto.js`: valida con `Producto.create()`, llama `repository.save()`, retorna producto creado
  - Crear `src/productos/application/use-cases/ActualizarProducto.js`: verifica existencia con `findById`, aplica `update`, retorna producto actualizado
  - Crear `src/productos/application/use-cases/EliminarProducto.js`: verifica existencia con `findById`, llama `softDelete`
  - _Requisitos: Req-02 (2.1–2.5), Req-03 (3.1–3.7), Req-04 (4.1–4.4), Req-05 (5.1–5.3)_

- [ ] 4.5 Implementar handler de Productos
  - Crear `src/productos/handler.js` que enruta por `httpMethod` y `pathParameters`
  - Parsear body JSON con manejo de `INVALID_BODY` si falla
  - Instanciar `DynamoProductoRepository` e inyectarlo en cada use case
  - Envolver toda la lógica en `try/catch` usando `errorHandler`
  - _Requisitos: Req-02, Req-03, Req-04, Req-05_

- [ ]* 4.6 Escribir tests unitarios para use cases de Productos
  - Tests para `ListarProductos`: con y sin filtro de categoría
  - Tests para `CrearProducto`: producto válido, campos faltantes, precio inválido
  - Tests para `ActualizarProducto`: producto existente, producto no encontrado
  - Tests para `EliminarProducto`: producto existente, producto no encontrado
  - _Requisitos: Req-02, Req-03, Req-04, Req-05_

- [ ]* 4.7 Escribir tests de propiedades P-01, P-02, P-03 — Filtrado y estructura de Productos
  - **Propiedad P-01: Filtrado de productos activos**
  - `fc.array(productoArbitrary())` → `ListarProductos` retorna solo los que tienen `activo = true`
  - **Valida: Req-02 (2.1, 2.5)**
  - **Propiedad P-02: Filtrado exacto por categoría**
  - `fc.array(productoArbitrary()) + fc.string({ minLength: 1 })` → solo productos de esa categoría exacta
  - **Valida: Req-02 (2.2, 2.3)**
  - **Propiedad P-03: Estructura completa de producto serializado**
  - `productoArbitrary()` → JSON contiene exactamente `id`, `nombre`, `categoria`, `precio`, `stock`, `fechaCreacion`
  - **Valida: Req-02 (2.4)**

- [ ]* 4.8 Escribir tests de propiedades P-06, P-07, P-08 — Unicidad, preservación y eliminación lógica
  - **Propiedad P-06: Unicidad de identificadores generados**
  - `fc.array` de llamadas a `CrearProducto` → todos los `id` son distintos
  - **Valida: Req-03 (3.7)**
  - **Propiedad P-07: Preservación de campos no actualizados**
  - `productoArbitrary() + fc.record` con subconjunto de campos → campos no incluidos conservan valores anteriores
  - **Valida: Req-04 (4.4)**
  - **Propiedad P-08: Eliminación lógica preserva el registro**
  - `EliminarProducto` → `activo = false` en DynamoDB, no aparece en `ListarProductos`
  - **Valida: Req-05 (5.3)**

### Módulo Clientes

- [ ] 4.9 Implementar use cases de Clientes
  - Crear `ListarClientes.js`, `ObtenerCliente.js`, `CrearCliente.js`, `ActualizarCliente.js`, `EliminarCliente.js`
  - `CrearCliente`: verificar unicidad de email con `repository.findByEmail()` antes de `save`; lanzar `ConflictError` si ya existe
  - `ObtenerCliente`: lanzar `NotFoundError` si no existe
  - `EliminarCliente`: soft delete con `activo = false`
  - _Requisitos: Req-06 (6.1–6.9)_

- [ ] 4.10 Implementar handler de Clientes
  - Crear `src/clientes/handler.js` con enrutamiento por método y path
  - Manejar rutas: `GET /clientes`, `POST /clientes`, `GET /clientes/{id}`, `PUT /clientes/{id}`, `DELETE /clientes/{id}`
  - _Requisitos: Req-06_

- [ ]* 4.11 Escribir tests unitarios para use cases de Clientes
  - Tests para `CrearCliente`: email único, email duplicado (→ ConflictError)
  - Tests para `ObtenerCliente`: cliente existente, cliente no encontrado (→ NotFoundError)
  - Tests para `ActualizarCliente`, `EliminarCliente`
  - _Requisitos: Req-06_

- [ ]* 4.12 Escribir tests de propiedades P-09 y P-08 (Clientes) — Unicidad de email y eliminación lógica
  - **Propiedad P-09: Unicidad de email de cliente**
  - `fc.emailAddress()` como email ya registrado → segundo `CrearCliente` con mismo email retorna `ConflictError`
  - **Valida: Req-06 (6.4)**
  - **Propiedad P-08 (Clientes): Eliminación lógica preserva el registro**
  - `EliminarCliente` → `activo = false`, no aparece en `ListarClientes`
  - **Valida: Req-06 (6.9)**

### Módulo Cobros

- [ ] 4.13 Implementar use case `RegistrarCobro`
  - Crear `src/cobros/application/use-cases/RegistrarCobro.js`
  - Verificar que cada `productoId` existe y tiene stock suficiente; lanzar `ConflictError` con código `INSUFFICIENT_STOCK` si no
  - Calcular `subtotal = Σ(precioUnitario × cantidad)`
  - Si `aplicarCredito = true`: obtener saldo con `creditoRepository.findSaldoByClienteId()`, calcular `creditoAplicado = min(saldo, subtotal)`, llamar `decrementarSaldo`
  - Calcular `total = subtotal - creditoAplicado`
  - Decrementar stock de cada producto con `productoRepository.update()`
  - Guardar cobro con `cobroRepository.save()`
  - _Requisitos: Req-07 (7.1–7.7)_

- [ ] 4.14 Implementar use case `ObtenerCobro` y handler de Cobros
  - Crear `src/cobros/application/use-cases/ObtenerCobro.js`: busca por `id`, lanza `NotFoundError` si no existe
  - Crear `src/cobros/application/use-cases/ListarCobrosPorCliente.js`: busca por `clienteId`
  - Crear `src/cobros/handler.js` con enrutamiento para `POST /cobros`, `GET /cobros/{id}`, `GET /cobros`
  - _Requisitos: Req-07_

- [ ]* 4.15 Escribir tests unitarios para use cases de Cobros
  - Tests para `RegistrarCobro`: cobro válido, stock insuficiente, crédito aplicado, crédito no aplicado
  - Tests para `ObtenerCobro`: cobro existente, cobro no encontrado
  - _Requisitos: Req-07_

- [ ]* 4.16 Escribir tests de propiedades P-10, P-11, P-12 — Cálculo, stock y atomicidad
  - **Propiedad P-10: Cálculo correcto del total de cobro**
  - `fc.array(itemArbitrary()) + fc.float` como saldo → `total = subtotal - min(saldo, subtotal)`
  - **Valida: Req-07 (7.7)**
  - **Propiedad P-11: Rechazo por stock insuficiente**
  - `fc.record` con `cantidad > stock` → siempre `ConflictError(INSUFFICIENT_STOCK)`, stock sin cambios
  - **Valida: Req-07 (7.5)**
  - **Propiedad P-12: Decremento atómico de stock post-cobro**
  - Cobro exitoso → `stock_nuevo = stock_anterior - cantidad` para cada producto
  - **Valida: Req-07 (7.6)**

### Módulo Créditos

- [ ] 4.17 Implementar use cases de Créditos y handler
  - Crear `src/creditos/application/use-cases/RegistrarCredito.js`: valida `monto > 0`, crea o actualiza registro en `Creditos`, añade entrada al `historial`
  - Crear `src/creditos/application/use-cases/ObtenerSaldoCredito.js`: retorna saldo del cliente; retorna `{ saldo: 0 }` si no existe registro
  - Crear `src/creditos/handler.js` con enrutamiento para `POST /creditos`, `GET /creditos/{clienteId}`
  - _Requisitos: Req-08 (8.1–8.7)_

- [ ]* 4.18 Escribir tests unitarios para use cases de Créditos
  - Tests para `RegistrarCredito`: monto válido, monto ≤ 0 (→ ValidationError), cliente sin registro previo
  - Tests para `ObtenerSaldoCredito`: cliente con saldo, cliente sin registro
  - _Requisitos: Req-08_

### Módulo Stats

- [ ] 4.19 Implementar use case `ObtenerEstadisticas` y handler
  - Crear `src/stats/application/use-cases/ObtenerEstadisticas.js`
  - Calcular: `totalProductos` (count activos), `totalStock` (suma stock activos), `distribucionPorCategoria` (mapa categoría → count), `productosConStockBajo` (activos con `stock < 5`)
  - Crear `src/stats/handler.js` para `GET /stats`
  - _Requisitos: Req-09 (9.1–9.5)_

- [ ]* 4.20 Escribir tests unitarios para `ObtenerEstadisticas`
  - Tests: sin productos, solo productos activos, mezcla activos/inactivos, productos con stock bajo
  - _Requisitos: Req-09_

- [ ]* 4.21 Escribir test de propiedad P-14 — Corrección de estadísticas
  - **Propiedad P-14: Corrección de estadísticas del inventario**
  - `fc.array(productoArbitrary())` → verificar que `totalProductos`, `totalStock`, `distribucionPorCategoria` y `productosConStockBajo` son matemáticamente correctos
  - **Valida: Req-09 (9.1–9.5)**

### Módulo POS

- [ ] 4.22 Implementar use cases de sesiones POS: `AbrirSesion` y `CerrarSesion`
  - Crear `src/pos/application/use-cases/AbrirSesion.js`: verificar que no existe sesión abierta para el cajero con `sesionRepository.findAbiertaByCajeroId()`; lanzar `ConflictError` si existe; crear y guardar nueva sesión
  - Crear `src/pos/application/use-cases/CerrarSesion.js`: obtener sesión por id; verificar estado `"abierta"` (lanzar `ConflictError` si ya cerrada); actualizar estado a `"cerrada"` con `fechaCierre` y `montoFinal`
  - _Requisitos: Req-11 (11.1–11.5)_

- [ ]* 4.23 Escribir tests unitarios para `AbrirSesion` y `CerrarSesion`
  - Tests para `AbrirSesion`: cajero sin sesión abierta, cajero con sesión ya abierta (→ ConflictError)
  - Tests para `CerrarSesion`: sesión abierta, sesión ya cerrada (→ ConflictError)
  - _Requisitos: Req-11 (11.2, 11.3, 11.5)_

- [ ]* 4.24 Escribir tests de propiedades P-16 y P-17 — Unicidad y transición de sesión
  - **Propiedad P-16: Unicidad de sesión abierta por cajero**
  - `fc.string()` como `cajeroId` con sesión abierta → segundo `AbrirSesion` retorna `ConflictError`
  - **Valida: Req-11 (11.2)**
  - **Propiedad P-17: Transición de estado de sesión de caja**
  - Sesión `"abierta"` → `CerrarSesion` cambia estado a `"cerrada"` y registra `fechaCierre`; sesión `"cerrada"` → `CerrarSesion` retorna `ConflictError`
  - **Valida: Req-11 (11.3, 11.5)**

- [ ] 4.25 Implementar use case `RegistrarVenta`
  - Crear `src/pos/application/use-cases/RegistrarVenta.js`
  - Verificar que la sesión existe y está `"abierta"`; lanzar `ConflictError` si cerrada
  - Validar `metodoPago` en `["efectivo", "tarjeta", "credito"]`; lanzar `ValidationError` si inválido
  - Verificar stock suficiente para cada item; lanzar `ConflictError(INSUFFICIENT_STOCK)` si no
  - Calcular `subtotal`, aplicar crédito si `metodoPago = "credito"`, calcular `total`
  - Decrementar stock de cada producto
  - Guardar venta con `ventaRepository.save()`
  - _Requisitos: Req-11 (11.6–11.11)_

- [ ]* 4.26 Escribir tests unitarios para `RegistrarVenta`
  - Tests: venta válida, sesión cerrada (→ ConflictError), método de pago inválido (→ ValidationError), stock insuficiente (→ ConflictError)
  - _Requisitos: Req-11 (11.7, 11.8, 11.9)_

- [ ]* 4.27 Escribir tests de propiedades P-18, P-22, P-10 (POS) — Venta en sesión cerrada, método de pago y cálculo
  - **Propiedad P-18: Rechazo de venta en sesión cerrada**
  - Sesión `"cerrada"` → `RegistrarVenta` retorna `ConflictError`
  - **Valida: Req-11 (11.8)**
  - **Propiedad P-22: Validación de método de pago**
  - `fc.string()` como `metodoPago` fuera del enum → siempre `ValidationError`
  - **Valida: Req-11 (11.7)**
  - **Propiedad P-10 (POS): Cálculo correcto del total de venta**
  - `fc.array(itemVentaArbitrary())` → `total = subtotal - creditoAplicado`
  - **Valida: Req-11 (11.6, 11.10)**

- [ ] 4.28 Implementar use cases `ObtenerTicket` y `ListarVentasPorSesion`
  - Crear `src/pos/application/use-cases/ObtenerTicket.js`: obtener venta por `ventaId`, obtener sesión por `sesionId`, construir `Ticket` con datos enriquecidos
  - Crear `src/pos/application/use-cases/ListarVentasPorSesion.js`: obtener ventas por `sesionId` ordenadas por `fechaVenta` ascendente
  - _Requisitos: Req-11 (11.12–11.16)_

- [ ]* 4.29 Escribir tests unitarios para `ObtenerTicket` y `ListarVentasPorSesion`
  - Tests para `ObtenerTicket`: venta existente con todos los campos del ticket, venta no encontrada
  - Tests para `ListarVentasPorSesion`: ventas ordenadas, sesión sin ventas
  - _Requisitos: Req-11 (11.12, 11.15)_

- [ ]* 4.30 Escribir tests de propiedades P-19, P-20, P-21 — Completitud, round-trip y orden
  - **Propiedad P-19: Completitud del ticket generado**
  - `ventaArbitrary()` → ticket contiene todos los campos requeridos: `ventaId`, `sesionId`, `cajeroId`, `clienteId`, `items`, `subtotal`, `creditoAplicado`, `total`, `metodoPago`, `fechaVenta`
  - **Valida: Req-11 (11.12)**
  - **Propiedad P-20: Round-trip de consulta de ticket**
  - Crear venta → `ObtenerTicket` retorna los mismos datos
  - **Valida: Req-11 (11.13)**
  - **Propiedad P-21: Orden ascendente de ventas por sesión**
  - `fc.array(ventaArbitrary())` → `ListarVentasPorSesion` retorna ventas ordenadas por `fechaVenta` ascendente
  - **Valida: Req-11 (11.15, 11.16)**

- [ ] 4.31 Implementar handler de POS
  - Crear `src/pos/handler.js` con enrutamiento para los 5 endpoints POS:
    - `POST /pos/sesiones` → `AbrirSesion`
    - `PUT /pos/sesiones/{sesionId}/cerrar` → `CerrarSesion`
    - `GET /pos/sesiones/{sesionId}/ventas` → `ListarVentasPorSesion`
    - `POST /pos/ventas` → `RegistrarVenta`
    - `GET /pos/ventas/{ventaId}/ticket` → `ObtenerTicket`
  - _Requisitos: Req-11_

- [ ] 4.32 Checkpoint — Verificar todos los handlers y use cases
  - Ejecutar `npm test` y confirmar que todos los tests de aplicación pasan
  - Verificar cobertura con `npm run test -- --coverage` (objetivo: ≥ 80% por módulo)
  - Preguntar al usuario si hay ajustes antes de continuar con IaC


---

## Fase 5 — Testing: Arbitrarios y Tests de Integración

- [ ] 5.1 Crear arbitrarios fast-check compartidos
  - Crear `tests/arbitraries/producto.js` con `productoArbitrary()` según `design/07-estrategia-testing.md`
  - Crear `tests/arbitraries/cliente.js` con `clienteArbitrary()` (incluye `fc.emailAddress()`)
  - Crear `tests/arbitraries/venta.js` con `itemVentaArbitrary()` y `ventaArbitrary()`
  - Crear `tests/arbitraries/cobro.js` con `itemCobroArbitrary()` y `cobroArbitrary()`
  - Configurar cada arbitrario con `numRuns: 100` como valor por defecto
  - _Requisitos: RNF (testing, cobertura 80%)_

- [ ]* 5.2 Escribir test de propiedad P-05 — Rechazo de entradas inválidas (cobertura global)
  - **Propiedad P-05: Rechazo de entradas inválidas**
  - Usar `fc.record` con campos omitidos o valores fuera de rango para cada módulo
  - Verificar que todos los use cases lanzan `ValidationError` (HTTP 400) sin crear ni modificar recursos
  - **Valida: Req-03 (3.2–3.5), Req-06 (6.2, 6.3), Req-08 (8.2, 8.4)**

- [ ]* 5.3 Escribir test de propiedad P-11 (POS) — Rechazo por stock insuficiente en ventas
  - **Propiedad P-11: Rechazo por stock insuficiente (POS)**
  - `fc.record` con `cantidad > stock` en `RegistrarVenta` → siempre `ConflictError(INSUFFICIENT_STOCK)`, stock sin cambios
  - **Valida: Req-11 (11.9)**

- [ ]* 5.4 Escribir test de propiedad P-12 (POS) — Decremento atómico de stock post-venta
  - **Propiedad P-12: Decremento atómico de stock post-venta**
  - Venta exitosa → `stock_nuevo = stock_anterior - cantidad` para cada producto incluido
  - **Valida: Req-11 (11.11)**

- [ ]* 5.5 Verificar cobertura de tests por módulo
  - Ejecutar `npm run test -- --coverage` y revisar reporte por módulo
  - Confirmar que cada módulo alcanza ≥ 80% de cobertura de líneas y ramas
  - Añadir tests unitarios adicionales en módulos que no alcancen el umbral
  - _Requisitos: RNF (cobertura mínima 80%)_

- [ ] 5.6 Checkpoint — Verificar cobertura y propiedades
  - Ejecutar suite completa de tests: `npm test`
  - Confirmar que los 22 tests PBT pasan con 100 iteraciones cada uno
  - Confirmar cobertura ≥ 80% en todos los módulos
  - Preguntar al usuario si hay ajustes antes de continuar con IaC


---

## Fase 6 — IaC & Deploy: SAM Template y CI/CD

- [ ] 6.1 Crear `template.yaml` — Recursos globales y tablas DynamoDB
  - Definir `AWSTemplateFormatVersion`, `Transform: AWS::Serverless-2016-10-31`, `Globals` (Runtime, MemorySize, Timeout, Environment)
  - Crear las 6 tablas DynamoDB con `BillingMode: PAY_PER_REQUEST`:
    - `ProductosTable` con GSI `categoria-index` (PK: `categoria`, SK: `fechaCreacion`)
    - `ClientesTable` con GSI `email-index` (PK: `email`)
    - `CobrosTable` con GSI `clienteId-index` (PK: `clienteId`, SK: `fechaCobro`)
    - `CreditosTable` (PK: `clienteId`, sin GSI)
    - `POSSesionesTable` con GSI `cajeroId-estado-index` (PK: `cajeroId`, SK: `estado`)
    - `POSVentasTable` con GSI `sesionId-index` (PK: `sesionId`, SK: `fechaVenta`)
  - _Requisitos: Req-02 a Req-11 (persistencia de todos los módulos)_

- [ ] 6.2 Crear `template.yaml` — API Gateway y Lambda Authorizer
  - Definir `AWS::Serverless::Api` con `StageName: !Ref Env`, CORS habilitado, y `Auth` con `DefaultAuthorizer`
  - Definir `LambdaAuthorizerFunction` con handler para validación JWT
  - Configurar variables de entorno: `JWT_SECRET`, `APP_VERSION`, nombres de tablas DynamoDB
  - _Requisitos: RNF (seguridad, autenticación JWT)_

- [ ] 6.3 Crear `template.yaml` — Funciones Lambda
  - Definir las 7 funciones Lambda con sus eventos `Api` correspondientes:
    - `HealthCheckFunction`: `GET /health`
    - `ProductosFunction`: `GET/POST /productos`, `GET/PUT/DELETE /productos/{id}`
    - `ClientesFunction`: `GET/POST /clientes`, `GET/PUT/DELETE /clientes/{id}`
    - `CobrosFunction`: `POST /cobros`, `GET /cobros/{id}`, `GET /cobros`
    - `CreditosFunction`: `POST /creditos`, `GET /creditos/{clienteId}`
    - `StatsFunction`: `GET /stats`
    - `POSFunction`: los 5 endpoints `/pos/*`
  - Asignar políticas IAM mínimas (`DynamoDBCrudPolicy`) por función según tablas que accede
  - _Requisitos: Req-01 a Req-11_

- [ ] 6.4 Crear `samconfig.toml` con configuración de entornos
  - Definir perfil `default` para entorno `dev` con `stack_name`, `region`, `capabilities: CAPABILITY_IAM`
  - Definir perfil `prod` con parámetros de producción
  - Incluir parámetros: `Env`, `JwtSecret` como `SecureString` de SSM
  - _Requisitos: RNF (escalabilidad, despliegue)_

- [ ] 6.5 Crear `template.yaml` — Outputs y parámetros
  - Definir `Parameters`: `Env` (dev/staging/prod), `JwtSecret`
  - Definir `Outputs`: `ApiUrl`, `HealthCheckUrl`, nombres de tablas DynamoDB
  - Verificar que el template es válido con `sam validate`
  - _Requisitos: RNF_

- [ ]* 6.6 Crear script de CI/CD básico
  - Crear `.github/workflows/deploy.yml` (o equivalente) con pasos: `npm install`, `npm test`, `sam build`, `sam deploy`
  - Configurar secrets de GitHub: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `JWT_SECRET`
  - _Requisitos: RNF (despliegue automatizado)_

- [ ] 6.7 Checkpoint final — Verificar template SAM y despliegue
  - Ejecutar `sam validate` para verificar sintaxis del template
  - Ejecutar `sam build` para confirmar que todas las funciones compilan correctamente
  - Ejecutar `npm test` una última vez para confirmar que todos los tests pasan
  - Preguntar al usuario si hay ajustes finales antes de dar por completada la implementación

---

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido, pero se recomienda ejecutarlas para alcanzar la cobertura mínima del 80%
- Cada tarea referencia requisitos específicos para trazabilidad completa
- Los checkpoints al final de cada fase garantizan validación incremental
- Los tests PBT validan las 22 propiedades de corrección definidas en `design/05-propiedades-correccion.md`
- Los tests unitarios validan casos concretos y condiciones de error
- La inyección de dependencias (ports) permite mockear repositorios en todos los tests sin DynamoDB real
