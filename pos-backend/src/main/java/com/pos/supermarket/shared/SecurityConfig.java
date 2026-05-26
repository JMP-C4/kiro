package com.pos.supermarket.shared;

import com.pos.supermarket.auth.JwtAuthFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Configuración base de Spring Security.
 * - Rutas públicas: /auth/login, /health
 * - Resto de rutas requieren autenticación y rol apropiado (RNF-07)
 * - CORS configurado para el origen del frontend (RNF-08)
 * - Sesión stateless (JWT)
 * - JwtAuthFilter se ejecuta antes de UsernamePasswordAuthenticationFilter
 *
 * Cumple: Req-1, RNF-05, RNF-07
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigin;

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Deshabilitar CSRF (API REST stateless)
            .csrf(AbstractHttpConfigurer::disable)

            // Configurar CORS (RNF-08)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // Sesión stateless — JWT
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Reglas de autorización por rol (RNF-07)
            .authorizeHttpRequests(auth -> auth
                // Rutas públicas
                .requestMatchers("/auth/login", "/health").permitAll()

                // Productos — lectura para todos los roles, escritura solo ADMIN
                .requestMatchers(HttpMethod.GET, "/productos/**").hasAnyRole("CAJERO", "SUPERVISOR", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/productos/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/productos/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/productos/**").hasRole("ADMIN")

                // Ventas — todos los roles autenticados
                .requestMatchers("/ventas/**").hasAnyRole("CAJERO", "SUPERVISOR", "ADMIN")

                // Usuarios — solo ADMIN
                .requestMatchers("/usuarios/**").hasRole("ADMIN")

                // Reportes — SUPERVISOR y ADMIN
                .requestMatchers("/reportes/**").hasAnyRole("SUPERVISOR", "ADMIN")

                // Configuración — lectura para todos, escritura solo ADMIN
                .requestMatchers(HttpMethod.GET, "/configuracion").hasAnyRole("CAJERO", "SUPERVISOR", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/configuracion").hasRole("ADMIN")

                // Cualquier otra ruta requiere autenticación
                .anyRequest().authenticated()
            )

            // Añadir filtro JWT antes del filtro de autenticación estándar
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Configuración CORS — acepta peticiones únicamente desde el origen del frontend.
     * Cumple RNF-08.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(allowedOrigin));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    /**
     * BCrypt con factor de costo 10 (RNF-06).
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }
}
