# Creador de Precios

Aplicacion interna para Sur Maderas orientada a ordenar productos, mantener clasificaciones comerciales y preparar carteles listos para imprimir.

Hoy el proyecto ya permite trabajar sobre una base real de productos en MongoDB desde una interfaz web publicada y protegida.

## Que hace hoy

- Ver productos cargados en MongoDB.
- Buscar por nombre o codigo.
- Filtrar por categoria y subcategoria.
- Mantener seleccion de productos entre filtros para armar tandas de impresion.
- Clasificar productos de forma individual o masiva.
- Crear y eliminar categorias y subcategorias.
- Ver historial de acciones.
- Preparar carteles en `A4 completa` o `Media hoja`.
- Agrupar carteles por clasificacion o mezclar seleccion.
- Aplicar descuento porcentual solo al cartel.
- Mostrar precio anterior tachado al imprimir.
- Mostrar columna `Precio varilla` para Listoneria y Molduras.
- Editar encabezados y datos antes de imprimir.
- Sincronizar productos desde CSV sin romper datos existentes.
- Sincronizar imagenes desde CSV sin tocar otros campos.
- Previsualizar fotos en hover y mostrar badge `Foto` en cards.
- Iniciar sesion con Google antes de entrar.
- Restringir acceso a cuentas autorizadas.
- Usar la app desplegada en Vercel.

## Stack

- Frontend: React + Vite
- Backend: Express
- Base de datos: MongoDB + Mongoose
- UI y feedback: SweetAlert2 + React Toastify
- Auth: Google Identity Services + validacion de token en backend
- Utilidades: `xlsx`
- Deploy: Vercel

## Estructura

```text
precios/
|-- src/
|   |-- components/
|   |   |-- auth/
|   |   `-- productos/
|   |-- services/
|   |-- styles/
|   `-- utils/
|-- public/
|-- api/                    # entrada serverless para Vercel
|-- server/
|   |-- auth/
|   |-- models/
|   |-- routes/
|   |-- src/scripts/
|   `-- .env.example
|-- .env.example
|-- vercel.json
`-- README.md
```

## Funcionalidades principales

### Gestion de productos

- Listado de productos con cards.
- Colores por categoria y subcategoria.
- Filtros por texto, categoria y subcategoria.
- Paginacion en la vista.
- Seleccion multiple persistente entre categorias y filtros.
- Edicion masiva de clasificacion.

### Categorias y subcategorias

- Alta manual de categorias.
- Alta manual de subcategorias.
- Eliminacion de categorias completas.
- Eliminacion de subcategorias individuales.
- Soporte para `Sin clasificar` y `Sin subcategoria`.

### Historial

- Registro de acciones relevantes.
- Consulta de historial desde la UI.
- Limpieza manual del historial.

### Impresion

- Preparacion de carteles desde seleccion multiple.
- Formatos `A4 completa` y `Media hoja`.
- Agrupacion por clasificacion o mezcla libre.
- Descuento opcional solo para la impresion.
- Precio anterior tachado opcional.
- Encabezados editables.
- Precio varilla para categorias especificas.

### Imagenes

- Sincronizacion de `imagenUrl` desde CSV.
- No modifica nombre, precio ni clasificacion al sincronizar imagenes.
- Preview flotante en hover.
- Badge visual para productos con foto.

### Sincronizacion de productos

- Actualiza precio de productos existentes.
- Crea productos nuevos si no existen.
- No pisa nombre, categoria ni subcategoria existentes.
- Scripts preparados para correr con archivo por defecto o ruta explicita.

### Seguridad y acceso

- Pantalla de acceso previa a la app.
- Login con Google.
- Validacion del token en backend.
- Lista blanca de emails autorizados.
- Proteccion de rutas `/api/productos/*`.

## Endpoints disponibles

- `GET /api/health`
- `GET /api/auth/session`
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

### Frontend (`.env`)

```env
VITE_GOOGLE_CLIENT_ID=tu-google-client-id.apps.googleusercontent.com
VITE_API_URL=http://localhost:4000/api/productos
```

### Backend (`server/.env`)

```env
MONGODB_URI=mongodb://localhost:27017/precios
GOOGLE_CLIENT_ID=tu-google-client-id.apps.googleusercontent.com
ALLOWED_GOOGLE_EMAILS=tuusuario@gmail.com,otro@mail.com
CORS_ORIGIN=http://localhost:5173
```

Tomar como base:

- [.env.example](C:\Users\matur\OneDrive\Escritorio Lenovo Javi\Sur_Maderas\creadorPrecios\precios\.env.example)
- [server/.env.example](C:\Users\matur\OneDrive\Escritorio Lenovo Javi\Sur_Maderas\creadorPrecios\precios\server\.env.example)

## Como levantar el proyecto

### 1. Instalar dependencias del frontend

```bash
npm install
```

### 2. Instalar dependencias del backend local

```bash
cd server
npm install
```

### 3. Configurar variables de entorno

- Crear `.env` en la raiz usando `.env.example`.
- Crear `server/.env` usando `server/.env.example`.

### 4. Levantar backend local

Desde `server/`:

```bash
npm run dev
```

Disponible en `http://localhost:4000`.

### 5. Levantar frontend local

Desde la raiz:

```bash
npm run dev
```

Disponible en `http://localhost:5173`.

## Scripts utiles

### Frontend

```bash
npm run dev
npm run build
```

### Backend / datos

Desde `server/`:

```bash
npm run dev
npm run sync:productos
npm run sync:imagenes
```

Tambien se puede correr la sync de imagenes con archivo explicito:

```bash
node src/scripts/sincronizarImagenesDesdeExcel.js "C:\ruta\archivo.csv"
```

## Estado actual

La aplicacion ya cubre el flujo principal del negocio:

- catalogo de productos
- clasificacion manual y masiva
- mantenimiento de categorias
- historial
- impresion
- sincronizacion de productos e imagenes
- autenticacion con Google
- deploy web operativo

Todavia quedan mejoras tecnicas y de calidad para seguir ordenando el proyecto.

## To do list

- [x] Proteger secretos con `.gitignore` y archivos `.env.example`
- [x] Corregir el `README` para documentar el proyecto real
- [ ] Separar la configuracion de ESLint entre frontend y backend
- [x] Pasar URLs y auth principal a variables de entorno
- [ ] Corregir problemas de encoding en textos con acentos
- [x] Dividir `src/components/Productos.jsx` en componentes mas pequenos
- [x] Eliminar archivos viejos que no coinciden con el flujo actual
- [ ] Agregar validaciones mas claras en backend para altas, bajas y cambios masivos
- [ ] Agregar tests basicos para rutas criticas
- [ ] Documentar mejor la estructura de datos de `Producto`, `Categoria`, `Subcategoria` e `HistorialAccion`
- [x] Mejorar la experiencia de impresion y vista previa de carteles
- [x] Subir proyecto a la web
- [x] Clave de usuario para entrar

## Notas

- La URL publica actual esta en Vercel.
- El acceso se restringe por `ALLOWED_GOOGLE_EMAILS`.
- `GET /api/health` queda libre para chequeos de estado.
- El proyecto todavia no tiene una estrategia de tests consolidada.
