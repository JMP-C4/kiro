package com.pos.supermarket.ventas;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface VentaRepository extends JpaRepository<Venta, Long> {

    @Query("SELECT COUNT(v) FROM Venta v WHERE DATE(v.createdAt) = CURRENT_DATE AND v.numeroVenta LIKE :prefix%")
    long countByPrefix(@Param("prefix") String prefix);

    List<Venta> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime desde, LocalDateTime hasta);
}
