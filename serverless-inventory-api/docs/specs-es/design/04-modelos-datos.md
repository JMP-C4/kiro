# Modelos de Datos

## Entidades de Dominio

### Producto

```javascript
// src/productos/domain/Producto.js
{
  id: string,           // UUID v4 — Partition Key
  nombre: string,       // Requerido, no vacío
  categoria: string,    // Requerido, no vacío
  precio: number,       // > 0
  stock: number,        // >= 0, entero
  activo: boolean,      // true por defecto; false = eliminación lógica
  fechaCreacion: string // ISO 8601
}
```

### Cliente

```javascript
// src/clientes/domain/Cliente.js
{
  id: string,           // UUID v4 — Partition Key
  nombre: string,       // Requerido, no vacío
  email: string,        // Formato email válido, único en el sistema
  telefono: string,     // Requerido, no vacío
  activo: boolean,      // true por defecto
  fechaCreacion: string // ISO 8601
}
```

### Cobro

```javascript
// src/cobros/domain/Cobro.js
{
  id: string,              // UUID v4 — Partition Key
  clienteId: string,       // FK → Cliente.id
  items: [
    {
      productoId: string,  // FK → Producto.id
      cantidad: number,    // Entero > 0
      precioUnitario: number
    }
  ],
  subtotal: number,
  creditoAplicado: number, // >= 0
  total: number,           // subtotal - creditoAplicado
  aplicarCredito: boolean,
  fechaCobro: string       // ISO 8601
}
```

### Credito

```javascript
// src/creditos/domain/Credito.js
{
  clienteId: string,   // Partition Key (saldo acumulado por cliente)
  saldo: number,       // >= 0
  historial: [
    {
      monto: number,
      tipo: "asignacion" | "aplicacion",
      fecha: string    // ISO 8601
    }
  ]
}
```

### SesionDeCaja

```javascript
// src/pos/domain/SesionDeCaja.js
{
  id: string,           // UUID v4 — Partition Key
  cajeroId: string,     // Identificador del cajero
  estado: "abierta" | "cerrada",
  montoInicial: number, // >= 0
  montoFinal: number,   // >= 0, sólo presente al cerrar
  fechaApertura: string,// ISO 8601
  fechaCierre: string   // ISO 8601, sólo presente al cerrar
}
```

### Venta

```javascript
// src/pos/domain/Venta.js
{
  id: string,              // UUID v4 — Partition Key
  sesionId: string,        // FK → SesionDeCaja.id
  clienteId: string,       // FK → Cliente.id
  items: [
    {
      productoId: string,
      nombre: string,
      cantidad: number,
      precioUnitario: number
    }
  ],
  subtotal: number,
  creditoAplicado: number,
  total: number,
  metodoPago: "efectivo" | "tarjeta" | "credito",
  fechaVenta: string       // ISO 8601
}
```

### Ticket

```javascript
// src/pos/domain/Ticket.js
// Proyección de la Venta enriquecida con datos de sesión
{
  ventaId: string,
  sesionId: string,
  cajeroId: string,
  clienteId: string,
  items: [
    {
      nombre: string,
      cantidad: number,
      precioUnitario: number
    }
  ],
  subtotal: number,
  creditoAplicado: number,
  total: number,
  metodoPago: string,
  fechaVenta: string
}
```

---

## Tablas DynamoDB

### Tabla: `Productos`

| Atributo | Tipo | Rol |
|----------|------|-----|
| `id` | String | Partition Key (PK) |
| `nombre` | String | Atributo |
| `categoria` | String | Atributo / GSI |
| `precio` | Number | Atributo |
| `stock` | Number | Atributo |
| `activo` | Boolean | Atributo |
| `fechaCreacion` | String | Atributo |

- **GSI-1**: `categoria-index` → PK: `categoria`, SK: `fechaCreacion`

### Tabla: `Clientes`

| Atributo | Tipo | Rol |
|----------|------|-----|
| `id` | String | Partition Key (PK) |
| `nombre` | String | Atributo |
| `email` | String | Atributo / GSI |
| `telefono` | String | Atributo |
| `activo` | Boolean | Atributo |
| `fechaCreacion` | String | Atributo |

- **GSI-1**: `email-index` → PK: `email` (unicidad de email)

### Tabla: `Cobros`

| Atributo | Tipo | Rol |
|----------|------|-----|
| `id` | String | Partition Key (PK) |
| `clienteId` | String | Atributo / GSI |
| `items` | List | Atributo |
| `subtotal` | Number | Atributo |
| `creditoAplicado` | Number | Atributo |
| `total` | Number | Atributo |
| `fechaCobro` | String | Sort Key en GSI |

- **GSI-1**: `clienteId-index` → PK: `clienteId`, SK: `fechaCobro`

### Tabla: `Creditos`

| Atributo | Tipo | Rol |
|----------|------|-----|
| `clienteId` | String | Partition Key (PK) |
| `saldo` | Number | Atributo |
| `historial` | List | Atributo |

- Un ítem por cliente. Saldo actualizado con `UpdateItem` + `ConditionExpression` para evitar saldo negativo.

### Tabla: `POS_Sesiones`

| Atributo | Tipo | Rol |
|----------|------|-----|
| `id` | String | Partition Key (PK) |
| `cajeroId` | String | Atributo / GSI |
| `estado` | String | Atributo |
| `montoInicial` | Number | Atributo |
| `montoFinal` | Number | Atributo |
| `fechaApertura` | String | Atributo |
| `fechaCierre` | String | Atributo |

- **GSI-1**: `cajeroId-estado-index` → PK: `cajeroId`, SK: `estado`

### Tabla: `POS_Ventas`

| Atributo | Tipo | Rol |
|----------|------|-----|
| `id` | String | Partition Key (PK) |
| `sesionId` | String | Atributo / GSI |
| `clienteId` | String | Atributo |
| `items` | List | Atributo |
| `subtotal` | Number | Atributo |
| `creditoAplicado` | Number | Atributo |
| `total` | Number | Atributo |
| `metodoPago` | String | Atributo |
| `fechaVenta` | String | Sort Key en GSI |

- **GSI-1**: `sesionId-index` → PK: `sesionId`, SK: `fechaVenta` (historial ordenado ascendente)
