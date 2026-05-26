package com.pos.supermarket.usuarios.dto;

import com.pos.supermarket.shared.Rol;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UsuarioRequest {
    @NotBlank private String nombre;
    @NotBlank private String apellido;
    @NotBlank private String username;
    private String password;   // opcional en update
    @NotNull  private Rol rol;
    private boolean activo = true;
}
