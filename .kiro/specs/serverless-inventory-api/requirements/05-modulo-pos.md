# Módulo: POS (Point of Sale)

## Requisito 9 — Estadísticas del Inventario

**User Story:** Como gerente de operaciones, quiero consultar métricas sobre el stock total y la distribución por categorías, para tomar decisiones informadas sobre el inventario.

### Criterios de Aceptación

1. WHEN una solicitud GET es recibida en `/stats`, THE Stats_Engine SHALL retornar un código HTTP 200 con un objeto JSON que contenga: `totalProductos`, `totalStock`, `distribucionPorCategoria` y `productosConStockBajo`.
2. THE Stats_Engine SHALL calcular `totalStock` como la suma de los valores de `stock` de todos los productos activos.
3. THE Stats_Engine SHALL calcular `distribucionPorCategoria` como un objeto donde cada clave es el nombre de una categoría y su valor es la cantidad de productos activos en esa categoría.
4. THE Stats_Engine SHALL incluir en `productosConStockBajo` todos los productos activos cuyo `stock` sea menor a 5 unidades.
5. WHEN el inventario no contiene productos activos, THE Stats_Engine SHALL retornar `totalProductos` con valor 0, `totalStock` con valor 0, `distribucionPorCategoria` como objeto vacío y `productosConStockBajo` como arreglo vacío.

---

## Requisito 10 — Manejo Global de Errores

**User Story:** Como consumidor de la API, quiero recibir respuestas de error consistentes y descriptivas, para poder diagnosticar y corregir problemas en mis integraciones.

### Criterios de Aceptación

1. THE API SHALL retornar todas las respuestas de error en formato JSON con los campos `error` (string descriptivo) y `codigo` (string identificador del error).
2. IF una solicitud es recibida en una ruta no definida, THEN THE API SHALL retornar un código HTTP 404 con el mensaje `"Ruta no encontrada"`.
3. IF una solicitud utiliza un método HTTP no permitido para una ruta existente, THEN THE API SHALL retornar un código HTTP 405 con el mensaje `"Método no permitido"`.
4. IF una Lambda lanza una excepción no controlada, THEN THE API SHALL retornar un código HTTP 500 con el mensaje `"Error interno del servidor"` sin exponer detalles internos del stack trace.
5. THE API SHALL incluir en todas las respuestas el encabezado `Content-Type: application/json`.
6. THE API SHALL incluir en todas las respuestas los encabezados CORS necesarios para permitir solicitudes desde orígenes configurados en la variable de entorno `ALLOWED_ORIGINS`.

---

## Requisito 11 — Módulo POS (Point of Sale)

**User Story:** Como cajero, quiero gestionar sesiones de caja y registrar ventas presenciales con descuento automático de stock, para integrar el punto de venta con el inventario y el sistema de cobros.

### Sesión de Caja

1. WHEN una solicitud POST es recibida en `/pos/sesiones` con los campos `cajeroId` y `montoInicial` (número mayor o igual a 0), THE POS_Manager SHALL crear una nueva sesión de caja con estado `"abierta"` y retornar un código HTTP 201 con el objeto de la sesión, incluyendo su `id` generado y `fechaApertura`.
2. IF ya existe una sesión de caja con estado `"abierta"` para el mismo `cajeroId`, THEN THE POS_Manager SHALL retornar un código HTTP 409 con el mensaje `"Ya existe una sesión de caja abierta para este cajero"`.
3. WHEN una solicitud PUT es recibida en `/pos/sesiones/{sesionId}/cerrar` con el campo `montoFinal` (número mayor o igual a 0), THE POS_Manager SHALL actualizar el estado de la sesión a `"cerrada"`, registrar la `fechaCierre` y retornar un código HTTP 200 con el objeto de la sesión actualizado.
4. IF el `sesionId` no corresponde a ninguna sesión registrada, THEN THE POS_Manager SHALL retornar un código HTTP 404 con el mensaje `"Sesión de caja no encontrada"`.
5. IF una solicitud de cierre es recibida para una sesión con estado `"cerrada"`, THEN THE POS_Manager SHALL retornar un código HTTP 409 con el mensaje `"La sesión de caja ya está cerrada"`.

### Venta en Punto de Venta

6. WHEN una solicitud POST es recibida en `/pos/ventas` con un cuerpo JSON válido, THE POS_Manager SHALL registrar la venta, decrementar el stock de los productos involucrados y retornar un código HTTP 201 con el objeto de la venta creada, incluyendo su `id` generado y el `total` calculado.
7. THE Validator SHALL verificar que el cuerpo de la solicitud de venta contenga los campos obligatorios: `sesionId` (string no vacío), `clienteId` (string no vacío), `items` (arreglo no vacío de objetos con `productoId` y `cantidad`) y `metodoPago` (uno de los valores: `"efectivo"`, `"tarjeta"` o `"credito"`).
8. IF el `sesionId` corresponde a una sesión con estado `"cerrada"`, THEN THE POS_Manager SHALL retornar un código HTTP 409 con el mensaje `"No se puede registrar una venta en una sesión cerrada"`.
9. IF la `cantidad` solicitada de algún producto supera el `stock` disponible, THEN THE POS_Manager SHALL retornar un código HTTP 409 con el mensaje `"Stock insuficiente para el producto: {productoId}"`.
10. WHEN el campo `metodoPago` es `"credito"`, THE POS_Manager SHALL aplicar el saldo de crédito disponible del cliente al total de la venta, siguiendo las mismas reglas definidas en el Requisito 8.
11. WHEN una venta es registrada exitosamente, THE Repository SHALL decrementar el `stock` de cada producto incluido según la `cantidad` indicada, de forma atómica.

### Generación de Ticket

12. WHEN una venta es registrada exitosamente, THE POS_Manager SHALL generar un ticket con los campos: `ventaId`, `sesionId`, `cajeroId`, `clienteId`, `items` (con nombre, cantidad y precio unitario de cada producto), `subtotal`, `creditoAplicado`, `total`, `metodoPago` y `fechaVenta`.
13. WHEN una solicitud GET es recibida en `/pos/ventas/{ventaId}/ticket`, THE POS_Manager SHALL retornar un código HTTP 200 con el objeto del ticket correspondiente a esa venta.
14. IF el `ventaId` no corresponde a ninguna venta registrada, THEN THE POS_Manager SHALL retornar un código HTTP 404 con el mensaje `"Venta no encontrada"`.

### Historial de Ventas por Sesión

15. WHEN una solicitud GET es recibida en `/pos/sesiones/{sesionId}/ventas`, THE POS_Manager SHALL retornar un código HTTP 200 con un arreglo JSON de todas las ventas registradas en esa sesión, ordenadas por `fechaVenta` ascendente.
16. WHEN el `sesionId` existe pero no tiene ventas registradas, THE POS_Manager SHALL retornar un código HTTP 200 con un arreglo vacío.
