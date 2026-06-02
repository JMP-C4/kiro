# POS Supermercado — Backend Serverless

API REST serverless para el sistema POS de supermercado.

**Stack:** Node.js 20 · AWS Lambda · API Gateway (HTTP API) · DynamoDB · JWT

---

## Requisitos

- Node.js 20+
- AWS SAM CLI (`sam --version`)
- AWS CLI configurado (`aws configure`)
- Para desarrollo local: [DynamoDB Local](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html)

---

## Inicio rápido — Desarrollo local

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.local.example .env.local
# Editar .env.local si es necesario
```

### 3. Iniciar DynamoDB Local (en otra terminal)

```bash
# Con Docker
docker run -p 8000:8000 amazon/dynamodb-local

# O con Java
java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb
```

### 4. Crear tablas y cargar datos de prueba

```bash
npm run setup:local
```

Esto ejecuta:
- `create-tables-local.sh` — crea las 4 tablas en DynamoDB Local
- `seed.mjs` — carga usuarios, productos y configuración inicial

**Usuarios de prueba:**

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| `admin` | `admin123` | ADMIN |
| `supervisor` | `supervisor123` | SUPERVISOR |
| `cajero` | `cajero123` | CAJERO |

### 5. Iniciar el servidor local

```bash
npm run dev
# API disponible en http://localhost:3000
```

---

## Endpoints

| Método | Ruta | Descripción | Rol mínimo |
|--------|------|-------------|-----------|
| `GET` | `/health` | Estado del servicio | Público |
| `POST` | `/auth/login` | Login, emite JWT | Público |
| `GET` | `/productos?q=texto` | Búsqueda POS (código de barras o nombre) | CAJERO |
| `GET` | `/productos?page=0&size=50` | Listado paginado admin | CAJERO |
| `POST` | `/productos` | Crear producto | ADMIN |
| `PUT` | `/productos/:id` | Actualizar producto | ADMIN |
| `DELETE` | `/productos/:id` | Desactivar producto | ADMIN |
| `GET` | `/usuarios` | Listar usuarios | ADMIN |
| `POST` | `/usuarios` | Crear usuario | ADMIN |
| `PUT` | `/usuarios/:username` | Actualizar usuario | ADMIN |
| `DELETE` | `/usuarios/:username` | Desactivar usuario | ADMIN |
| `POST` | `/ventas` | Registrar venta | CAJERO |
| `GET` | `/ventas/:id` | Obtener venta | CAJERO |
| `GET` | `/reportes/ventas?desde=&hasta=` | Reporte de ventas | SUPERVISOR |
| `GET` | `/configuracion` | Obtener configuración | CAJERO |
| `PUT` | `/configuracion` | Actualizar configuración | ADMIN |

### Búsqueda de código de barras

`GET /productos?q=7701234567890`

El backend detecta automáticamente si el query es un código de barras (solo dígitos ≥6 o alfanumérico ≥6 sin espacios) y usa el GSI `codigo-index` de DynamoDB para una búsqueda O(1) en lugar de un Scan completo.

---

## Tests

```bash
# Todos los tests
npm test

# Solo autenticación y autorización
npm run test:auth

# Solo ventas
npm run test:ventas
```

**Cobertura:** 31 tests — autenticación, autorización por rol (P-06, P-07, P-10), cálculo de IVA, número de venta único (P-08), campos del ticket (P-12).

---

## Despliegue en AWS

### Build y deploy

```bash
sam build
sam deploy --guided
```

El wizard de `--guided` pedirá:
- Stack name (ej: `pos-supermarket-dev`)
- AWS Region (ej: `us-east-1`)
- `JwtSecret` — secreto JWT de al menos 32 caracteres
- `AllowedOrigin` — URL del frontend (ej: `https://tu-frontend.com`)

### Variables de entorno Lambda

Configuradas automáticamente por SAM desde `template.yaml`:

| Variable | Descripción |
|----------|-------------|
| `JWT_SECRET` | Secreto para firmar JWT (mínimo 32 chars) |
| `ALLOWED_ORIGIN` | Origen CORS del frontend |
| `USUARIOS_TABLE` | Nombre de la tabla DynamoDB de usuarios |
| `PRODUCTOS_TABLE` | Nombre de la tabla DynamoDB de productos |
| `VENTAS_TABLE` | Nombre de la tabla DynamoDB de ventas |
| `CONFIGURACION_TABLE` | Nombre de la tabla DynamoDB de configuración |

---

## Estructura del proyecto

```
serverless-inventory-api/
├── src/
│   ├── handlers/          # Funciones Lambda por módulo
│   │   ├── health.mjs
│   │   ├── login.mjs
│   │   ├── productos.mjs  # Búsqueda con GSI para código de barras
│   │   ├── usuarios.mjs
│   │   ├── ventas.mjs     # Cálculo IVA + numero_venta único
│   │   ├── reportes.mjs
│   │   └── configuracion.mjs
│   ├── lib/               # Utilidades compartidas
│   │   ├── auth.mjs       # JWT + control de roles
│   │   ├── dynamo.mjs     # Cliente DynamoDB
│   │   ├── http.mjs       # Helpers de respuesta HTTP
│   │   └── jwt.mjs        # Emisión y verificación de tokens
│   ├── tests/             # Tests unitarios (node:test)
│   │   ├── auth.test.mjs
│   │   └── ventas.test.mjs
│   └── local-server.mjs   # Servidor HTTP local (emula API Gateway)
├── scripts/
│   └── seed.mjs           # Carga datos iniciales en DynamoDB
├── template.yaml          # AWS SAM — infraestructura como código
└── package.json
```

---

## Modelo de datos DynamoDB

Las tablas usan documentos JSON sin esquema fijo (no relacional). Las ventas incluyen los ítems **embebidos** en el mismo documento — no hay tabla separada de `venta_items`.

Ver esquema completo en `../db/dynamodb/tables.json`.
