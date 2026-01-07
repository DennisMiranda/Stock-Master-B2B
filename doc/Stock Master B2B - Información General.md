

## ¿Qué es Stock Master B2B?

Sistema web de distribución mayorista que automatiza:
- Gestión de pedidos y catálogo
- Rutas de despacho optimizadas
- Control de inventario en tiempo real
- Facturación automática en PDF

## Tecnologías

- **Frontend**: Angular 21 + TailwindCSS
- **Backend**: Express 5 + Bun
- **Base de Datos**: Firebase Firestore
- **Autenticación**: Firebase Auth

## Roles de Usuario

### 👨‍💼 Administrador
Gestiona todo el sistema:
- Productos y categorías
- Pedidos y estados
- Rutas de despacho
- Usuarios y conductores
- Dashboard con métricas

### 👤 Cliente B2B
Realiza compras mayoristas:
- Navega catálogo
- Crea pedidos desde carrito
- Rastrea entregas
- Descarga facturas

### 🚚 Conductor
Ejecuta entregas:
- Ve ruta asignada en mapa
- Actualiza estado de entregas
- Confirma entregas realizadas

## Arquitectura

```
┌─────────────┐
│  Frontend   │  Angular 21 SPA (:4200)
│  (Angular)  │
└──────┬──────┘
       │ HTTP/REST
┌──────▼──────┐
│   Backend   │  Express API (:3000)
│  (Express)  │
└──────┬──────┘
       │ Firebase SDK
┌──────▼──────┐
│  Firestore  │  Base de datos NoSQL
│  + Auth     │
└─────────────┘
```

## Flujo de Pedido

1. **Cliente** agrega productos al carrito
2. **Cliente** confirma pedido
3. **Backend** valida stock y crea pedido
4. **Sistema** genera factura PDF
5. **Admin** asigna pedido a ruta
6. **Conductor** ejecuta entrega
7. **Sistema** marca pedido como entregado

## Colecciones Firestore

- `users` - Usuarios (admin, client, driver)
- `products` - Catálogo de productos
- `categories` - Categorías
- `orders` - Pedidos con items
- `cart` - Carritos activos
- `routes` - Rutas de despacho
- `drivers` - Información de conductores

## Estados de Pedido

```
pending → confirmed → processing → assigne → delivered
   ↓
cancelled
```

## Objetivos del Sistema

✅ Reducir 80% tiempo de procesamiento  
✅ Eliminar 95% errores manuales  
✅ Optimizar rutas de despacho  
✅ Visibilidad en tiempo real  
✅ Facturación automática  

---

**Ver más**:
- [Frontend](./02-frontend.md) - Detalles de Angular
- [Backend](./03-backend.md) - Detalles de Express y Firestore
