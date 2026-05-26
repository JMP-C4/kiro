package com.pos.supermarket.auth;

import com.pos.supermarket.auth.dto.LoginRequest;
import com.pos.supermarket.auth.dto.LoginResponse;
import com.pos.supermarket.usuarios.Usuario;
import com.pos.supermarket.usuarios.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public LoginResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new AuthException("Credenciales inválidas"));

        if (!usuario.isActivo()) {
            throw new InactiveUserException("Usuario inactivo");
        }

        if (!passwordEncoder.matches(request.getPassword(), usuario.getPasswordHash())) {
            throw new AuthException("Credenciales inválidas");
        }

        String nombreCompleto = usuario.getNombre() + " " + usuario.getApellido();
        String token = jwtService.generateToken(
                usuario.getUsername(),
                usuario.getRol().name(),
                nombreCompleto
        );

        log.info("Login exitoso: {}", usuario.getUsername());
        return new LoginResponse(token, usuario.getRol().name(), nombreCompleto);
    }

    // Custom exceptions
    public static class AuthException extends RuntimeException {
        public AuthException(String msg) { super(msg); }
    }

    public static class InactiveUserException extends RuntimeException {
        public InactiveUserException(String msg) { super(msg); }
    }
}
