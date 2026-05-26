package com.pos.supermarket.usuarios.dto;

import com.pos.supermarket.shared.Rol;
import com.pos.supermarket.usuarios.Usuario;
import lombok.Data;

@Data
public class UsuarioResponse {
    private Long id;
    private String nombre;
    private String apellido;
    private String username;
    private Rol rol;
    private boolean activo;

    public static UsuarioResponse from(Usuario u) {
        UsuarioResponse r = new UsuarioResponse();
        r.setId(u.getId());
        r.setNombre(u.getNombre());
        r.setApellido(u.getApellido());
        r.setUsername(u.getUsername());
        r.setRol(u.getRol());
        r.setActivo(u.isActivo());
        return r;
    }
}
