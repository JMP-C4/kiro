package com.pos.supermarket.productos;

import com.pos.supermarket.productos.dto.ProductoRequest;
import com.pos.supermarket.shared.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/productos")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService productoService;

    /** Búsqueda rápida para el POS — GET /productos?q=texto */
    @GetMapping
    public ResponseEntity<?> listar(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        // Si viene parámetro q, devuelve lista simple para el buscador del POS
        if (q != null && !q.isBlank()) {
            List<Producto> resultados = productoService.buscar(q);
            return ResponseEntity.ok(resultados);
        }

        // Sin q: listado paginado para el módulo admin
        Page<Producto> paginado = productoService.listar(null, PageRequest.of(page, size));
        return ResponseEntity.ok(paginado);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Producto>> crear(@Valid @RequestBody ProductoRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Producto creado", productoService.crear(req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Producto>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ProductoRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Producto actualizado", productoService.actualizar(id, req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> desactivar(@PathVariable Long id) {
        productoService.desactivar(id);
        return ResponseEntity.ok(ApiResponse.ok("Producto desactivado", null));
    }
}
