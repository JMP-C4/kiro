package com.pos.supermarket.configuracion;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "configuracion")
public class Configuracion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre_negocio", nullable = false, length = 200)
    private String nombreNegocio = "Mi Supermercado";

    @Column(name = "tasa_iva", nullable = false, precision = 5, scale = 4)
    private BigDecimal tasaIva = new BigDecimal("0.19");

    @Column(name = "formato_papel", nullable = false, length = 20)
    private String formatoPapel = "80mm";

    @Column(name = "logo_url", columnDefinition = "TEXT")
    private String logoUrl;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
