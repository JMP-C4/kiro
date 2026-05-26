package com.pos.supermarket.productos.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductoRequest {
    @NotBlank
    private String codigo;
    @NotBlank
    private String nombre;
    private String descripcion;
    private String categoria;
    @NotNull @Positive
    private BigDecimal precio;
    private boolean incluyeIva = false;
    @NotBlank
    private String unidadMedida = "und";
}
