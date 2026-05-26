package com.pos.supermarket.reportes.dto;

import com.pos.supermarket.ventas.dto.VentaResponse;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class ReporteVentasResponse {
    private long totalVentas;
    private BigDecimal montoTotal;
    private Map<String, BigDecimal> desglosePorMetodo;
    private List<VentaResponse> ventas;
}
