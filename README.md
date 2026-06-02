# POS Supermercado

Sistema de Punto de Venta para supermercado con dos proyectos independientes.

| Proyecto | Tecnología | Puerto |
|---|---|---|
| `pos-frontend/` | React 18 + TypeScript + Vite + Tailwind v4 | `http://localhost:5173` |
| `serverless-inventory-api/` | Node.js 20 + AWS Lambda (local) + DynamoDB | `http://localhost:3000` |

---

## Requisitos previos

- Node.js >= 20
- [DynamoDB Local](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html) corriendo en el puerto `8000`
- AWS CLI (solo para crear tablas locales)

### Instalar DynamoDB Local (una sola vez)

```bash
# Opción 1 — Docker (recomendado)
docker run -d -p 8000:8000 amazon/dynamodb-local

# Opción 2 — JAR directo
# Descargar desde https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.DownloadingAndRunning.html
java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb -port 8000
```

---

## Backend — `serverless-inventory-api/`

```bash
cd serverless-inventory-api
npm install
```

### Primera vez — crear tablas y cargar datos de prueba

```bash
npm run setup:local
```

Esto ejecuta dos pasos:
1. `create-tables-local.sh` — crea las 4 tablas en DynamoDB Local
2. `seed:local` — carga usuarios, productos y configuración de prueba

### Iniciar el servidor local

```bash
npm run dev
```

El servidor corre en `http://localhost:3000` y emula API Gateway + Lambda.

### Usuarios de prueba (cargados por el seed)

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `admin123` | ADMIN |
| `supervisor` | `supervisor123` | SUPERVISOR |
| `cajero` | `cajero123` | CAJERO |

### Scripts disponibles

```bash
npm run dev          # Servidor local en :3000
npm run setup:local  # Crear tablas + cargar seed (primera vez)
npm run seed:local   # Solo recargar datos de prueba
npm run test         # Todos los tests
npm run test:auth    # Tests de autenticación y autorización
npm run test:ventas  # Tests de ventas e IVA
```

### Endpoints

| Método | Ruta | Rol mínimo |
|---|---|---|
| `GET` | `/health` | Público |
| `POST` | `/auth/login` | Público |
| `GET` | `/productos?q=texto` | CAJERO |
| `GET` | `/productos?page=0&size=50` | CAJERO |
| `POST` | `/productos` | ADMIN |
| `PUT` | `/productos/:id` | ADMIN |
| `DELETE` | `/productos/:id` | ADMIN |
| `POST` | `/ventas` | CAJERO |
| `GET` | `/ventas/:id` | CAJERO |
| `GET` | `/usuarios` | ADMIN |
| `POST` | `/usuarios` | ADMIN |
| `PUT` | `/usuarios/:username` | ADMIN |
| `DELETE` | `/usuarios/:username` | ADMIN |
| `GET` | `/reportes/ventas?desde=YYYY-MM-DD&hasta=YYYY-MM-DD` | SUPERVISOR |
| `GET` | `/configuracion` | CAJERO |
| `PUT` | `/configuracion` | ADMIN |

---

## Frontend — `pos-frontend/`

```bash
cd pos-frontend
npm install
```

### Configurar la URL del backend

El archivo `.env` ya existe con:

```
VITE_API_URL=http://localhost:3000
```

Cámbialo si el backend corre en otro puerto o en AWS.

### Iniciar el servidor de desarrollo

```bash
npm run dev
```

La app corre en `http://localhost:5173`.

### Scripts disponibles

```bash
npm run dev      # Servidor de desarrollo en :5173
npm run build    # Build de producción
npm run test     # Todos los tests unitarios
npm run lint     # Linter ESLint
```

### Atajos de teclado del POS

| Tecla | Acción |
|---|---|
| `F1` | Foco al buscador de productos |
| `F2` | Eliminar último ítem del carrito |
| `F3` | Limpiar carrito (pide confirmación) |
| `F4` | Abrir modal IVA / Descuento |
| `F5` | Abrir modal Método de Pago |
| `F6` | Procesar venta (cobrar) |
| `F7` | Imprimir ticket |
| `F8` | Nueva venta |
| `F9` | Cerrar sesión |
| `M` | Menú de desbordamiento |
| `↑ ↓` | Navegar ítems del carrito |
| `Del` | Eliminar ítem seleccionado |
| `Esc` | Cerrar modal activo |

---

## Flujo completo de prueba

1. Iniciar DynamoDB Local
2. `cd serverless-inventory-api && npm run setup:local` (primera vez)
3. `npm run dev` (backend en :3000)
4. `cd pos-frontend && npm run dev` (frontend en :5173)
5. Abrir `http://localhost:5173`
6. Login con `cajero` / `cajero123`
7. Buscar producto con F1 → escanear código de barras o escribir nombre
8. Agregar al carrito → F5 (método de pago) → F6 (cobrar) → F7 (imprimir)

---

## Tests

### Frontend (37 tests)

```bash
cd pos-frontend
npm test
```

Cubre: P-01 P-02 P-03 P-04 (IVA), P-05 (carrito), P-11 RNF-13 (atajos).

### Backend (31 tests)

```bash
cd serverless-inventory-api
npm test
```

Cubre: P-06 (autorización), P-07 (password), P-08 (numero_venta), P-10 (JWT), P-12 (ticket).

---

## Despliegue en AWS

### Prerrequisitos

- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) instalado
- Credenciales AWS configuradas (`aws configure`)
- Una cuenta AWS con permisos para Lambda, API Gateway, DynamoDB, IAM, S3 y CloudFormation

### Paso 1 — Editar `samconfig.toml`

```toml
# serverless-inventory-api/samconfig.toml
parameter_overrides = [
  "Stage=prod",
  "JwtSecret=TU_SECRETO_SEGURO_MIN_32_CARACTERES",
  "AllowedOrigin=https://TU_DOMINIO_FRONTEND.com"
]
region = "us-east-1"   # tu región
```

### Paso 2 — Build y deploy del backend

```bash
cd serverless-inventory-api

# Primera vez (te pide S3 bucket, región, etc.)
npm run deploy:guided

# Despliegues posteriores
npm run build
npm run deploy
```

SAM crea automáticamente:
- 6 funciones Lambda (health, login, productos, usuarios, ventas, reportes, configuracion)
- 1 API Gateway HTTP API con CORS configurado
- 4 tablas DynamoDB con sus GSIs
- Roles IAM con permisos mínimos por función

Al finalizar verás en los Outputs:
```
ApiUrl = https://XXXXXXXXXX.execute-api.us-east-1.amazonaws.com
```

### Paso 3 — Cargar datos iniciales en AWS

```bash
AWS_REGION=us-east-1 STAGE=prod npm run seed:aws
```

Usuarios creados (cambia las contraseñas después del primer login):

| Usuario | Contraseña inicial | Rol |
|---|---|---|
| `admin` | `Admin2024!` | ADMIN |
| `supervisor` | `Super2024!` | SUPERVISOR |
| `cajero` | `Cajero2024!` | CAJERO |

### Paso 4 — Build y deploy del frontend

```bash
cd pos-frontend

# Crear .env.production con la URL real del API Gateway
echo "VITE_API_URL=https://XXXXXXXXXX.execute-api.us-east-1.amazonaws.com" > .env.production

# Build
npm run build
# Los archivos quedan en dist/
```

**Opción A — S3 + CloudFront (recomendado)**

```bash
# Crear bucket y subir archivos
aws s3 mb s3://pos-frontend-prod
aws s3 sync dist/ s3://pos-frontend-prod --delete
aws s3 website s3://pos-frontend-prod --index-document index.html --error-document index.html
```

**Opción B — Amplify Hosting**

```bash
# En la consola de AWS Amplify → "Host web app" → conectar repositorio
# o con CLI:
amplify init
amplify add hosting
amplify publish
```

### Flujo de URLs en producción

```
Usuario → CloudFront/Amplify (frontend) → API Gateway → Lambda → DynamoDB
         https://tu-app.com              https://xxx.execute-api.region.amazonaws.com
```

Actualizar CORS en `samconfig.toml`:
```
"AllowedOrigin=https://tu-app.com"
```

y re-deployar:
```bash
npm run deploy
```
