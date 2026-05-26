# POS Supermercado — Backend

API REST construida con Spring Boot 3, Java 17, PostgreSQL y Spring Security + JWT.

## Requisitos previos

- Java 17+
- Maven 3.8+
- PostgreSQL 14+

## Configuración de la base de datos

Crear la base de datos antes de iniciar el backend:

```bash
psql -U postgres -c "CREATE DATABASE pos_supermarket;"
```

O desde la consola interactiva de psql:

```sql
CREATE DATABASE pos_supermarket;
```

## Variables de configuración

El archivo `src/main/resources/application.yml` contiene la configuración principal.
Ajusta las credenciales de PostgreSQL según tu entorno:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/pos_supermarket
    username: postgres   # cambia según tu usuario
    password: postgres   # cambia según tu contraseña
```

## Iniciar el backend

```bash
./mvnw spring-boot:run
```

El servidor arranca en `http://localhost:8080`.

## Migraciones Flyway

Las migraciones se aplican automáticamente al iniciar la aplicación.
Los scripts se encuentran en `src/main/resources/db/migration/`.

- `V1__init.sql` — Esquema inicial (tablas: usuarios, productos, ventas, venta_items, configuracion)
- `V2__seed.sql` — Datos iniciales (usuario admin, configuración por defecto)

## Endpoints disponibles

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| GET | `/health` | Estado del servicio | Público |
| POST | `/auth/login` | Autenticación JWT | Público |
| GET | `/productos` | Listar productos | CAJERO+ |
| POST | `/productos` | Crear producto | ADMIN |
| PUT | `/productos/{id}` | Actualizar producto | ADMIN |
| DELETE | `/productos/{id}` | Desactivar producto | ADMIN |
| POST | `/ventas` | Registrar venta | CAJERO+ |
| GET | `/ventas/{id}` | Obtener venta | CAJERO+ |
| GET | `/usuarios` | Listar usuarios | ADMIN |
| POST | `/usuarios` | Crear usuario | ADMIN |
| PUT | `/usuarios/{id}` | Actualizar usuario | ADMIN |
| DELETE | `/usuarios/{id}` | Desactivar usuario | ADMIN |
| GET | `/reportes/ventas` | Reporte por período | SUPERVISOR+ |
| GET | `/configuracion` | Obtener configuración | CAJERO+ |
| PUT | `/configuracion` | Actualizar configuración | ADMIN |

## Estructura del proyecto

```
src/main/java/com/pos/supermarket/
├── PosApplication.java         # Clase principal
├── auth/                       # Autenticación JWT
├── productos/                  # CRUD de productos
├── ventas/                     # Registro de ventas
├── usuarios/                   # Gestión de usuarios
├── reportes/                   # Reportes de ventas
├── configuracion/              # Configuración del sistema
└── shared/
    ├── SecurityConfig.java     # Spring Security + CORS
    ├── GlobalExceptionHandler.java
    ├── ApiResponse.java        # Wrapper de respuestas
    ├── HealthController.java   # GET /health
    └── Rol.java                # Enum CAJERO, SUPERVISOR, ADMIN
```

## Ejecutar tests

```bash
./mvnw test
```

## Seguridad

- JWT firmado con secreto de 512 bits, expiración de 8 horas (RNF-05)
- Contraseñas almacenadas con BCrypt factor 10 (RNF-06)
- CORS configurado solo para `http://localhost:5173` (RNF-08)
- Migraciones versionadas con Flyway (RNF-19)
