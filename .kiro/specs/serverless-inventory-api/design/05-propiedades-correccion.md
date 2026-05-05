# Propiedades de Corrección

*Una propiedad es una característica o comportamiento que debe cumplirse en todas las ejecuciones válidas del sistema. Sirven como puente entre las especificaciones legibles por humanos y las garantías de corrección verificables por máquinas.*

---

| # | Propiedad | Valida Requisitos |
|---|-----------|-------------------|
| P-01 | Filtrado de productos activos | 2.1, 2.5 |
| P-02 | Filtrado exacto por categoría | 2.2, 2.3 |
| P-03 | Estructura completa de producto serializado | 2.4 |
| P-04 | Reflejo de versión del sistema | 1.4 |
| P-05 | Rechazo de entradas inválidas | 3.2–3.5, 6.2, 6.3, 8.2, 8.4 |
| P-06 | Unicidad de identificadores generados | 3.7 |
| P-07 | Preservación de campos no actualizados | 4.4 |
| P-08 | Eliminación lógica preserva el registro | 5.3, 6.9 |
| P-09 | Unicidad de email de cliente | 6.4 |
| P-10 | Cálculo correcto del total de cobro/venta | 7.7, 11.6, 11.10 |
| P-11 | Rechazo por stock insuficiente | 7.5, 11.9 |
| P-12 | Decremento atómico de stock post-cobro/venta | 7.6, 11.11 |
| P-13 | Saldo de crédito nunca negativo | 8.6, 8.7 |
| P-14 | Corrección de estadísticas del inventario | 9.1–9.5 |
| P-15 | Estructura de respuesta de error | 10.1 |
| P-16 | Unicidad de sesión abierta por cajero | 11.2 |
| P-17 | Transición de estado de sesión de caja | 11.3, 11.5 |
| P-18 | Rechazo de venta en sesión cerrada | 11.8 |
| P-19 | Completitud del ticket generado | 11.12 |
| P-20 | Round-trip de consulta de ticket | 11.13 |
| P-21 | Orden ascendente de ventas por sesión | 11.15, 11.16 |
| P-22 | Validación de método de pago | 11.7 |

---

## Detalle de Propiedades

### P-01: Filtrado de productos activos
*Para cualquier* colección de productos (mezcla de activos e inactivos), GET `/productos` debe retornar únicamente los que tienen `activo = true`.

### P-02: Filtrado exacto por categoría
*Para cualquier* categoría y colección de productos, GET `/productos?categoria={X}` retorna solo los que coinciden exactamente. Si ninguno coincide → arreglo vacío.

### P-03: Estructura completa de producto serializado
*Para cualquier* producto activo, su JSON debe contener exactamente: `id`, `nombre`, `categoria`, `precio`, `stock`, `fechaCreacion`.

### P-04: Reflejo de versión del sistema
*Para cualquier* valor en `APP_VERSION`, la respuesta de `/health` debe contener ese mismo valor en el campo `version`.

### P-05: Rechazo de entradas inválidas
*Para cualquier* solicitud que omita un campo obligatorio o incluya un valor fuera de rango (precio ≤ 0, stock negativo, monto ≤ 0, email inválido) → HTTP 400, sin crear ni modificar el recurso.

### P-06: Unicidad de identificadores generados
*Para cualquier* conjunto de recursos creados, todos los `id` asignados deben ser distintos entre sí.

### P-07: Preservación de campos no actualizados
*Para cualquier* PUT con subconjunto de campos, los campos no incluidos conservan exactamente sus valores anteriores.

### P-08: Eliminación lógica preserva el registro
*Para cualquier* DELETE, el registro persiste en DynamoDB con `activo = false` y no aparece en listados activos.

### P-09: Unicidad de email de cliente
*Para cualquier* email ya registrado, un nuevo cliente con ese email → HTTP 409, sin crear duplicado.

### P-10: Cálculo correcto del total de cobro/venta
`subtotal = Σ(precioUnitario × cantidad)`. Si `aplicarCredito = true`: `total = subtotal - min(saldo_disponible, subtotal)`.

### P-11: Rechazo por stock insuficiente
*Para cualquier* cobro/venta donde `cantidad > stock` de al menos un producto → HTTP 409, sin modificar stock ni crear registro.

### P-12: Decremento atómico de stock post-cobro/venta
*Para cualquier* cobro/venta exitosa: `stock_nuevo = stock_anterior - cantidad` para cada producto incluido.

### P-13: Saldo de crédito nunca negativo
*Para cualquier* secuencia de asignaciones y aplicaciones, el saldo resultante es siempre `>= 0`. Si el monto a aplicar supera el saldo, solo se aplica el saldo disponible.

### P-14: Corrección de estadísticas del inventario
- `totalProductos` = count de productos con `activo = true`
- `totalStock` = Σ `stock` de productos activos
- `distribucionPorCategoria` = mapa categoría → count de productos activos
- `productosConStockBajo` = productos activos con `stock < 5`

### P-15: Estructura de respuesta de error
*Para cualquier* error (400, 401, 404, 405, 409, 500), la respuesta es JSON con `error` (string) y `codigo` (string), con header `Content-Type: application/json`.

### P-16: Unicidad de sesión abierta por cajero
*Para cualquier* cajero con sesión `"abierta"`, abrir otra → HTTP 409, sin crear segunda sesión.

### P-17: Transición de estado de sesión de caja
Sesión `"abierta"` → cerrar cambia estado a `"cerrada"` y registra `fechaCierre`. Sesión `"cerrada"` → cerrar de nuevo → HTTP 409.

### P-18: Rechazo de venta en sesión cerrada
*Para cualquier* sesión `"cerrada"`, registrar una venta → HTTP 409, sin crear el registro.

### P-19: Completitud del ticket generado
*Para cualquier* venta exitosa, el ticket contiene: `ventaId`, `sesionId`, `cajeroId`, `clienteId`, `items` (con `nombre`, `cantidad`, `precioUnitario`), `subtotal`, `creditoAplicado`, `total`, `metodoPago`, `fechaVenta`.

### P-20: Round-trip de consulta de ticket
*Para cualquier* venta exitosa, GET `/pos/ventas/{ventaId}/ticket` retorna los mismos datos generados al momento del registro.

### P-21: Orden ascendente de ventas por sesión
*Para cualquier* sesión con ventas, GET `/pos/sesiones/{sesionId}/ventas` retorna las ventas ordenadas ascendentemente por `fechaVenta`.

### P-22: Validación de método de pago
*Para cualquier* solicitud de venta donde `metodoPago` no sea `"efectivo"`, `"tarjeta"` o `"credito"` → HTTP 400, sin crear el registro.
