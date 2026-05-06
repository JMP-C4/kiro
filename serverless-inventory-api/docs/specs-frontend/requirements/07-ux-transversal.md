# UX Transversal

## Requisito 14 — Validaciones, Loaders y Manejo de Errores

**User Story:** Como usuario, quiero ver indicadores de carga, mensajes de error claros y validaciones en tiempo real en toda la aplicación.

### Criterios de Aceptación

**Indicadores de carga:**
1. THE App SHALL mostrar un spinner o skeleton loader en cada sección mientras espera respuesta del backend.
2. THE App SHALL deshabilitar los botones de envío mientras una petición está en curso para evitar duplicados.

**Mensajes de error:**
3. IF el backend retorna un error 500, THE App SHALL mostrar el mensaje `"Error del servidor. Intenta nuevamente"` como notificación toast.
4. IF la conexión falla (network error), THE App SHALL mostrar el mensaje `"Sin conexión. Verifica tu red"`.
5. THE App SHALL mostrar notificaciones toast para confirmaciones de éxito (ej: `"Producto creado correctamente"`).

**Validaciones:**
6. THE App SHALL validar todos los formularios en el cliente antes de enviar al backend.
7. THE App SHALL mostrar mensajes de validación junto a cada campo inválido, no solo al enviar.
8. THE App SHALL limpiar los mensajes de error cuando el usuario corrige el campo.

**Navegación:**
9. THE App SHALL incluir una barra de navegación lateral o superior con acceso a: Productos, Clientes, Cobros, Créditos, POS y Estadísticas.
10. THE App SHALL resaltar la sección activa en la navegación.
11. THE App SHALL ser responsive y funcionar correctamente en pantallas de 1024px o más.

**Offline (Bonus):**
12. THE App SHALL permitir búsqueda y visualización del carrito POS sin conexión usando datos en caché.
13. WHEN la conexión se restaura, THE App SHALL sincronizar automáticamente las operaciones pendientes.
