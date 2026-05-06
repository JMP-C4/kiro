# Parcial Práctico — Frontend: Consumo de API REST de Productos con Autenticación JWT

## Enunciado

Desarrollar una aplicación frontend que consuma la API REST de gestión de productos construida en el parcial de backend. Implementar la interfaz de usuario para autenticarse, obtener un JWT y realizar las operaciones CRUD sobre los productos.

---

## Qué hacer

### Pantalla de Login

1. Crear una pantalla de login con un formulario que contenga los campos `usuario` y `contraseña` y un botón de "Iniciar sesión".
2. Consumir el endpoint `POST /auth` enviando las credenciales del formulario.
3. Almacenar el `access_token` recibido en `localStorage` o `sessionStorage` para usarlo en las peticiones posteriores.
4. Redirigir al usuario a la pantalla de productos tras un login exitoso.
5. Mostrar un mensaje de error visible al usuario si las credenciales son incorrectas (`401`).
6. Impedir el acceso a la pantalla de productos si el usuario no tiene un token almacenado (redirigir al login).

### Listado de Productos

7. Crear una pantalla que muestre la lista de productos consumiendo el endpoint `GET /productos`.
8. Enviar el header `Authorization: Bearer <token>` en cada petición al backend.
9. Mostrar los productos en una tabla o tarjetas con los campos: `nombre`, `descripcion`, `subcategoria`, `precio`, `precioxcantidad` y `estado`.
10. Incluir un botón de "Cerrar sesión" que elimine el token del almacenamiento y redirija al login.
11. Redirigir al login automáticamente si el backend responde `401` (token inválido o expirado) o `403` (usuario inactivo), mostrando un mensaje apropiado.

### Crear Producto

12. Crear un formulario (puede ser en la misma pantalla o en un modal) con los campos: `nombre`, `descripcion`, `subcategoria`, `precio`, `precioxcantidad` y `estado`.
13. Consumir el endpoint `POST /productos` enviando los datos del formulario con el token JWT.
14. Actualizar la lista de productos automáticamente después de una creación exitosa (sin recargar la página manualmente).
15. Mostrar mensajes de error al usuario si el backend retorna errores de validación (`400`).

### Actualizar Producto

16. Permitir seleccionar un producto de la lista para editarlo.
17. Cargar los datos actuales del producto en un formulario de edición (puede ser un modal o una pantalla aparte).
18. Consumir el endpoint `PUT /productos/:id` enviando los datos actualizados con el token JWT.
19. Actualizar la lista de productos automáticamente después de una actualización exitosa.

### Eliminar Producto

20. Incluir un botón de eliminar en cada producto de la lista.
21. Mostrar una confirmación antes de eliminar (puede ser un `confirm()` nativo o un modal).
22. Consumir el endpoint `DELETE /productos/:id` con el token JWT.
23. Remover el producto de la lista automáticamente después de una eliminación exitosa.

### Validaciones en el Frontend

24. Validar que los campos `nombre`, `descripcion`, `subcategoria`, `precio`, `precioxcantidad` y `estado` no estén vacíos antes de enviar el formulario de creación o edición.
25. Validar que `precio` y `precioxcantidad` sean números positivos.
26. Validar que `estado` solo permita los valores `"activo"` o `"inactivo"` (usar un `<select>` o radio buttons).
27. Mostrar mensajes de validación junto a cada campo inválido antes de enviar la petición al backend.

### Filtros y Búsqueda

28. Implementar un campo de búsqueda por nombre que filtre los productos (puede ser filtro local o consumiendo `GET /productos?nombre=...`).
29. Implementar un filtro por subcategoría (puede ser un `<select>` o botones).
30. Implementar un filtro por estado (`activo` / `inactivo`).
31. Permitir combinar los filtros de forma simultánea.

### Paginación

32. Implementar controles de paginación (botones "Anterior" / "Siguiente" o números de página).
33. Consumir el endpoint con los query params `page` y `limit`.
34. Mostrar la información de paginación al usuario (ej: "Página 1 de 5 — 23 productos").

---

## Niveles de Dificultad

| Nivel | Nota | Alcance |
|-------|------|---------|
| Básico | 3.0 | Puntos 1 al 11: Login funcional + listado de productos + manejo del token + cerrar sesión |
| Intermedio | 4.0 | Puntos 1 al 23: Todo lo anterior + crear, editar y eliminar productos desde la interfaz + actualización automática de la lista |
| Avanzado | 5.0 | Puntos 1 al 34: Todo lo anterior + validaciones en frontend + filtros/búsqueda + paginación |

### Bonificación (+0.5, máximo 5.0)

- Aplicar estilos CSS coherentes (puede usar un framework como Bootstrap, Tailwind, etc.).
- Mostrar indicadores de carga (spinners o skeleton loaders) mientras se esperan las respuestas del backend.
- Organizar el código en componentes reutilizables (si usa React, Angular, Vue, etc.).

---

## Restricciones

- Tecnología libre (HTML/CSS/JS vanilla, React, Angular, Vue, Svelte, etc.).
- Consumir la API del parcial de backend.
- No usar librerías que generen el CRUD automáticamente.
- Entregar en un repositorio Git con un README que indique cómo ejecutar el proyecto.
- Duración: 2 horas.

---

## Flujo de Prueba Sugerido

```
1.  Abrir la aplicación → verificar que muestra la pantalla de login
2.  Intentar acceder a /productos sin token → verificar que redirige al login
3.  Ingresar credenciales incorrectas → verificar que muestra mensaje de error
4.  Ingresar credenciales correctas (admin / admin123) → verificar que redirige a productos
5.  Verificar que la lista de productos se muestra correctamente
6.  Crear un producto nuevo desde el formulario → verificar que aparece en la lista
7.  Intentar crear un producto con campos vacíos → verificar que muestra validaciones
8.  Editar un producto existente → verificar que los cambios se reflejan en la lista
9.  Eliminar un producto → verificar la confirmación y que desaparece de la lista
10. Hacer clic en "Cerrar sesión" → verificar que redirige al login
11. Ingresar con el usuario inactivo (inactivo / noactivo1) → verificar que muestra mensaje de acceso denegado
```
