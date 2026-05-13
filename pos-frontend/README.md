# POS Frontend

Interfaz web del sistema de inventario y punto de venta. Consume la **Serverless Inventory API**.

> Para la documentación completa del proyecto, ver el [README principal](../README.md).

## Inicio rápido

```bash
npm install
cp .env.example .env   # configura VITE_API_URL con la URL del backend
npm run dev            # abre http://localhost:5173
```

## Scripts disponibles

```bash
npm run dev      # servidor de desarrollo con hot reload
npm run build    # construir para producción (salida en dist/)
npm run preview  # previsualizar el build de producción
npm run lint     # revisar errores de código
```

## Configuración

Crea un archivo `.env` en esta carpeta:

```
VITE_API_URL=http://localhost:3000
```

Cambia la URL por la de tu backend desplegado en AWS cuando vayas a producción.

## Stack

React 18 · TypeScript · Vite · Tailwind CSS v4 · React Query · Axios · React Hook Form · Zod
