# Módulo: Estadísticas

## Requisito 13 — Dashboard de Métricas

**User Story:** Como gerente, quiero ver métricas del inventario en un dashboard para tomar decisiones informadas.

### Criterios de Aceptación

1. WHEN el usuario accede a `/stats`, THE App SHALL consumir `GET /stats` y mostrar las métricas: `totalProductos`, `totalStock`, `distribucionPorCategoria` y `productosConStockBajo`.
2. THE App SHALL mostrar `distribucionPorCategoria` como un gráfico de barras o de torta.
3. THE App SHALL mostrar `productosConStockBajo` como una lista de alerta con los productos que tienen stock menor a 5 unidades.
4. THE App SHALL incluir un botón `"Actualizar"` que recargue las métricas sin recargar la página.
5. WHILE las métricas se están cargando, THE App SHALL mostrar skeleton loaders en lugar de los valores.
