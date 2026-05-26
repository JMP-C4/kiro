package com.pos.supermarket.productos;

import com.pos.supermarket.productos.dto.ProductoRequest;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductoService {

    private final ProductoRepository productoRepository;

    public List<Producto> buscar(String q) {
        if (q == null || q.isBlank()) return List.of();
        return productoRepository.buscarActivos(q.trim());
    }

    public Page<Producto> listar(String q, Pageable pageable) {
        return productoRepository.findAllWithFilter(q, pageable);
    }

    @Transactional
    public Producto crear(ProductoRequest req) {
        Producto p = new Producto();
        mapear(req, p);
        return productoRepository.save(p);
    }

    @Transactional
    public Producto actualizar(Long id, ProductoRequest req) {
        Producto p = productoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado: " + id));
        mapear(req, p);
        return productoRepository.save(p);
    }

    @Transactional
    public void desactivar(Long id) {
        Producto p = productoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado: " + id));
        p.setActivo(false);
        productoRepository.save(p);
    }

    private void mapear(ProductoRequest req, Producto p) {
        p.setCodigo(req.getCodigo());
        p.setNombre(req.getNombre());
        p.setDescripcion(req.getDescripcion());
        p.setCategoria(req.getCategoria());
        p.setPrecio(req.getPrecio());
        p.setIncluyeIva(req.isIncluyeIva());
        p.setUnidadMedida(req.getUnidadMedida());
    }
}
