package com.pos.supermarket.ventas;

import com.pos.supermarket.usuarios.Usuario;
import com.pos.supermarket.usuarios.UsuarioRepository;
import com.pos.supermarket.ventas.dto.VentaRequest;
import com.pos.supermarket.ventas.dto.VentaResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class VentaService {

    private static final BigDecimal TASA_IVA = new BigDecimal("0.19");
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyyMMdd");

    private final VentaRepository ventaRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public VentaResponse crear(VentaRequest req, String username) {
        // Obtener cajero — en modo acceso libre usamos el admin como fallback
        Usuario cajero = usuarioRepository.findByUsername(username)
                .or(() -> usuarioRepository.findAll().stream().findFirst())
                .orElseThrow(() -> new EntityNotFoundException("No hay usuarios en el sistema"));

        // Calcular totales en backend (validación P-08)
        BigDecimal subtotalSinIva = req.getItems().stream()
                .map(item -> {
                    BigDecimal base = item.isIncluyeIva()
                            ? item.getPrecioUnitario().divide(BigDecimal.ONE.add(TASA_IVA), 4, RoundingMode.HALF_UP)
                            : item.getPrecioUnitario();
                    return base.multiply(item.getCantidad());
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal descuentoPct = req.getDescuentoPct() != null ? req.getDescuentoPct() : BigDecimal.ZERO;
        BigDecimal descuentoMonto = subtotalSinIva.multiply(descuentoPct).setScale(2, RoundingMode.HALF_UP);
        BigDecimal baseConDescuento = subtotalSinIva.subtract(descuentoMonto);
        BigDecimal ivaMonto = baseConDescuento.multiply(TASA_IVA).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalConIva = baseConDescuento.add(ivaMonto).setScale(2, RoundingMode.HALF_UP);

        // Calcular cambio para efectivo
        BigDecimal cambio = null;
        if ("EFECTIVO".equals(req.getMetodoPago()) && req.getMontoRecibido() != null) {
            cambio = req.getMontoRecibido().subtract(totalConIva).max(BigDecimal.ZERO);
        }

        // Generar número de venta único: VTA-YYYYMMDD-NNNN (P-08)
        String prefix = "VTA-" + LocalDate.now().format(DATE_FMT) + "-";
        long count = ventaRepository.countByPrefix(prefix);
        String numeroVenta = prefix + String.format("%04d", count + 1);

        // Construir entidad
        Venta venta = new Venta();
        venta.setNumeroVenta(numeroVenta);
        venta.setCajero(cajero);
        venta.setSubtotalSinIva(subtotalSinIva.setScale(2, RoundingMode.HALF_UP));
        venta.setDescuentoPct(descuentoPct.setScale(2, RoundingMode.HALF_UP));
        venta.setDescuentoMonto(descuentoMonto);
        venta.setIvaMonto(ivaMonto);
        venta.setTotalConIva(totalConIva);
        venta.setMetodoPago(req.getMetodoPago());
        venta.setMontoRecibido(req.getMontoRecibido());
        venta.setCambio(cambio);

        // Items
        req.getItems().forEach(itemReq -> {
            VentaItem item = new VentaItem();
            item.setVenta(venta);
            item.setProductoId(itemReq.getProductoId());
            item.setNombreProducto(itemReq.getNombreProducto());
            item.setCantidad(itemReq.getCantidad());
            item.setPrecioUnitario(itemReq.getPrecioUnitario());
            item.setIncluyeIva(itemReq.isIncluyeIva());
            item.setSubtotal(itemReq.getSubtotal());
            venta.getItems().add(item);
        });

        Venta saved = ventaRepository.save(venta);
        return VentaResponse.from(saved);
    }
}
