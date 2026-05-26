package com.pos.supermarket.configuracion;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/configuracion")
@RequiredArgsConstructor
public class ConfiguracionController {

    private final ConfiguracionService configuracionService;

    @GetMapping
    public ResponseEntity<Configuracion> obtener() {
        return ResponseEntity.ok(configuracionService.obtener());
    }

    @PutMapping
    public ResponseEntity<Configuracion> actualizar(@RequestBody Configuracion request) {
        return ResponseEntity.ok(configuracionService.actualizar(request));
    }
}
