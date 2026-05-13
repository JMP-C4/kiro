# Módulo: Autenticación

## Requisito 1 — Login con JWT

**User Story:** Como cajero, quiero iniciar sesión con usuario y contraseña para obtener un token JWT y acceder al sistema.

### Criterios de Aceptación

1. WHEN el usuario accede a la aplicación sin token almacenado, THE App SHALL redirigir automáticamente a `/login`.
2. WHEN el usuario envía el formulario de login con credenciales válidas, THE App SHALL consumir `POST /auth`, almacenar el `access_token` en `localStorage` y redirigir a `/productos`.
3. IF las credenciales son incorrectas (respuesta 401), THEN THE App SHALL mostrar el mensaje `"Credenciales incorrectas"` visible junto al formulario sin recargar la página.
4. IF el usuario está inactivo (respuesta 403), THEN THE App SHALL mostrar el mensaje `"Usuario inactivo. Contacte al administrador"`.
5. THE formulario de login SHALL contener los campos `usuario` y `contraseña` y un botón `"Iniciar sesión"`.
6. WHILE la petición de login está en curso, THE botón SHALL mostrar un indicador de carga y estar deshabilitado para evitar envíos duplicados.

---

## Requisito 2 — Persistencia de Sesión y Logout

**User Story:** Como cajero, quiero que mi sesión persista entre recargas y poder cerrar sesión manualmente.

### Criterios de Aceptación

1. WHEN el usuario recarga la página con un token válido en `localStorage`, THE App SHALL mantener la sesión activa sin redirigir al login.
2. WHEN el usuario hace clic en `"Cerrar sesión"`, THE App SHALL eliminar el token de `localStorage` y redirigir a `/login`.
3. IF el backend responde con HTTP 401 en cualquier petición autenticada, THEN THE App SHALL eliminar el token, mostrar el mensaje `"Sesión expirada. Inicia sesión nuevamente"` y redirigir a `/login`.
4. THE header `Authorization: Bearer <token>` SHALL ser enviado automáticamente en todas las peticiones al backend excepto `POST /auth`.

---

## Requisito 3 — Protección de Rutas

**User Story:** Como sistema, quiero que todas las rutas excepto `/login` requieran autenticación válida.

### Criterios de Aceptación

1. WHEN un usuario no autenticado intenta acceder a cualquier ruta protegida, THE App SHALL redirigir a `/login` preservando la ruta original como parámetro `redirect`.
2. WHEN un usuario autenticado intenta acceder a `/login`, THE App SHALL redirigir automáticamente a `/productos`.
3. THE App SHALL implementar un componente `ProtectedRoute` que envuelva todas las rutas que requieren autenticación.
