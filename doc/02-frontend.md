# Frontend - Angular 21

## Estructura del Proyecto

```
frontend/stockmaster-client/
├── src/app/
│   ├── features/          # Módulos de funcionalidad
│   │   ├── auth/         # Login, registro
│   │   ├── admin/        # Panel administrativo
│   │   ├── user/         # Área cliente
│   │   └── driver/       # Área conductor
│   ├── core/             # Servicios y guards
│   ├── shared/           # Componentes reutilizables
│   └── layouts/          # Layouts
├── .env                   # Variables de entorno
└── package.json
```

## Configuración de Entorno

### Archivo `.env` (Frontend)

Crear en `frontend/stockmaster-client/.env`:

```env
VITE_FIREBASE_API_KEY=tu-api-key
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_API_URL=http://localhost:3000
```

### Generar archivo de entorno

El proyecto usa un script para generar los archivos environment desde `.env`:

```bash

bun run config 

```

Esto crea `src/environments/environment.ts` con las variables.

## Módulos Principales

### Auth (`features/auth/`)
- **Login**: Autenticación con Firebase
- **Registro**: Nuevos usuarios (quedan en estado "pending")
- **Guards**: Protección de rutas

**Rutas**:
- `/auth/login`
- `/auth/register`

### Admin (`features/admin/`)
Panel completo de administración:
- **Dashboard**: Métricas y estadísticas
- **Productos**: CRUD completo con imágenes
- **Pedidos**: Gestión de estados
- **Rutas**: Creación y asignación
- **Usuarios**: Aprobación y gestión

**Protección**: Requiere rol `admin`

### User (`features/user/`)
Área para clientes B2B:
- **Catálogo**: Navegación y filtros
- **Carrito**: Agregar productos
- **Mis Pedidos**: Historial y tracking

**Protección**: Requiere rol `client`

### Driver (`features/driver/`)
Área para conductores:
- **Rutas**: Ver ruta asignada
- **Mapa**: Visualización con Leaflet
- **Entregas**: Actualizar estados

**Protección**: Requiere rol `driver`

## Servicios Core

### AuthService
- Login/logout con Firebase Auth
- Obtener usuario actual
- Verificar rol

### HttpService
Centraliza llamadas a la API:
```typescript
await this.http.get('/v1/api/products');
await this.http.post('/v1/api/orders', orderData);
```

### ProductService
CRUD de productos desde API backend

### CartService
Gestión de carrito usando **Signals** (Angular 21):
```typescript
private cartItems = signal<CartItem[]>([]);
total = computed(() => /* calcula total */);
```

## Guards

### authGuard
Verifica que el usuario esté autenticado con Firebase

### roleGuard
Verifica que el usuario tenga el rol correcto:
```typescript
// Ejemplo en rutas
{
  path: 'admin',
  canActivate: [authGuard, roleGuard(['admin'])],
  loadChildren: () => import('./features/admin/admin.routes')
}
```

## Routing

Sistema de rutas con **lazy loading**:

```typescript
export const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  { path: 'auth', loadChildren: () => import('./features/auth/auth.routes') },
  { path: 'admin', canActivate: [authGuard, roleGuard(['admin'])], ... },
  { path: 'user', canActivate: [authGuard, roleGuard(['client'])], ... },
  { path: 'driver', canActivate: [authGuard, roleGuard(['driver'])], ... }
];
```
## Mapas con Leaflet

Para visualización de rutas:
```typescript
import * as L from 'leaflet';

const map = L.map('map').setView([lat, lng], 13);
L.marker([lat, lng]).addTo(map);
```


---

[← General](Stock%20Master%20B2B%20-%20Información%20General.md) | [Backend →](./03-backend.md)
