# Requisitos No Funcionales (RNF)

## RNF-01: Rendimiento

1. WHILE el sistema está bajo carga normal (hasta 100 solicitudes concurrentes), THE Lambda SHALL completar la ejecución de cada solicitud en un tiempo máximo de **1000 ms** medido desde la recepción del evento hasta la respuesta.
2. WHEN una Lambda es invocada en frío (cold start), THE Lambda SHALL completar la inicialización y retornar una respuesta en un tiempo máximo de **3000 ms**.
3. THE Stats_Engine SHALL calcular y retornar las métricas del inventario en un tiempo máximo de **2000 ms** independientemente del número de productos activos.

---

## RNF-02: Disponibilidad

1. THE API SHALL mantener una disponibilidad mínima del **99.5% mensual**, excluyendo ventanas de mantenimiento programadas notificadas con al menos 24 horas de anticipación.
2. IF un componente de infraestructura subyacente (DynamoDB, API Gateway) experimenta una degradación, THEN THE API SHALL retornar respuestas de error apropiadas en lugar de timeouts silenciosos.

---

## RNF-03: Seguridad

1. THE API SHALL requerir autenticación mediante token JWT válido en todos los endpoints, excepto `/health`.
2. THE API SHALL autorizar cada solicitud verificando que el rol del usuario en el token JWT tenga permiso para la operación solicitada, según la matriz de roles definida en la configuración del sistema.
3. THE API SHALL transmitir todos los datos exclusivamente sobre **HTTPS/TLS 1.2** o superior.
4. THE Repository SHALL almacenar datos sensibles del cliente (email, teléfono) con cifrado en reposo utilizando las capacidades de cifrado de DynamoDB.
5. IF un token JWT está expirado o es inválido, THEN THE API SHALL retornar un código HTTP 401 con el mensaje `"No autorizado"` sin exponer detalles del mecanismo de autenticación.

---

## RNF-04: Escalabilidad

1. THE Lambda SHALL escalar automáticamente para manejar hasta **500 solicitudes concurrentes** sin degradación de rendimiento por encima de los umbrales definidos en RNF-01.
2. THE Repository SHALL utilizar DynamoDB con capacidad **bajo demanda (on-demand)** para escalar el almacenamiento y el throughput de forma automática según la carga.
3. WHILE la carga concurrente supera las 200 solicitudes simultáneas, THE API SHALL mantener una tasa de error inferior al **1%** para operaciones de lectura.

---

## RNF-05: Mantenibilidad

1. THE API SHALL mantener una cobertura de pruebas unitarias mínima del **80%** sobre la lógica de negocio de cada Lambda, medida por la herramienta de cobertura configurada en el proyecto.
2. THE API SHALL exponer documentación **OpenAPI 3.0** actualizada en el endpoint `/docs`, generada automáticamente a partir de las definiciones del template SAM.
3. THE Repository SHALL seguir la arquitectura hexagonal definida en el proyecto, separando dominio, aplicación e infraestructura en capas independientes y verificables.

---

## RNF-06: Observabilidad

1. THE Lambda SHALL emitir logs estructurados en formato JSON para cada solicitud procesada, incluyendo los campos: `requestId`, `path`, `method`, `statusCode`, `durationMs` y `timestamp`.
2. WHEN una Lambda lanza una excepción, THE Lambda SHALL registrar en el log el campo `error` con el mensaje de la excepción y el campo `stack` con el stack trace completo, sin exponer esta información en la respuesta HTTP.
3. THE Lambda SHALL propagar el encabezado `X-Correlation-ID` recibido en la solicitud a todos los logs y respuestas generados durante el procesamiento, para permitir la trazabilidad distribuida.
4. THE API SHALL emitir métricas personalizadas a AWS CloudWatch para los eventos: invocación de Lambda, error de validación, error de stock insuficiente y venta POS completada.
