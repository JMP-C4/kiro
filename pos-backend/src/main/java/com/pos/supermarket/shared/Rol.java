package com.pos.supermarket.shared;

import org.springframework.security.core.GrantedAuthority;

/**
 * Roles del sistema POS.
 * CAJERO: acceso exclusivo al módulo POS.
 * SUPERVISOR: acceso al POS y a reportes y consulta de productos.
 * ADMIN: acceso completo a todos los módulos.
 *
 * Implementa GrantedAuthority para integración con Spring Security.
 * Spring Security espera el prefijo ROLE_ en los roles, por lo que
 * getAuthority() retorna "ROLE_CAJERO", "ROLE_SUPERVISOR" o "ROLE_ADMIN".
 */
public enum Rol implements GrantedAuthority {
    CAJERO,
    SUPERVISOR,
    ADMIN;

    @Override
    public String getAuthority() {
        return "ROLE_" + this.name();
    }
}
