# Módulo: Productos

## Requisito 1 — Monitoreo del Estado del Sistema

**User Story:** Como operador del sistema, quiero consultar el estado y la versión de la API, para verificar que el servicio está operativo antes de realizar operaciones críticas.

### Criterios de Aceptación

1. WHEN una solicitud GET es recibida en `/health`, THE Health_Checker SHALL responder con un código HTTP 200 y un objeto JSON que contenga los campos `status`, `version` y `timestamp`.
2. WHILE el sistema está operativo, THE Health_Checker SHALL retornar el campo `status` con el valor `"ok"`.
3. IF la Lambda de health check no puede inicializarse correctamente, THEN THE Health_Checker SHALL retornar un código HTTP 503 con un mensaje de error descriptivo.
4. THE Health_Checker SHALL incluir en la respuesta la versión actual del sistema definida en la variable de entorno `APP_VERSION`.

---

## Requisito 2 — Consulta del Catálogo de Productos

**User Story:** Como usuario de la API, quiero listar los productos del inventario con capacidad de filtrado por categoría, para encontrar rápidamente los artículos que necesito.

### Criterios de Aceptación

1. WHEN una solicitud GET es recibida en `/productos`, THE API SHALL retornar un código HTTP 200 con un arreglo JSON de todos los productos activos.
2. WHEN una solicitud GET es recibida en `/productos` con el parámetro de consulta `categoria`, THE API SHALL retornar únicamente los productos cuya categoría coincida exactamente con el valor proporcionado.
3. IF el parámetro `categoria` no corresponde a ninguna categoría registrada, THEN THE API SHALL retornar un código HTTP 200 con un arreglo vacío.
4. THE API SHALL retornar cada producto con los campos: `id`, `nombre`, `categoria`, `precio`, `stock` y `fechaCreacion`.
5. WHEN el inventario no contiene productos registrados, THE API SHALL retornar un código HTTP 200 con un arreglo vacío.

---

## Requisito 3 — Registro de Nuevos Productos

**User Story:** Como administrador del inventario, quiero registrar nuevos productos con validaciones de datos integradas, para mantener la integridad del catálogo.

### Criterios de Aceptación

1. WHEN una solicitud POST es recibida en `/productos` con un cuerpo JSON válido, THE API SHALL crear el producto y retornar un código HTTP 201 con el objeto del producto creado, incluyendo su `id` generado.
2. THE Validator SHALL verificar que el cuerpo de la solicitud contenga los campos obligatorios: `nombre` (string no vacío), `categoria` (string no vacío), `precio` (número mayor a 0) y `stock` (entero mayor o igual a 0).
3. IF el cuerpo de la solicitud omite algún campo obligatorio, THEN THE Validator SHALL retornar un código HTTP 400 con un mensaje que identifique el campo faltante.
4. IF el campo `precio` contiene un valor menor o igual a 0, THEN THE Validator SHALL retornar un código HTTP 400 con el mensaje `"El precio debe ser mayor a 0"`.
5. IF el campo `stock` contiene un valor negativo, THEN THE Validator SHALL retornar un código HTTP 400 con el mensaje `"El stock no puede ser negativo"`.
6. IF el cuerpo de la solicitud no es un JSON válido, THEN THE API SHALL retornar un código HTTP 400 con el mensaje `"Cuerpo de solicitud inválido"`.
7. THE Repository SHALL asignar un identificador único (`id`) al producto en el momento de su creación.

---

## Requisito 4 — Actualización de Productos

**User Story:** Como administrador del inventario, quiero actualizar los datos de un producto existente, para mantener la información del catálogo actualizada.

### Criterios de Aceptación

1. WHEN una solicitud PUT es recibida en `/productos/{id}` con un cuerpo JSON válido, THE API SHALL actualizar el producto correspondiente y retornar un código HTTP 200 con el objeto del producto actualizado.
2. THE Validator SHALL verificar que los campos provistos en la actualización cumplan las mismas reglas de validación definidas en el Requisito 3.
3. IF el `id` proporcionado no corresponde a ningún producto registrado, THEN THE API SHALL retornar un código HTTP 404 con el mensaje `"Producto no encontrado"`.
4. THE Repository SHALL preservar los campos no incluidos en la solicitud de actualización con sus valores anteriores.

---

## Requisito 5 — Eliminación de Productos

**User Story:** Como administrador del inventario, quiero eliminar productos del catálogo, para mantener el inventario libre de artículos obsoletos.

### Criterios de Aceptación

1. WHEN una solicitud DELETE es recibida en `/productos/{id}`, THE API SHALL eliminar el producto correspondiente y retornar un código HTTP 200 con el mensaje `"Producto eliminado correctamente"`.
2. IF el `id` proporcionado no corresponde a ningún producto registrado, THEN THE API SHALL retornar un código HTTP 404 con el mensaje `"Producto no encontrado"`.
3. THE Repository SHALL realizar una eliminación lógica del producto, estableciendo el campo `activo` en `false`, sin borrar el registro físico de la base de datos.
