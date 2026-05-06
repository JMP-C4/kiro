# Módulo: POS (Point of Sale)

## Requisito 10 — Sesión de Caja

**User Story:** Como cajero, quiero abrir y cerrar sesiones de caja para controlar los períodos de operación.

### Criterios de Aceptación

1. WHEN el cajero accede a `/pos`, THE App SHALL verificar si existe una sesión abierta para el cajero actual consumiendo `GET /pos/sesiones/activa`.
2. IF no existe sesión abierta, THE App SHALL mostrar un formulario para abrir sesión con el campo `montoInicial`.
3. WHEN el cajero ingresa el monto inicial y hace clic en `"Abrir caja"`, THE App SHALL consumir `POST /pos/sesiones` y mostrar la pantalla de ventas.
4. WHEN el cajero hace clic en `"Cerrar caja"`, THE App SHALL mostrar un resumen de la sesión y un campo `montoFinal`, luego consumir `PUT /pos/sesiones/{sesionId}/cerrar`.
5. IF ya existe una sesión abierta para el cajero (409), THE App SHALL mostrar el mensaje `"Ya tienes una sesión de caja abierta"` y cargar esa sesión directamente.

---

## Requisito 11 — Carrito de Compras y Checkout

**User Story:** Como cajero, quiero agregar productos al carrito, aplicar créditos y procesar el pago con múltiples métodos.

### Criterios de Aceptación

**Carrito:**
1. THE App SHALL mostrar un buscador de productos (por nombre o categoría) en la pantalla POS.
2. WHEN el cajero selecciona un producto, THE App SHALL agregarlo al carrito con cantidad 1 y permitir modificar la cantidad.
3. THE App SHALL mostrar en tiempo real: subtotal por ítem, subtotal general, crédito aplicado y total a pagar.
4. WHEN el cajero modifica la cantidad de un ítem, THE App SHALL recalcular los totales inmediatamente.
5. THE App SHALL permitir eliminar ítems individuales del carrito.

**Métodos de Pago:**
6. THE App SHALL mostrar tres opciones de método de pago: `"Efectivo"`, `"Tarjeta"` y `"Crédito del cliente"`.
7. WHEN el cajero selecciona `"Crédito del cliente"`, THE App SHALL consultar `GET /creditos/{clienteId}` y mostrar el saldo disponible.
8. IF el saldo de crédito es insuficiente para cubrir el total, THE App SHALL mostrar el saldo disponible y el monto restante a pagar.

**Checkout:**
9. WHEN el cajero hace clic en `"Cobrar"`, THE App SHALL consumir `POST /pos/ventas` con los datos del carrito, cliente, sesión y método de pago.
10. IF el stock de algún producto es insuficiente (409), THE App SHALL mostrar el mensaje `"Stock insuficiente para: {nombre del producto}"` sin procesar la venta.
11. WHEN la venta es exitosa, THE App SHALL limpiar el carrito y mostrar el ticket generado.

---

## Requisito 12 — Ticket de Venta

**User Story:** Como cajero, quiero ver y reimprimir el ticket de cada venta completada.

### Criterios de Aceptación

1. WHEN una venta es completada, THE App SHALL mostrar automáticamente el ticket con: número de venta, fecha, cajero, cliente, lista de productos (nombre, cantidad, precio unitario), subtotal, crédito aplicado, total y método de pago.
2. THE App SHALL incluir un botón `"Imprimir"` que use `window.print()` con estilos de impresión optimizados.
3. WHEN el cajero hace clic en `"Nueva venta"`, THE App SHALL cerrar el ticket y limpiar el carrito para la siguiente transacción.
4. WHEN el cajero consulta el historial de ventas de la sesión, THE App SHALL consumir `GET /pos/sesiones/{sesionId}/ventas` y mostrar la lista con opción de ver el ticket de cada una.
