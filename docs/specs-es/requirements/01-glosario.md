# Glosario

| Término | Definición |
|---------|-----------|
| **API** | Interfaz de programación de aplicaciones REST expuesta vía API Gateway. |
| **Lambda** | Función AWS Lambda en Node.js 20.x que ejecuta lógica de negocio. |
| **Producto** | Entidad que representa un artículo del inventario con nombre, categoría, precio y stock. |
| **Cliente** | Entidad que representa a un comprador registrado en el sistema. |
| **Cobro** | Transacción de pago asociada a uno o más productos adquiridos por un cliente. |
| **Crédito** | Saldo a favor otorgado a un cliente, aplicable en cobros futuros. |
| **Categoría** | Clasificación temática a la que pertenece un producto. |
| **Stock** | Cantidad disponible de un producto en el inventario. |
| **Validator** | Componente encargado de validar la estructura y los valores de los datos de entrada. |
| **Repository** | Componente encargado de la persistencia y recuperación de entidades del dominio. |
| **Health_Checker** | Componente encargado de verificar el estado operativo del sistema. |
| **Stats_Engine** | Componente encargado de calcular métricas y estadísticas del inventario. |
| **POS** | Point of Sale (Punto de Venta). Módulo que integra el inventario con el sistema de cobros para gestionar ventas presenciales en caja. |
| **Sesión_de_Caja** | Período de operación de una caja registradora, delimitado por una apertura con monto inicial y un cierre con monto final. |
| **Ticket** | Documento digital generado al completar una venta en el POS, que resume los productos, montos, método de pago y datos de la sesión. |
| **Método_de_Pago** | Forma en que el cliente liquida una venta; puede ser efectivo, tarjeta o crédito del cliente. |
| **POS_Manager** | Componente encargado de gestionar sesiones de caja, ventas y generación de tickets en el módulo POS. |
