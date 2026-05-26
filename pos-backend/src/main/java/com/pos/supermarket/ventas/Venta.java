package com.pos.supermarket.ventas;

import com.pos.supermarket.usuarios.Usuario;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "ventas")
public class Venta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_venta", nullable = false, unique = true, length = 20)
    private String numeroVenta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cajero_id", nullable = false)
    private Usuario cajero;

    @Column(name = "subtotal_sin_iva", nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotalSinIva;

    @Column(name = "descuento_pct", nullable = false, precision = 5, scale = 2)
    private BigDecimal descuentoPct = BigDecimal.ZERO;

    @Column(name = "descuento_monto", nullable = false, precision = 12, scale = 2)
    private BigDecimal descuentoMonto = BigDecimal.ZERO;

    @Column(name = "iva_monto", nullable = false, precision = 12, scale = 2)
    private BigDecimal ivaMonto;

    @Column(name = "total_con_iva", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalConIva;

    @Column(name = "metodo_pago", nullable = false, length = 20)
    private String metodoPago;

    @Column(name = "monto_recibido", precision = 12, scale = 2)
    private BigDecimal montoRecibido;

    @Column(precision = 12, scale = 2)
    private BigDecimal cambio;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VentaItem> items = new ArrayList<>();
}
