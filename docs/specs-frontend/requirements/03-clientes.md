# Módulo: Clientes

## Requisito 7 — Gestión de Clientes

**User Story:** Como cajero, quiero registrar, consultar, actualizar y eliminar clientes para mantener la base de compradores actualizada.

### Criterios de Aceptación

1. WHEN el usuario accede a `/clientes`, THE App SHALL consumir `GET /clientes` y mostrar la lista de clientes activos con los campos: `nombre`, `email` y `telefono`.
2. WHEN el usuario hace clic en `"Nuevo cliente"`, THE App SHALL mostrar un formulario con los campos: `nombre`, `email` y `telefono`.
3. THE App SHALL validar que `email` tenga formato válido antes de enviar el formulario.
4. IF el email ya está registrado (409), THE App SHALL mostrar el mensaje `"El email ya está registrado"` junto al campo.
5. WHEN el usuario guarda un cliente nuevo, THE App SHALL consumir `POST /clientes` y agregar el cliente a la lista sin recargar.
6. WHEN el usuario edita un cliente, THE App SHALL consumir `PUT /clientes/{id}` y actualizar la lista.
7. WHEN el usuario elimina un cliente, THE App SHALL mostrar confirmación, consumir `DELETE /clientes/{id}` y remover de la lista.
8. THE App SHALL incluir un buscador por nombre o email que filtre la lista localmente.
