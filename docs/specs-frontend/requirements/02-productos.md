# Módulo: Productos

## Requisito 4 — Listado con Búsqueda y Filtros

**User Story:** Como cajero, quiero ver la lista de productos con capacidad de búsqueda por nombre, filtro por categoría y filtro por estado.

### Criterios de Aceptación

1. WHEN el usuario accede a `/productos`, THE App SHALL consumir `GET /productos` y mostrar los productos en una tabla o tarjetas con los campos: `nombre`, `categoria`, `precio`, `stock` y `fechaCreacion`.
2. WHEN el usuario escribe en el campo de búsqueda, THE App SHALL filtrar los productos por nombre (puede ser filtro local o `GET /productos?nombre=...`).
3. WHEN el usuario selecciona una categoría en el filtro, THE App SHALL consumir `GET /productos?categoria={valor}` y actualizar la lista.
4. WHEN el usuario combina búsqueda y filtro de categoría, THE App SHALL aplicar ambos filtros simultáneamente.
5. IF la lista de productos está vacía, THE App SHALL mostrar el mensaje `"No se encontraron productos"`.
6. WHILE los productos se están cargando, THE App SHALL mostrar un skeleton loader o spinner en lugar de la tabla.

---

## Requisito 5 — CRUD de Productos

**User Story:** Como administrador, quiero crear, editar y eliminar productos desde la interfaz sin recargar la página.

### Criterios de Aceptación

**Crear:**
1. WHEN el usuario hace clic en `"Nuevo producto"`, THE App SHALL mostrar un formulario/modal con los campos: `nombre`, `categoria`, `precio` y `stock`.
2. WHEN el usuario envía el formulario con datos válidos, THE App SHALL consumir `POST /productos` y agregar el nuevo producto a la lista sin recargar la página.
3. IF el backend retorna errores de validación (400), THEN THE App SHALL mostrar los mensajes de error junto a cada campo correspondiente.

**Editar:**
4. WHEN el usuario hace clic en `"Editar"` en un producto, THE App SHALL cargar los datos actuales en un formulario de edición.
5. WHEN el usuario guarda los cambios, THE App SHALL consumir `PUT /productos/{id}` y actualizar el producto en la lista sin recargar la página.
6. IF el producto no existe (404), THEN THE App SHALL mostrar el mensaje `"Producto no encontrado"`.

**Eliminar:**
7. WHEN el usuario hace clic en `"Eliminar"` en un producto, THE App SHALL mostrar una confirmación antes de proceder.
8. WHEN el usuario confirma la eliminación, THE App SHALL consumir `DELETE /productos/{id}` y remover el producto de la lista sin recargar la página.

---

## Requisito 6 — Paginación

**User Story:** Como usuario, quiero paginar los resultados de productos para navegar entre páginas.

### Criterios de Aceptación

1. THE App SHALL mostrar controles de paginación con botones `"Anterior"` / `"Siguiente"` y números de página.
2. WHEN el usuario cambia de página, THE App SHALL consumir el endpoint con los query params `page` y `limit`.
3. THE App SHALL mostrar la información de paginación: `"Página {n} de {total} — {count} productos"`.
4. THE botón `"Anterior"` SHALL estar deshabilitado en la primera página y `"Siguiente"` en la última.

---

## Requisito 7 — Validaciones en Formularios de Producto

**User Story:** Como usuario, quiero ver mensajes de validación junto a cada campo antes de enviar el formulario.

### Criterios de Aceptación

1. THE App SHALL validar que `nombre` y `categoria` no estén vacíos antes de enviar.
2. THE App SHALL validar que `precio` sea un número mayor a 0.
3. THE App SHALL validar que `stock` sea un entero mayor o igual a 0.
4. THE App SHALL mostrar mensajes de validación junto a cada campo inválido antes de enviar la petición al backend.
5. THE App SHALL deshabilitar el botón de envío mientras los campos requeridos estén inválidos.
