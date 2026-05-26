package com.pos.supermarket.ventas.dto;

import com.pos.supermarket.ventas.Venta;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class VentaResponse {
    private Long id;
    private String numeroVenta;
    private String cajeroNombre;
    private BigDecimal subtotalSinIva;
    private BigDecimal descuentoPct;
    private BigDecimal descuentoMonto;
    private BigDecimal ivaMonto;
    private BigDecimal totalConIva;
    private String metodoPago;
    private BigDecimal montoRecibido;
    private BigDecimal cambio;
    private LocalDateTime createdAt;
    private List<VentaItemResponse> items;

    public static VentaResponse from(Venta v) {
        VentaResponse r = new VentaResponse();
        r.setId(v.getId());
        r.setNumeroVenta(v.getNumeroVenta());
        r.setCajeroNombre(v.getCajero().getNombre() + " " + v.getCajero().getApellido());
        r.setSubtotalSinIva(v.getSubtotalSinIva());
        r.setDescuentoPct(v.getDescuentoPct());
        r.setDescuentoMonto(v.getDescuentoMonto());
        r.setIvaMonto(v.getIvaMonto());
        r.setTotalConIva(v.getTotalConIva());
        r.setMetodoPago(v.getMetodoPago());
        r.setMontoRecibido(v.getMontoRecibido());
        r.setCambio(v.getCambio());
        r.setCreatedAt(v.getCreatedAt());
        r.setItems(v.getItems().stream().map(VentaItemResponse::from).toList());
        return r;
    }
}
