package com.pos.supermarket.ventas.dto;

import com.pos.supermarket.ventas.VentaItem;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class VentaItemResponse {
    private Long id;
    private Long productoId;
    private String nombreProducto;
    private BigDecimal cantidad;
    private BigDecimal precioUnitario;
    private boolean incluyeIva;
    private BigDecimal subtotal;

    public static VentaItemResponse from(VentaItem item) {
        VentaItemResponse r = new VentaItemResponse();
        r.setId(item.getId());
        r.setProductoId(item.getProductoId());
        r.setNombreProducto(item.getNombreProducto());
        r.setCantidad(item.getCantidad());
        r.setPrecioUnitario(item.getPrecioUnitario());
        r.setIncluyeIva(item.isIncluyeIva());
        r.setSubtotal(item.getSubtotal());
        return r;
    }
}
