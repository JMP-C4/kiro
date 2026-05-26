package com.pos.supermarket.productos;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    boolean existsByCodigo(String codigo);

    // Búsqueda rápida para el POS (máx 300ms — RNF-01)
    @Query("SELECT p FROM Producto p WHERE p.activo = true AND " +
           "(LOWER(p.codigo) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           " LOWER(p.nombre) LIKE LOWER(CONCAT('%', :q, '%')))")
    List<Producto> buscarActivos(@Param("q") String q);

    // Listado paginado con filtros para el módulo admin
    @Query("SELECT p FROM Producto p WHERE " +
           "(:q IS NULL OR LOWER(p.nombre) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(p.codigo) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<Producto> findAllWithFilter(@Param("q") String q, Pageable pageable);
}
