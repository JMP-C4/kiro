-- Flyway V2__seed.sql
-- Datos iniciales: usuario admin y configuración por defecto
-- Requisitos: Req-9, Req-11

-- Usuario administrador inicial
-- password: admin123  →  bcrypt hash (cost 10)
INSERT INTO usuarios (nombre, apellido, username, password_hash, rol, activo)
VALUES (
    'Administrador',
    'Sistema',
    'admin',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'ADMIN',
    TRUE
);

-- Configuración por defecto del negocio
INSERT INTO configuracion (nombre_negocio, tasa_iva, formato_papel)
VALUES (
    'Mi Supermercado',
    0.19,
    '80mm'
);
