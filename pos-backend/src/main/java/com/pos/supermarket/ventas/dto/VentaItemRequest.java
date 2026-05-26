package com.pos.supermarket.ventas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class VentaItemRequest {
    private Long productoId;
    @NotBlank
    private String nombreProducto;
    @NotNull @Positive
    private BigDecimal cantidad;
    @NotNull @Positive
    private BigDecimal precioUnitario;
    private boolean incluyeIva;
    @NotNull @Positive
    private BigDecimal subtotal;
}
