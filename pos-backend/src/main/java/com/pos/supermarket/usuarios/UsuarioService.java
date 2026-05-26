package com.pos.supermarket.usuarios;

import com.pos.supermarket.usuarios.dto.UsuarioRequest;
import com.pos.supermarket.usuarios.dto.UsuarioResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UsuarioResponse> listar() {
        return usuarioRepository.findAll().stream()
                .map(UsuarioResponse::from)
                .toList();
    }

    @Transactional
    public UsuarioResponse crear(UsuarioRequest req) {
        if (req.getPassword() == null || req.getPassword().isBlank()) {
            throw new IllegalArgumentException("La contraseña es obligatoria al crear un usuario");
        }
        Usuario u = new Usuario();
        u.setNombre(req.getNombre());
        u.setApellido(req.getApellido());
        u.setUsername(req.getUsername());
        u.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        u.setRol(req.getRol());
        u.setActivo(req.isActivo());
        return UsuarioResponse.from(usuarioRepository.save(u));
    }

    @Transactional
    public UsuarioResponse actualizar(Long id, UsuarioRequest req) {
        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado: " + id));
        u.setNombre(req.getNombre());
        u.setApellido(req.getApellido());
        u.setUsername(req.getUsername());
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            u.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        }
        u.setRol(req.getRol());
        u.setActivo(req.isActivo());
        return UsuarioResponse.from(usuarioRepository.save(u));
    }

    @Transactional
    public void desactivar(Long id) {
        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado: " + id));
        u.setActivo(false);
        usuarioRepository.save(u);
    }
}
