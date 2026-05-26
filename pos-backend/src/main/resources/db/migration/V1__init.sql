-- Flyway V1__init.sql
-- Esquema inicial del sistema POS Supermercado
-- Requisitos: Req-9, Req-11

CREATE TABLE usuarios (
    id            BIGSERIAL    PRIMARY KEY,
    nombre        VARCHAR(100) NOT NULL,
    apellido      VARCHAR(100) NOT NULL,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol           VARCHAR(20)  NOT NULL CHECK (rol IN ('CAJERO','SUPERVISOR','ADMIN')),
    activo        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE productos (
    id            BIGSERIAL    PRIMARY KEY,
    codigo        VARCHAR(50)  NOT NULL UNIQUE,
    nombre        VARCHAR(200) NOT NULL,
    descripcion   TEXT,
    categoria     VARCHAR(100),
    precio        NUMERIC(12,2) NOT NULL,
    incluye_iva   BOOLEAN      NOT NULL DEFAULT FALSE,
    unidad_medida VARCHAR(20)  NOT NULL DEFAULT 'und',
    activo        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE ventas (
    id               BIGSERIAL    PRIMARY KEY,
    numero_venta     VARCHAR(20)  NOT NULL UNIQUE,
    cajero_id        BIGINT       NOT NULL REFERENCES usuarios(id),
    subtotal_sin_iva NUMERIC(12,2) NOT NULL,
    descuento_pct    NUMERIC(5,2) NOT NULL DEFAULT 0,
    descuento_monto  NUMERIC(12,2) NOT NULL DEFAULT 0,
    iva_monto        NUMERIC(12,2) NOT NULL,
    total_con_iva    NUMERIC(12,2) NOT NULL,
    metodo_pago      VARCHAR(20)  NOT NULL CHECK (metodo_pago IN ('EFECTIVO','TARJETA','TRANSFERENCIA')),
    monto_recibido   NUMERIC(12,2),
    cambio           NUMERIC(12,2),
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE venta_items (
    id              BIGSERIAL    PRIMARY KEY,
    venta_id        BIGINT       NOT NULL REFERENCES ventas(id),
    producto_id     BIGINT       REFERENCES productos(id),
    nombre_producto VARCHAR(200) NOT NULL,
    cantidad        NUMERIC(10,3) NOT NULL,
    precio_unitario NUMERIC(12,2) NOT NULL,
    incluye_iva     BOOLEAN      NOT NULL,
    subtotal        NUMERIC(12,2) NOT NULL
);

CREATE TABLE configuracion (
    id             BIGSERIAL    PRIMARY KEY,
    nombre_negocio VARCHAR(200) NOT NULL DEFAULT 'Mi Supermercado',
    tasa_iva       NUMERIC(5,4) NOT NULL DEFAULT 0.19,
    formato_papel  VARCHAR(20)  NOT NULL DEFAULT '80mm'
                   CHECK (formato_papel IN ('80mm','58mm','carta')),
    logo_url       TEXT,
    updated_at     TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Índices para búsqueda rápida de productos
CREATE INDEX idx_productos_codigo ON productos(codigo);
CREATE INDEX idx_productos_nombre  ON productos(nombre);
CREATE INDEX idx_ventas_cajero     ON ventas(cajero_id);
CREATE INDEX idx_ventas_fecha      ON ventas(created_at);
