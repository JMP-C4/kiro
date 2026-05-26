package com.pos.supermarket.ventas.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class VentaRequest {
    @NotEmpty @Valid
    private List<VentaItemRequest> items;
    @NotNull
    private BigDecimal descuentoPct = BigDecimal.ZERO;
    @NotBlank
    private String metodoPago;
    private BigDecimal montoRecibido;
}
