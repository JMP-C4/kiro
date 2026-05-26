package com.pos.supermarket.ventas;

import com.pos.supermarket.ventas.dto.VentaRequest;
import com.pos.supermarket.ventas.dto.VentaResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ventas")
@RequiredArgsConstructor
public class VentaController {

    private final VentaService ventaService;

    @PostMapping
    public ResponseEntity<VentaResponse> crear(
            @Valid @RequestBody VentaRequest req,
            Authentication auth) {
        // En modo acceso libre auth puede ser null; pasamos "anonymous" como fallback
        String username = (auth != null) ? auth.getName() : "anonymous";
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ventaService.crear(req, username));
    }
}
