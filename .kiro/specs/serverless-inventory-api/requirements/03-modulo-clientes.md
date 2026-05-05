# Módulo: Clientes

## Requisito 6 — Gestión de Clientes

**User Story:** Como administrador del sistema, quiero registrar, consultar, actualizar y eliminar clientes, para mantener una base de datos de compradores actualizada.

### Criterios de Aceptación

1. WHEN una solicitud POST es recibida en `/clientes` con un cuerpo JSON válido, THE API SHALL crear el cliente y retornar un código HTTP 201 con el objeto del cliente creado, incluyendo su `id` generado.
2. THE Validator SHALL verificar que el cuerpo de la solicitud de creación de cliente contenga los campos obligatorios: `nombre` (string no vacío), `email` (string con formato de correo electrónico válido) y `telefono` (string no vacío).
3. IF el campo `email` no tiene formato de correo electrónico válido, THEN THE Validator SHALL retornar un código HTTP 400 con el mensaje `"Formato de email inválido"`.
4. IF el campo `email` ya está registrado en el sistema, THEN THE API SHALL retornar un código HTTP 409 con el mensaje `"El email ya está registrado"`.
5. WHEN una solicitud GET es recibida en `/clientes`, THE API SHALL retornar un código HTTP 200 con un arreglo JSON de todos los clientes activos.
6. WHEN una solicitud GET es recibida en `/clientes/{id}`, THE API SHALL retornar un código HTTP 200 con el objeto del cliente correspondiente.
7. IF el `id` de cliente proporcionado no corresponde a ningún cliente registrado, THEN THE API SHALL retornar un código HTTP 404 con el mensaje `"Cliente no encontrado"`.
8. WHEN una solicitud PUT es recibida en `/clientes/{id}` con un cuerpo JSON válido, THE API SHALL actualizar el cliente correspondiente y retornar un código HTTP 200 con el objeto del cliente actualizado.
9. WHEN una solicitud DELETE es recibida en `/clientes/{id}`, THE API SHALL realizar una eliminación lógica del cliente y retornar un código HTTP 200 con el mensaje `"Cliente eliminado correctamente"`.
