# Módulo: Cobros y Créditos

## Requisito 8 — Registro de Cobros

**User Story:** Como cajero, quiero registrar cobros asociados a clientes y productos desde la interfaz.

### Criterios de Aceptación

1. WHEN el usuario accede a `/cobros`, THE App SHALL mostrar el historial de cobros con los campos: `id`, `cliente`, `total`, `creditoAplicado` y `fechaCobro`.
2. WHEN el usuario hace clic en `"Nuevo cobro"`, THE App SHALL mostrar un formulario para seleccionar cliente, agregar productos con cantidades y opcionalmente aplicar crédito.
3. WHEN el usuario envía el cobro, THE App SHALL consumir `POST /cobros` y mostrar el cobro creado con el total calculado.
4. IF el stock es insuficiente (409), THE App SHALL mostrar el mensaje `"Stock insuficiente para: {productoId}"`.
5. WHEN el usuario hace clic en un cobro, THE App SHALL consumir `GET /cobros/{id}` y mostrar el detalle completo.
6. THE App SHALL permitir filtrar cobros por cliente usando `GET /cobros?clienteId={id}`.

---

## Requisito 9 — Gestión de Créditos

**User Story:** Como administrador financiero, quiero asignar créditos a clientes y consultar su saldo disponible.

### Criterios de Aceptación

1. WHEN el usuario accede al perfil de un cliente, THE App SHALL mostrar el saldo de crédito disponible consumiendo `GET /creditos/{clienteId}`.
2. WHEN el usuario hace clic en `"Asignar crédito"`, THE App SHALL mostrar un formulario con el campo `monto`.
3. THE App SHALL validar que `monto` sea un número mayor a 0 antes de enviar.
4. WHEN el usuario envía el formulario, THE App SHALL consumir `POST /creditos` y actualizar el saldo mostrado.
5. IF el monto es inválido (400), THE App SHALL mostrar el mensaje `"El monto del crédito debe ser mayor a 0"`.
