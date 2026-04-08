# Creador de Precios

Herramienta interna para Sur Maderas pensada para ordenar productos, mantener categorias y preparar carteles listos para imprimir.

## Estado actual

- URL actual: [https://precios-seven.vercel.app](https://precios-seven.vercel.app)
- Rama de trabajo: `codex/pruebas-cambios`
- Deploy: Vercel
- Acceso con Google: temporalmente desactivado
- Variables activas en Vercel:
  - `VITE_DISABLE_GOOGLE_AUTH=true`
  - `DISABLE_GOOGLE_AUTH=true`
- Flujo actual de acceso:
  - la app entra directo sin login
  - quedo preparada para reactivar Google mas adelante sin romper el flujo

## Stack

- Frontend: React + Vite
- Backend: Express + MongoDB/Mongoose
- UI: `react-toastify`, `sweetalert2`
- Deploy: Vercel

## Estructura

```text
precios/
|-- src/                  # Frontend React
|-- public/               # Assets publicos
|-- server/               # API Express + modelos MongoDB
|   |-- auth/
|   |-- models/
|   |-- routes/
|   `-- .env.example
|-- package.json
`-- README.md
```

## Funcionalidades implementadas

### Catalogo y filtros

- Gestion de productos cargados en MongoDB.
- Busqueda por nombre o codigo.
- Filtros por categoria y subcategoria.
- Persistencia de seleccion entre filtros, categorias y busqueda.
- Paginacion en la vista de productos.
- Seleccionar todos los productos de la pagina.
- Seleccionar todos los productos filtrados.
- Panel para revisar la seleccion completa antes de imprimir o reclasificar.
- Exportacion CSV de productos filtrados.
- Hover preview de imagenes en cards.
- UI renovada con estilo mas moderno para shell, header, filtros, cards y paneles.

### Clasificacion

- Edicion manual por producto.
- Edicion multiple de clasificacion.
- Creacion de categorias y subcategorias.
- Edicion de categorias.
- Eliminacion de categorias.
- Edicion, renombre y movimiento de subcategorias.
- Colores por categoria persistidos en MongoDB.
- Selector visual de colores para categorias.
- Paleta ampliada a 20 colores.

### Historial

- Registro de acciones de productos.
- Vista de historial dentro de la app.
- Limpieza manual del historial.
- Los registros nuevos muestran quien hizo cada cambio.

### Impresion

- Preview de impresion.
- Controles de formato para carteles.
- Impresion agrupada por seleccion.
- Modo individual por producto.
- Carteles individuales acomodados por hoja.
- Hoja A4 vertical para etiquetas individuales.
- Ajuste manual del tamano del titulo por etiqueta.
- Tamano inicial del titulo en individual: `7 mm`.
- Autoajuste del titulo cuando un nombre largo rompe el layout.
- Diseno de etiqueta individual tipo mostrador.
- Leyenda automatica `Consulta por 6 cuotas sin interes` para productos cuyo precio final supere `$200.000`.

### Integraciones y auth

- Login con Google preparado en backend y frontend.
- Desactivacion temporal del acceso Google por variable de entorno.
- Sesion temporal local visible en la barra superior.

### Sync y mantenimiento

- Sync seguro de productos desde CSV.
- Sync de imagenes desde CSV.

## Endpoints principales

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

Base sugerida: [server/.env.example](C:\Users\matur\OneDrive\Escritorio Lenovo Javi\Sur_Maderas\creadorPrecios\precios\server\.env.example)

Ejemplo minimo:

```env
MONGODB_URI=mongodb://localhost:27017/precios
```

Variables relevantes para auth:

```env
VITE_DISABLE_GOOGLE_AUTH=true
DISABLE_GOOGLE_AUTH=true
```

## Desarrollo local

### 1. Instalar dependencias del frontend

```bash
npm install
```

### 2. Instalar dependencias del backend

```bash
cd server
npm install
```

### 3. Configurar entorno

Crear `server/.env` usando `server/.env.example` como guia.

### 4. Levantar backend

Desde `server/`:

```bash
node index.js
```

El backend corre en `http://localhost:4000`.

### 5. Levantar frontend

Desde la raiz:

```bash
npm run dev
```

El frontend corre en `http://localhost:5173`.

## Comandos utiles

### Frontend

```bash
npm run dev
npm run build
```

### Backend

```bash
cd server
node index.js
npm run sync:productos
npm run sync:imagenes
```

## Archivos clave

- [src/components/Productos.jsx](C:\Users\matur\OneDrive\Escritorio Lenovo Javi\Sur_Maderas\creadorPrecios\precios\src\components\Productos.jsx)
- [src/components/productos/ProductosHeader.jsx](C:\Users\matur\OneDrive\Escritorio Lenovo Javi\Sur_Maderas\creadorPrecios\precios\src\components\productos\ProductosHeader.jsx)
- [src/components/productos/EditorCategoriasPanel.jsx](C:\Users\matur\OneDrive\Escritorio Lenovo Javi\Sur_Maderas\creadorPrecios\precios\src\components\productos\EditorCategoriasPanel.jsx)
- [src/components/productos/HistorialPanel.jsx](C:\Users\matur\OneDrive\Escritorio Lenovo Javi\Sur_Maderas\creadorPrecios\precios\src\components\productos\HistorialPanel.jsx)
- [src/utils/productoCardTheme.js](C:\Users\matur\OneDrive\Escritorio Lenovo Javi\Sur_Maderas\creadorPrecios\precios\src\utils\productoCardTheme.js)
- [src/utils/imprimirCartelesEditable.js](C:\Users\matur\OneDrive\Escritorio Lenovo Javi\Sur_Maderas\creadorPrecios\precios\src\utils\imprimirCartelesEditable.js)
- [src/utils/imprimirCartelesIndividuales.js](C:\Users\matur\OneDrive\Escritorio Lenovo Javi\Sur_Maderas\creadorPrecios\precios\src\utils\imprimirCartelesIndividuales.js)
- [src/styles/productos.css](C:\Users\matur\OneDrive\Escritorio Lenovo Javi\Sur_Maderas\creadorPrecios\precios\src\styles\productos.css)
- [src/styles/productos-header.css](C:\Users\matur\OneDrive\Escritorio Lenovo Javi\Sur_Maderas\creadorPrecios\precios\src\styles\productos-header.css)
- [src/styles/producto-card.css](C:\Users\matur\OneDrive\Escritorio Lenovo Javi\Sur_Maderas\creadorPrecios\precios\src\styles\producto-card.css)
- [src/styles/carteles-preview-print.css](C:\Users\matur\OneDrive\Escritorio Lenovo Javi\Sur_Maderas\creadorPrecios\precios\src\styles\carteles-preview-print.css)
- [server/routes/productos.js](C:\Users\matur\OneDrive\Escritorio Lenovo Javi\Sur_Maderas\creadorPrecios\precios\server\routes\productos.js)
- [server/auth/googleAuth.js](C:\Users\matur\OneDrive\Escritorio Lenovo Javi\Sur_Maderas\creadorPrecios\precios\server\auth\googleAuth.js)
- [server/models/HistorialAccion.js](C:\Users\matur\OneDrive\Escritorio Lenovo Javi\Sur_Maderas\creadorPrecios\precios\server\models\HistorialAccion.js)

## Notas

- El frontend y el backend siguen sin una estrategia de tests consolidada.
- La build actual muestra warnings de `@tailwind` durante el minify, pero no bloquean el deploy.
- Suele quedar afuera de los commits tecnicos: `server/src/seed/reporte-imagenes-actualizadas.json`.

## Pendientes razonables

- Rehabilitar Google Auth cuando corresponda.
- Sumar tests basicos para rutas criticas y flujos de impresion.
- Corregir problemas de encoding en algunos textos heredados.
- Seguir afinando la experiencia visual de preview e impresion.
