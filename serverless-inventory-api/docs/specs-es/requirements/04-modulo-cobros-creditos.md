# Módulo: Cobros y Créditos

## Requisito 7 — Sistema de Cobros

**User Story:** Como cajero, quiero registrar cobros asociados a clientes y productos, para llevar un control de las transacciones de venta.

### Criterios de Aceptación

1. WHEN una solicitud POST es recibida en `/cobros` con un cuerpo JSON válido, THE API SHALL registrar el cobro y retornar un código HTTP 201 con el objeto del cobro creado, incluyendo su `id` generado y el `total` calculado.
2. THE Validator SHALL verificar que el cuerpo de la solicitud contenga los campos obligatorios: `clienteId` (string no vacío) y `items` (arreglo no vacío de objetos con `productoId` y `cantidad`).
3. IF el `clienteId` no corresponde a ningún cliente activo, THEN THE API SHALL retornar un código HTTP 404 con el mensaje `"Cliente no encontrado"`.
4. IF algún `productoId` dentro de `items` no corresponde a ningún producto activo, THEN THE API SHALL retornar un código HTTP 404 con el mensaje `"Producto no encontrado: {productoId}"`.
5. IF la `cantidad` solicitada de un producto supera el `stock` disponible, THEN THE API SHALL retornar un código HTTP 409 con el mensaje `"Stock insuficiente para el producto: {productoId}"`.
6. WHEN un cobro es registrado exitosamente, THE Repository SHALL decrementar el `stock` de cada producto incluido en el cobro según la `cantidad` indicada.
7. THE API SHALL calcular el `total` del cobro como la suma de `precio * cantidad` para cada ítem, aplicando los créditos disponibles del cliente si el campo `aplicarCredito` es `true`.
8. WHEN una solicitud GET es recibida en `/cobros/{id}`, THE API SHALL retornar un código HTTP 200 con el objeto del cobro correspondiente.
9. WHEN una solicitud GET es recibida en `/cobros` con el parámetro `clienteId`, THE API SHALL retornar un código HTTP 200 con todos los cobros asociados a ese cliente.

---

## Requisito 8 — Sistema de Créditos

**User Story:** Como administrador financiero, quiero gestionar créditos asignados a clientes, para permitir que los clientes apliquen saldos a favor en sus cobros.

### Criterios de Aceptación

1. WHEN una solicitud POST es recibida en `/creditos` con un cuerpo JSON válido, THE API SHALL registrar el crédito y retornar un código HTTP 201 con el objeto del crédito creado.
2. THE Validator SHALL verificar que el cuerpo de la solicitud contenga los campos obligatorios: `clienteId` (string no vacío) y `monto` (número mayor a 0).
3. IF el `clienteId` no corresponde a ningún cliente activo, THEN THE API SHALL retornar un código HTTP 404 con el mensaje `"Cliente no encontrado"`.
4. IF el campo `monto` contiene un valor menor o igual a 0, THEN THE Validator SHALL retornar un código HTTP 400 con el mensaje `"El monto del crédito debe ser mayor a 0"`.
5. WHEN una solicitud GET es recibida en `/creditos/{clienteId}`, THE API SHALL retornar un código HTTP 200 con el saldo total de créditos disponibles del cliente.
6. WHEN un crédito es aplicado en un cobro, THE Repository SHALL decrementar el saldo de crédito del cliente por el monto aplicado, sin que el saldo resultante sea negativo.
7. IF el saldo de crédito disponible del cliente es menor al monto a aplicar en un cobro, THEN THE API SHALL aplicar únicamente el saldo disponible y registrar el monto restante como deuda en el cobro.
