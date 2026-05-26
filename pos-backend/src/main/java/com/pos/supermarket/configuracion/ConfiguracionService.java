package com.pos.supermarket.configuracion;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class ConfiguracionService {

    private final ConfiguracionRepository repo;

    public Configuracion obtener() {
        return repo.findAll().stream().findFirst()
                .orElseGet(() -> {
                    // Crear configuración por defecto si no existe
                    Configuracion c = new Configuracion();
                    c.setNombreNegocio("Mi Supermercado");
                    c.setTasaIva(new BigDecimal("0.19"));
                    c.setFormatoPapel("80mm");
                    return repo.save(c);
                });
    }

    @Transactional
    public Configuracion actualizar(Configuracion request) {
        Configuracion c = obtener();
        if (request.getNombreNegocio() != null) c.setNombreNegocio(request.getNombreNegocio());
        if (request.getTasaIva() != null) c.setTasaIva(request.getTasaIva());
        if (request.getFormatoPapel() != null) c.setFormatoPapel(request.getFormatoPapel());
        if (request.getLogoUrl() != null) c.setLogoUrl(request.getLogoUrl());
        return repo.save(c);
    }
}
