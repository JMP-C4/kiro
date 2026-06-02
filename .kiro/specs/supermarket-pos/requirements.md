# Documento de Requisitos — Sistema POS Supermercado

## Introducción

Sistema de Punto de Venta (POS) para supermercado compuesto por dos proyectos independientes:

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS v4 con estética glassmorphism.
- **Backend:** Node.js + AWS Lambda + DynamoDB (documentos JSON) con API REST.

El sistema permite a cajeros registrar ventas, gestionar el carrito de compras, aplicar IVA, procesar pagos e imprimir tickets. Los supervisores acceden además a reportes. Los administradores tienen control total sobre productos, usuarios y configuración del sistema.

El POS opera principalmente mediante atajos de teclado estándar de supermercado (sin pantalla táctil), con navegación por teclas de función (F1–F9) y teclas de dirección.

---

## Glosario

- **POS:** Point of Sale — terminal de punto de venta donde el cajero registra las ventas.
- **Sistema:** El conjunto completo frontend + backend del POS.
- **Frontend:** Aplicación React que corre en el navegador del cajero.
- **Backend:** API REST serverless que persiste documentos JSON en DynamoDB (tablas no relacionales).
- **Cajero:** Usuario con rol `CAJERO` — acceso exclusivo al módulo POS.
- **Supervisor:** Usuario con rol `SUPERVISOR` — acceso al POS y a reportes y consulta de productos.
- **Admin:** Usuario con rol `ADMIN` — acceso completo a todos los módulos.
- **JWT:** JSON Web Token — token de autenticación emitido por el Backend al iniciar sesión.
- **Carrito:** Lista de ítems de la venta en curso, visible en el POS.
- **Ítem:** Una línea individual dentro del Carrito, correspondiente a un producto con cantidad y precio.
- **Venta:** Transacción completada que incluye uno o más Ítems, método de pago y ticket generado.
- **Ticket:** Comprobante de la Venta, imprimible en papel térmico o exportable como PDF.
- **IVA:** Impuesto al Valor Agregado — tasa estándar del 19%.
- **Precio_Base:** Precio del producto antes de IVA cuando el producto no incluye IVA.
- **Precio_Con_IVA:** Precio final del producto con IVA incluido.
- **Producto_Por_Peso:** Producto cuya unidad de venta es kilogramos, gramos o libras.
- **Modal:** Ventana superpuesta sobre el POS para capturar datos o confirmar acciones.
- **Buscador:** Campo de texto en el POS para buscar productos por código de barras o nombre.
- **Método_De_Pago:** Forma en que el cliente cancela la venta: Efectivo, Tarjeta o Transferencia.
- **Cambio:** Diferencia entre el monto recibido en efectivo y el total de la Venta.
- **Rol:** Nivel de acceso asignado a un usuario: `CAJERO`, `SUPERVISOR` o `ADMIN`.
- **Interceptor:** Módulo del Frontend que adjunta automáticamente el JWT a cada petición HTTP.
- **Glassmorphism:** Estilo visual con `backdrop-blur`, fondos semitransparentes y bordes sutiles.
- **Bento:** Componente de cuadrícula tipo tarjeta usado en el panel de administración.
- **Papel_Termico_80mm:** Formato de impresión estándar para impresoras térmicas de 80 mm.
- **Papel_Termico_58mm:** Formato de impresión para impresoras térmicas de 58 mm.
- **Papel_Carta:** Formato de impresión estándar carta (Letter).

---

## Requisitos

### Requisito 1: Autenticación y Gestión de Sesión

**User Story:** Como cajero, quiero iniciar sesión con usuario y contraseña, para acceder al POS de forma segura y que el sistema identifique mi rol.

#### Criterios de Aceptación

1. THE Frontend SHALL mostrar una pantalla de login con campos `usuario` y `contraseña` y un botón "Iniciar sesión" como punto de entrada único de la aplicación.
2. WHEN el usuario envía credenciales válidas, THE Backend SHALL emitir un JWT firmado que incluya el identificador de usuario, el rol y la fecha de expiración.
3. WHEN el Backend emite un JWT, THE Frontend SHALL almacenar el JWT en `localStorage` y redirigir al usuario directamente al módulo POS.
4. WHEN el usuario envía credenciales inválidas, THE Backend SHALL responder con código HTTP 401 y THE Frontend SHALL mostrar un mensaje de error visible sin redirigir.
5. WHEN el usuario intenta acceder a una ruta protegida sin JWT almacenado, THE Frontend SHALL redirigir al login.
6. THE Interceptor SHALL adjuntar el header `Authorization: Bearer <token>` en todas las peticiones HTTP al Backend.
7. WHEN el Backend responde con código HTTP 401 o 403, THE Frontend SHALL eliminar el JWT de `localStorage`, mostrar un mensaje de sesión expirada y redirigir al login.
8. WHEN el usuario activa el atajo F9, THE Frontend SHALL eliminar el JWT de `localStorage` y redirigir al login.
9. THE Backend SHALL rechazar peticiones sin JWT válido con código HTTP 401.
10. THE Backend SHALL rechazar peticiones de usuarios inactivos con código HTTP 403.

---

### Requisito 2: Módulo POS — Buscador de Productos

**User Story:** Como cajero, quiero buscar productos por código de barras o nombre con el teclado, para agregar ítems al carrito de forma rápida sin usar el ratón.

#### Criterios de Aceptación

1. WHEN el cajero presiona F1, THE Frontend SHALL colocar el foco en el Buscador.
2. WHEN el cajero escribe en el Buscador, THE Frontend SHALL consultar al Backend los productos cuyo código o nombre coincidan con el texto ingresado.
3. WHEN el Backend recibe una consulta de búsqueda, THE Backend SHALL responder con la lista de productos activos que coincidan en un tiempo máximo de 300 ms.
4. WHEN la búsqueda retorna resultados, THE Frontend SHALL mostrar una lista desplegable con nombre, código y precio de cada producto.
5. WHEN el cajero presiona Enter sobre un producto seleccionado, THE Frontend SHALL agregar una nueva línea individual al Carrito sin acumular en líneas existentes.
6. WHEN el producto seleccionado es un Producto_Por_Peso, THE Frontend SHALL abrir un Modal que solicite el peso antes de agregar el Ítem al Carrito.
7. WHEN el cajero ingresa el peso en el Modal de peso y confirma, THE Frontend SHALL calcular el subtotal del Ítem multiplicando el precio por unidad por el peso ingresado y agregar el Ítem al Carrito.
8. IF el peso ingresado en el Modal de peso es menor o igual a cero, THEN THE Frontend SHALL mostrar un mensaje de error y mantener el Modal abierto.
9. WHEN el cajero presiona Esc en el Modal de peso, THE Frontend SHALL cerrar el Modal sin agregar ningún Ítem al Carrito.
10. WHEN la búsqueda no retorna resultados, THE Frontend SHALL mostrar el mensaje "Producto no encontrado" en el Buscador.

---

### Requisito 3: Módulo POS — Carrito de Compras

**User Story:** Como cajero, quiero ver y gestionar el carrito de compras con el teclado, para revisar, corregir y completar la venta sin interrupciones.

#### Criterios de Aceptación

1. THE Frontend SHALL mostrar el Carrito como una lista `ul > li` donde cada Ítem ocupa una línea con nombre y cantidad a la izquierda, y precio unitario y subtotal a la derecha.
2. WHILE el Carrito contiene al menos un Ítem, THE Frontend SHALL mostrar el subtotal sin IVA, el monto de IVA al 19% y el total con IVA en la sección de resumen.
3. WHEN el cajero presiona las teclas ↑ o ↓, THE Frontend SHALL mover el foco de selección entre los Ítems del Carrito.
4. WHEN el cajero presiona Del con un Ítem seleccionado, THE Frontend SHALL eliminar ese Ítem del Carrito y recalcular los totales.
5. WHEN el cajero presiona F2, THE Frontend SHALL eliminar el último Ítem agregado al Carrito y recalcular los totales.
6. WHEN el cajero presiona F3, THE Frontend SHALL abrir un Modal de confirmación antes de limpiar el Carrito completo.
7. WHEN el cajero confirma la limpieza en el Modal de F3, THE Frontend SHALL vaciar el Carrito y reiniciar los totales a cero.
8. WHEN el cajero presiona Esc en el Modal de confirmación de F3, THE Frontend SHALL cerrar el Modal sin modificar el Carrito.
9. THE Frontend SHALL recalcular automáticamente subtotal, IVA y total cada vez que se agregue o elimine un Ítem del Carrito.
10. WHEN un producto tiene el flag `incluye_iva` en `true`, THE Frontend SHALL tratar su precio como Precio_Con_IVA y desglosar el IVA incluido en el resumen.
11. WHEN un producto tiene el flag `incluye_iva` en `false`, THE Frontend SHALL tratar su precio como Precio_Base y agregar el 19% de IVA al calcular el total.

---

### Requisito 4: Módulo POS — IVA y Descuentos

**User Story:** Como cajero, quiero consultar y ajustar el desglose de IVA y aplicar descuentos globales, para ofrecer precios correctos al cliente.

#### Criterios de Aceptación

1. WHEN el cajero presiona F4, THE Frontend SHALL abrir el Modal de IVA/Descuento.
2. THE Modal de IVA/Descuento SHALL mostrar el subtotal sin IVA, el monto de IVA calculado al 19% y el total con IVA de la venta en curso.
3. WHEN el cajero ingresa un porcentaje de descuento global en el Modal de IVA/Descuento, THE Frontend SHALL recalcular el total aplicando el descuento sobre el subtotal antes de calcular el IVA.
4. IF el porcentaje de descuento ingresado es menor a 0 o mayor a 100, THEN THE Frontend SHALL mostrar un mensaje de error y no aplicar el descuento.
5. WHEN el cajero confirma el descuento en el Modal, THE Frontend SHALL actualizar el resumen del Carrito con los nuevos valores calculados.
6. WHEN el cajero presiona Esc en el Modal de IVA/Descuento, THE Frontend SHALL cerrar el Modal sin modificar los valores del Carrito.

---

### Requisito 5: Módulo POS — Método de Pago

**User Story:** Como cajero, quiero seleccionar el método de pago con el teclado, para registrar cómo el cliente cancela la venta.

#### Criterios de Aceptación

1. WHEN el cajero presiona F5, THE Frontend SHALL abrir el Modal de Método_De_Pago.
2. THE Modal de Método_De_Pago SHALL presentar las opciones Efectivo, Tarjeta y Transferencia navegables con las teclas ↑ y ↓.
3. WHEN el cajero presiona Enter sobre una opción, THE Frontend SHALL seleccionar ese Método_De_Pago.
4. WHEN el cajero selecciona Efectivo, THE Frontend SHALL mostrar un campo para ingresar el monto recibido y calcular el Cambio automáticamente.
5. WHEN el monto recibido en efectivo es menor al total de la Venta, THE Frontend SHALL mostrar un mensaje de error y deshabilitar el botón de confirmar pago.
6. WHEN el cajero confirma el Método_De_Pago, THE Frontend SHALL registrar la selección y cerrar el Modal.
7. WHEN el cajero presiona Esc en el Modal de Método_De_Pago, THE Frontend SHALL cerrar el Modal sin registrar ningún Método_De_Pago.

---

### Requisito 6: Módulo POS — Procesamiento de Venta y Ticket

**User Story:** Como cajero, quiero procesar el cobro y generar el ticket, para completar la venta y entregar el comprobante al cliente.

#### Criterios de Aceptación

1. WHEN el cajero presiona F6, THE Frontend SHALL iniciar el proceso de checkout enviando la Venta al Backend.
2. THE Backend SHALL persistir la Venta con todos sus Ítems, el Método_De_Pago, el total con IVA, el IVA desglosado y el identificador del cajero.
3. WHEN el Backend persiste la Venta exitosamente, THE Backend SHALL responder con el número de Venta generado y THE Frontend SHALL abrir el Modal del Ticket.
4. THE Modal del Ticket SHALL mostrar: número de venta, fecha y hora, nombre del cajero, lista de Ítems (nombre, cantidad, precio unitario, subtotal), subtotal sin IVA, IVA 19%, total con IVA, Método_De_Pago y Cambio si el pago fue en efectivo.
5. WHEN el cajero presiona F7 o hace clic en "Imprimir", THE Frontend SHALL invocar `window.print()` con estilos de impresión adaptados al formato de papel configurado.
6. WHEN el cajero hace clic en "Guardar PDF", THE Frontend SHALL invocar `window.print()` con destino PDF del navegador para descargar el Ticket como archivo PDF.
7. WHEN el cajero presiona F8 o hace clic en "Nueva Venta", THE Frontend SHALL cerrar el Modal del Ticket, vaciar el Carrito y reiniciar el POS para una nueva venta.
8. IF el Carrito está vacío cuando el cajero presiona F6, THEN THE Frontend SHALL mostrar un mensaje de error y no enviar la Venta al Backend.
9. IF no se ha seleccionado un Método_De_Pago cuando el cajero presiona F6, THEN THE Frontend SHALL mostrar un mensaje de error indicando que debe seleccionar el método de pago.
10. IF el Backend responde con error al persistir la Venta, THEN THE Frontend SHALL mostrar un mensaje de error descriptivo y mantener el Carrito intacto.

---

### Requisito 7: Módulo POS — Navegación por Teclado y Menú de Desbordamiento

**User Story:** Como cajero, quiero operar el POS completamente con el teclado usando teclas de función, para mantener la velocidad de atención sin necesidad de ratón.

#### Criterios de Aceptación

1. THE Frontend SHALL interceptar las teclas F1 a F9 globalmente mientras el POS esté activo y ejecutar la acción correspondiente según la tabla de atajos definida.
2. THE Frontend SHALL interceptar la tecla M globalmente mientras el POS esté activo y abrir un menú desplegable con los atajos secundarios disponibles.
3. WHEN un Modal está abierto, THE Frontend SHALL interceptar la tecla Esc y cerrar el Modal activo sin ejecutar otras acciones.
4. THE Frontend SHALL mostrar en pantalla la tabla de atajos de teclado activos como referencia visual permanente para el cajero.
5. WHEN el cajero presiona F9, THE Frontend SHALL cerrar la sesión del cajero eliminando el JWT y redirigiendo al login.
6. THE Frontend SHALL deshabilitar los atajos de teclado del POS mientras un Modal esté abierto, excepto Esc.

---

### Requisito 8: Módulo de Productos — CRUD

**User Story:** Como administrador, quiero crear, editar, desactivar y consultar productos, para mantener el catálogo actualizado con precios y datos correctos.

#### Criterios de Aceptación

1. THE Backend SHALL exponer el endpoint `GET /productos` que retorne la lista paginada de productos con soporte para filtros por nombre, categoría y estado.
2. THE Backend SHALL exponer el endpoint `POST /productos` que cree un nuevo producto con los campos: código, nombre, descripción, categoría, precio, `incluye_iva`, unidad de medida y estado.
3. THE Backend SHALL exponer el endpoint `PUT /productos/:id` que actualice los datos de un producto existente.
4. THE Backend SHALL exponer el endpoint `DELETE /productos/:id` que desactive lógicamente el producto (estado `inactivo`) sin eliminarlo físicamente de la base de datos.
5. WHEN el Admin envía una solicitud `POST /productos` con campos obligatorios faltantes, THE Backend SHALL responder con código HTTP 400 y un mensaje descriptivo por campo inválido.
6. WHEN el Admin envía un código de producto duplicado, THE Backend SHALL responder con código HTTP 409.
7. THE Frontend SHALL mostrar el formulario de creación y edición de productos con validación en cliente antes de enviar al Backend.
8. WHEN el Supervisor accede al módulo de productos, THE Frontend SHALL mostrar la lista de productos en modo solo lectura sin botones de edición ni eliminación.
9. WHEN un usuario con rol `CAJERO` intenta acceder al endpoint `/productos` con método POST, PUT o DELETE, THE Backend SHALL responder con código HTTP 403.

---

### Requisito 9: Módulo de Usuarios — CRUD

**User Story:** Como administrador, quiero crear, editar y desactivar usuarios del sistema, para controlar quién tiene acceso al POS y con qué permisos.

#### Criterios de Aceptación

1. THE Backend SHALL exponer el endpoint `GET /usuarios` que retorne la lista de usuarios con su rol y estado, accesible solo para el rol `ADMIN`.
2. THE Backend SHALL exponer el endpoint `POST /usuarios` que cree un nuevo usuario con campos: nombre, apellido, nombre de usuario, contraseña, rol y estado.
3. THE Backend SHALL exponer el endpoint `PUT /usuarios/:id` que actualice los datos de un usuario existente, incluyendo cambio de rol y estado.
4. THE Backend SHALL exponer el endpoint `DELETE /usuarios/:id` que desactive lógicamente al usuario sin eliminarlo físicamente.
5. WHEN el Admin crea un usuario con nombre de usuario duplicado, THE Backend SHALL responder con código HTTP 409.
6. THE Backend SHALL almacenar las contraseñas usando un algoritmo de hash seguro (bcrypt) y nunca retornarlas en las respuestas.
7. WHEN un usuario con rol distinto a `ADMIN` intenta acceder a cualquier endpoint de `/usuarios`, THE Backend SHALL responder con código HTTP 403.
8. THE Frontend SHALL mostrar el módulo de gestión de usuarios únicamente a usuarios con rol `ADMIN`.

---

### Requisito 10: Módulo de Reportes

**User Story:** Como supervisor o administrador, quiero consultar reportes de ventas por período, para analizar el desempeño del negocio.

#### Criterios de Aceptación

1. THE Backend SHALL exponer el endpoint `GET /reportes/ventas` que acepte parámetros de fecha inicio y fecha fin y retorne el resumen de ventas del período.
2. THE Backend SHALL incluir en el reporte: número total de ventas, monto total vendido, desglose por Método_De_Pago y lista de ventas individuales con cajero, total e ítems.
3. THE Frontend SHALL mostrar el módulo de reportes con filtros de período: hoy, esta semana y este mes, además de rango de fechas personalizado.
4. WHEN el Admin o Supervisor selecciona un período, THE Frontend SHALL consultar al Backend y mostrar los resultados en tablas y gráficos de resumen.
5. WHEN un usuario con rol `CAJERO` intenta acceder al endpoint `/reportes`, THE Backend SHALL responder con código HTTP 403.
6. THE Frontend SHALL mostrar el módulo de reportes únicamente a usuarios con rol `ADMIN` o `SUPERVISOR`.

---

### Requisito 11: Módulo de Configuración

**User Story:** Como administrador, quiero configurar los parámetros del sistema, para adaptar el POS al negocio (nombre, IVA, formato de impresión).

#### Criterios de Aceptación

1. THE Backend SHALL exponer el endpoint `GET /configuracion` que retorne los parámetros actuales del sistema.
2. THE Backend SHALL exponer el endpoint `PUT /configuracion` que actualice los parámetros: nombre del negocio, tasa de IVA, formato de papel de impresión y logo.
3. THE Frontend SHALL mostrar el módulo de configuración únicamente a usuarios con rol `ADMIN`.
4. WHEN el Admin actualiza el formato de papel, THE Frontend SHALL aplicar el nuevo formato en los estilos de impresión del Ticket en la siguiente impresión.
5. WHEN el Admin actualiza la tasa de IVA, THE Frontend SHALL usar la nueva tasa en todos los cálculos del Carrito a partir de ese momento.
6. WHEN un usuario con rol distinto a `ADMIN` intenta acceder al endpoint `/configuracion` con método PUT, THE Backend SHALL responder con código HTTP 403.

---

### Requisito 12: Impresión y Formatos de Ticket

**User Story:** Como cajero, quiero imprimir o guardar el ticket en el formato correcto para la impresora del negocio, para entregar un comprobante legible al cliente.

#### Criterios de Aceptación

1. THE Frontend SHALL aplicar estilos CSS de impresión (`@media print`) que oculten todos los elementos de la interfaz excepto el contenido del Ticket.
2. WHERE el formato configurado es Papel_Termico_80mm, THE Frontend SHALL aplicar un ancho de impresión de 80 mm con fuente monoespaciada de 10pt.
3. WHERE el formato configurado es Papel_Termico_58mm, THE Frontend SHALL aplicar un ancho de impresión de 58 mm con fuente monoespaciada de 8pt.
4. WHERE el formato configurado es Papel_Carta, THE Frontend SHALL aplicar el formato estándar carta con márgenes de 2 cm.
5. THE Ticket SHALL incluir el nombre del negocio configurado en el encabezado de cada impresión.
6. WHEN el cajero guarda el Ticket como PDF, THE Frontend SHALL invocar `window.print()` con destino PDF del navegador sin requerir librerías externas de generación de PDF.

---

## Requisitos Funcionales

| ID | Módulo | Descripción | Rol Mínimo |
|----|--------|-------------|------------|
| RF-01 | Autenticación | Login con usuario/contraseña y emisión de JWT | Todos |
| RF-02 | Autenticación | Almacenamiento de JWT en localStorage | Todos |
| RF-03 | Autenticación | Interceptor automático de JWT en peticiones HTTP | Todos |
| RF-04 | Autenticación | Cierre de sesión con F9 o botón | Todos |
| RF-05 | Autenticación | Redirección automática al login por token inválido | Todos |
| RF-06 | POS | Buscador de productos por código o nombre con F1 | Cajero |
| RF-07 | POS | Agregar ítem al carrito con Enter (siempre línea nueva) | Cajero |
| RF-08 | POS | Modal de peso para Productos_Por_Peso | Cajero |
| RF-09 | POS | Eliminar último ítem con F2 | Cajero |
| RF-10 | POS | Limpiar carrito con F3 + confirmación | Cajero |
| RF-11 | POS | Modal de IVA/Descuento con F4 | Cajero |
| RF-12 | POS | Modal de Método_De_Pago con F5 (↑↓ + Enter) | Cajero |
| RF-13 | POS | Cálculo automático de Cambio para pago en efectivo | Cajero |
| RF-14 | POS | Procesamiento de venta con F6 | Cajero |
| RF-15 | POS | Modal de Ticket con todos los campos requeridos | Cajero |
| RF-16 | POS | Impresión de Ticket con F7 / `window.print()` | Cajero |
| RF-17 | POS | Guardar Ticket como PDF | Cajero |
| RF-18 | POS | Nueva venta con F8 | Cajero |
| RF-19 | POS | Navegación del carrito con ↑↓ y eliminación con Del | Cajero |
| RF-20 | POS | Menú de desbordamiento con M | Cajero |
| RF-21 | POS | Cálculo de IVA (19%) con desglose en resumen | Cajero |
| RF-22 | POS | Soporte de precios con y sin IVA incluido por producto | Cajero |
| RF-23 | Productos | Listado paginado con filtros | Supervisor |
| RF-24 | Productos | Creación de producto (Admin) | Admin |
| RF-25 | Productos | Edición de producto (Admin) | Admin |
| RF-26 | Productos | Desactivación lógica de producto (Admin) | Admin |
| RF-27 | Usuarios | Listado de usuarios | Admin |
| RF-28 | Usuarios | Creación de usuario con rol | Admin |
| RF-29 | Usuarios | Edición de usuario (rol, estado) | Admin |
| RF-30 | Usuarios | Desactivación lógica de usuario | Admin |
| RF-31 | Reportes | Reporte de ventas por período (hoy/semana/mes/rango) | Supervisor |
| RF-32 | Reportes | Desglose por método de pago en reportes | Supervisor |
| RF-33 | Configuración | Actualización de nombre del negocio, IVA y formato de papel | Admin |
| RF-34 | Configuración | Aplicación inmediata de cambios de configuración en el POS | Admin |

---

## Requisitos No Funcionales

### Rendimiento

| ID | Descripción |
|----|-------------|
| RNF-01 | THE Backend SHALL responder a búsquedas de productos en un tiempo máximo de 300 ms bajo carga normal (hasta 50 peticiones concurrentes). |
| RNF-02 | THE Backend SHALL responder a la creación de una Venta en un tiempo máximo de 500 ms. |
| RNF-03 | THE Frontend SHALL renderizar los cambios del Carrito (agregar/eliminar Ítem) en un tiempo máximo de 100 ms desde la acción del cajero. |
| RNF-04 | THE Backend SHALL soportar al menos 10 sesiones de cajero concurrentes sin degradación de rendimiento. |

### Seguridad

| ID | Descripción |
|----|-------------|
| RNF-05 | THE Backend SHALL firmar los JWT con un secreto de al menos 256 bits y una expiración máxima de 8 horas. |
| RNF-06 | THE Backend SHALL almacenar contraseñas usando bcrypt con un factor de costo mínimo de 10. |
| RNF-07 | THE Backend SHALL validar el rol del usuario en cada endpoint protegido y rechazar accesos no autorizados con HTTP 403. |
| RNF-08 | THE Backend SHALL configurar CORS para aceptar peticiones únicamente desde el origen del Frontend configurado. |
| RNF-09 | THE Frontend SHALL sanitizar todas las entradas del usuario antes de enviarlas al Backend para prevenir inyección de datos. |
| RNF-10 | THE Backend SHALL registrar en log todos los intentos de autenticación fallidos con timestamp e IP de origen. |

### Usabilidad y Accesibilidad por Teclado

| ID | Descripción |
|----|-------------|
| RNF-11 | THE Frontend SHALL permitir completar una venta completa (buscar producto → agregar → pagar → imprimir ticket) sin usar el ratón. |
| RNF-12 | THE Frontend SHALL mostrar una referencia visual permanente de los atajos de teclado activos en la pantalla del POS. |
| RNF-13 | WHEN el cajero presiona una tecla de función (F1–F9), THE Frontend SHALL ejecutar la acción correspondiente en menos de 50 ms. |
| RNF-14 | THE Frontend SHALL mantener el foco visible en el elemento activo en todo momento mediante un indicador visual claro. |
| RNF-15 | THE Frontend SHALL aplicar el estilo glassmorphism con `backdrop-blur`, fondos `bg-white/10` y bordes `border-white/20` de forma consistente en todos los componentes. |
| RNF-16 | THE Frontend SHALL ofrecer un toggle de modo oscuro/claro accesible desde la interfaz principal. |
| RNF-17 | THE Frontend SHALL usar la distribución de grid de 12 columnas definida en `estructura.html` como base del layout del POS. |

### Disponibilidad y Mantenibilidad

| ID | Descripción |
|----|-------------|
| RNF-18 | THE Backend SHALL exponer un endpoint `GET /health` que retorne el estado del servicio para monitoreo. |
| RNF-19 | THE Backend SHALL versionar el esquema de datos mediante archivos JSON seed en `db/dynamodb/seed/` y definición de tablas en SAM (`template.yaml`). |
| RNF-20 | THE Frontend SHALL separar la lógica de negocio (cálculos de IVA, totales) de los componentes de presentación en módulos independientes. |
| RNF-21 | THE Backend SHALL retornar mensajes de error estructurados en formato JSON con campos `codigo`, `mensaje` y `detalles` en todas las respuestas de error. |
