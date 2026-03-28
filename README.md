# Creador de Precios

Aplicación para administrar productos, ordenar su clasificación comercial y generar carteles de impresión.

Hoy el proyecto está orientado a un flujo simple y útil para negocio:

- Ver productos cargados en MongoDB.
- Buscar por nombre o código.
- Filtrar por categoría y subcategoría.
- Clasificar productos de forma masiva.
- Crear categorías y subcategorías manualmente.
- Eliminar categorías o subcategorías y limpiar la clasificación asociada.
- Registrar historial de acciones.
- Imprimir carteles en formato `A4 completa` o `Media hoja`.

## Qué estoy haciendo con este proyecto

Estoy construyendo una herramienta interna para ordenar productos y acelerar la preparación de carteles de precios.

La idea principal es centralizar en una sola interfaz:

- La consulta del catálogo.
- La clasificación manual de productos que todavía no están bien organizados.
- El mantenimiento de categorías y subcategorías.
- La trazabilidad básica de cambios mediante historial.
- La preparación de carteles listos para imprimir.

## Stack actual

- Frontend: React + Vite
- Backend: Express
- Base de datos: MongoDB + Mongoose
- UI/feedback: SweetAlert2 + React Toastify
- Utilidades: `xlsx` para tareas relacionadas con Excel

## Estructura del proyecto

```text
precios/
├── src/                  # Frontend React
├── public/               # Assets públicos
├── server/               # API Express + modelos MongoDB
│   ├── models/
│   ├── routes/
│   └── .env.example
├── package.json          # Frontend
└── README.md
```

## Funcionalidades actuales

### Frontend

- Lista de productos con resumen de cantidad.
- Filtros por búsqueda, categoría y subcategoría.
- Selección múltiple de productos.
- Edición masiva de clasificación.
- Alta manual de categorías y subcategorías.
- Eliminación de categorías y subcategorías.
- Vista de historial de acciones.
- Impresión de carteles agrupados por categoría/subcategoría.

### Backend

- `GET /api/health`
- `GET /api/productos`
- `GET /api/productos/filtros`
- `GET /api/productos/historial`
- `POST /api/productos/categorias`
- `POST /api/productos/historial`
- `PATCH /api/productos/clasificacion-multiple`
- `PATCH /api/productos/:id/clasificacion`
- `DELETE /api/productos/historial`
- `DELETE /api/productos/categorias/:nombre`
- `DELETE /api/productos/subcategorias`

## Variables de entorno

El backend usa un archivo `.env` dentro de `server/`.

Ejemplo:

```env
MONGODB_URI=mongodb://localhost:27017/precios
```

Tomá como base el archivo [server/.env.example](C:\Users\matur\OneDrive\Escritorio Lenovo Javi\Sur_Maderas\creadorPrecios\precios\server\.env.example).

## Cómo levantar el proyecto

### 1. Instalar dependencias del frontend

```bash
npm install
```

### 2. Instalar dependencias del backend

```bash
cd server
npm install
```

### 3. Configurar variables de entorno

Crear `server/.env` usando `server/.env.example` como guía.

### 4. Levantar backend

Desde la carpeta `server`:

```bash
npm run dev
```

El backend corre en `http://localhost:4000`.

### 5. Levantar frontend

Desde la raíz del proyecto:

```bash
npm run dev
```

El frontend corre en `http://localhost:5173`.

## Estado actual

El proyecto ya cubre el flujo principal de clasificación e impresión, pero todavía está en etapa de ordenamiento técnico. Hay partes ya funcionales y otras que necesitan limpieza y refactor para poder crecer con menos fricción.

## To do list

- [x] Proteger secretos con `.gitignore` y archivo `.env.example`
- [x] Corregir el `README` para documentar el proyecto real
- [ ] Separar la configuración de ESLint entre frontend y backend
- [ ] Pasar URLs y puertos a variables de entorno
- [ ] Corregir problemas de encoding en textos con acentos
- [x] Dividir `src/components/Productos.jsx` en componentes mas pequenos
- [x] Eliminar archivos viejos que no coinciden con el flujo actual
- [ ] Agregar validaciones más claras en backend para altas, bajas y cambios masivos
- [ ] Agregar tests básicos para rutas críticas
- [ ] Documentar mejor la estructura de datos de `Producto`, `Categoria`, `Subcategoria` e `HistorialAccion`
- [ ] Mejorar la experiencia de impresión y vista previa de carteles

## Notas

- El frontend actualmente consume la API apuntando a `localhost`.
- El backend espera `MONGODB_URI` o `MONGO_URI`.
- El proyecto todavía no tiene una estrategia de tests consolidada.

