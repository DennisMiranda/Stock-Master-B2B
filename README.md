# 🚀 Stock Master B2B

> Sistema integral de distribución B2B para la gestión de pedidos, clientes, rutas de despacho e inventario

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Angular](https://img.shields.io/badge/Angular-21-red?logo=angular)](https://angular.io/)
[![Express](https://img.shields.io/badge/Express-5.2-green?logo=express)](https://expressjs.com/)
[![Bun](https://img.shields.io/badge/Bun-1.3.4-yellow?logo=bun)](https://bun.sh/)
[![Firebase](https://img.shields.io/badge/Firebase-12.7-orange?logo=firebase)](https://firebase.google.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.1-blue?logo=tailwindcss)](https://tailwindcss.com/)

---

## 📋 Descripción

**Stock Master B2B** es una plataforma completa que conecta distribuidores mayoristas con sus clientes empresariales, automatizando el proceso de pedidos, gestión de inventario, rutas de despacho y facturación.

### Características Principales

- ✅ **Catálogo de productos** con gestión de inventario en tiempo real
- ✅ **Sistema de pedidos** automatizado con carrito de compras
- ✅ **Rutas de despacho** optimizadas con mapas interactivos
- ✅ **Generación de documentos** (facturas, guías) en PDF
- ✅ **Panel administrativo** con métricas y reportes
- ✅ **Sistema de roles** (Admin, Cliente, Conductor)
- ✅ **Autenticación segura** con Firebase
- ✅ **Arquitectura moderna** con Angular 21 y Express 5

---

## 🏗️ Arquitectura

Este proyecto utiliza una arquitectura de **monorepo con Bun workspaces**:

```
Stock-Master-B2B/
├── backend/              # API REST con Express + TypeScript
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── models/
│   │   ├── middlewares/
│   │   └── index.ts
│   └── package.json
│
├── frontend/             # SPA con Angular 21
│   └── stockmaster-client/
│       ├── src/
│       │   ├── app/
│       │   │   ├── features/
│       │   │   ├── core/
│       │   │   ├── shared/
│       │   │   └── layouts/
│       │   └── environments/
│       └── package.json
│
├── doc/                  # Documentación técnica
├── package.json          # Root workspace
└── bun.lock
```

**Stack Tecnológico:**

- **Frontend**: Angular 21, TypeScript, TailwindCSS 4, Leaflet, RxJS
- **Backend**: Express 5, TypeScript, Bun, Zod, PDFKit
- **Base de Datos**: Firebase Firestore
- **Autenticación**: Firebase Auth
- **Storage**: Cloudinary (imágenes)

---

## 🚀 Quick Start

### Prerrequisitos

- [Bun](https://bun.sh/) >= 1.1.42
- Cuenta de [Firebase](https://firebase.google.com/)
- Git

### Instalación

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/DennisMiranda/Stock-Master-B2B.git
   cd Stock-Master-B2B
   ```

2. **Instalar dependencias** (backend + frontend automáticamente):
   ```bash
   bun install
   ```

3. **Configurar Firebase**:
   
   - Crear proyecto en [Firebase Console](https://console.firebase.google.com/)
   - Habilitar **Authentication** (Email/Password)
   - Crear base de datos **Firestore**
   - Obtener credenciales (ver abajo)

4. **Configurar variables de entorno**:

   El proyecto requiere **2 archivos `.env`**:

   **📁 Backend** (`backend/.env`):
   ```env
   PORT=3000
   
   # Firebase Admin SDK (JSON completo en una línea)
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key":"..."}
   
   FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   
   # Cloudinary (opcional)
   CLOUDINARY_CLOUD_NAME=your-cloud
   CLOUDINARY_API_KEY=your-key
   CLOUDINARY_API_SECRET=your-secret
   ```
   
   > **Obtener credenciales**: Firebase Console → Configuración → Cuentas de servicio → Generar nueva clave

   **📁 Frontend** (`frontend/stockmaster-client/.env`):
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
   VITE_API_URL=http://localhost:3000
   ```
   
   > **Obtener credenciales**: Firebase Console → Configuración → General → Tus apps → Web

   **Generar archivo de configuración** (Frontend):
   
   El frontend usa un script que lee el `.env` y genera el archivo de entorno:
   ```bash
   # Desde la raíz del proyecto
   cd frontend/stockmaster-client
   bun run config 
   ```
   
   Esto crea `src/environments/environment.ts` con las variables de Firebase.



---

## 📦 Scripts Disponibles

### Desde la raíz del proyecto

| Comando | Descripción |
|---------|-------------|
| `bun install` | Instala todas las dependencias (backend + frontend) |
| `bun run dev` | Inicia backend y frontend simultáneamente |
| `bun run dev:backend` | Inicia solo el backend en :3000 |
| `bun run dev:frontend` | Inicia solo el frontend en :4200 |
| `bun run build` | Compila backend y frontend para producción |
| `bun run build:backend` | Compila solo el backend |
| `bun run build:frontend` | Compila solo el frontend |

### Backend (`/backend`)

| Comando | Descripción |
|---------|-------------|
| `bun run dev` | Hot reload con watch mode |
| `bun run build` | Compila TypeScript a `/dist` |
| `bun start` | Ejecuta versión compilada |

### Frontend (`/frontend/stockmaster-client`)

| Comando | Descripción |
|---------|-------------|
| `bun run start` | Dev server de Angular |
| `bun run build` | Build de producción |
| `bun run test` | Ejecuta tests con Vitest |

---

## 📚 Documentación

Documentación técnica en [`/doc`](./doc):

1. **[General](./doc/01-general.md)** - Sistema, objetivos, roles y arquitectura
2. **[Frontend](./doc/02-frontend.md)** - Angular 21, estructura y servicios
3. **[Backend](./doc/03-backend.md)** - Express API, Firestore y endpoints

---

## 🔑 Roles y Permisos

El sistema maneja tres tipos de usuarios:

- **👨‍💼 Administradores**: Gestión completa del sistema (productos, pedidos, rutas, usuarios)
- **👤 Clientes B2B**: Navegación de catálogo, creación de pedidos, seguimiento
- **🚚 Conductores**: Visualización de rutas asignadas, actualización de entregas

---

## 🛠️ Configuración de Firebase

1. Crear proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilitar **Authentication** (Email/Password)
3. Crear base de datos **Firestore**
4. Obtener credenciales:
   - **Backend**: Cuentas de servicio → Generar nueva clave
   - **Frontend**: General → Tus apps → Web → Configuración
5. Copiar valores a los archivos `.env` correspondientes

> Ver [Frontend](./doc/02-frontend.md) y [Backend](./doc/03-backend.md) para detalles de configuración.

---

## 🌐 API Endpoints

El backend expone una API RESTful en `http://localhost:3000/v1/api/`:

| Endpoint | Descripción |
|----------|-------------|
| `/auth` | Autenticación y registro |
| `/products` | Gestión de productos |
| `/cart` | Carrito de compras |
| `/orders` | Gestión de pedidos |
| `/routes` | Rutas de despacho |
| `/drivers` | Gestión de conductores |
| `/users` | Gestión de usuarios |
| `/document` | Generación de PDFs |
| `/dashboard` | Métricas y estadísticas |

Ver documentación completa en [Backend](./doc/03-backend.md).

---

## 📂 Estructura de Base de Datos

Colecciones principales en Firestore:

- `users` - Datos de usuarios (clientes, admins, conductores)
- `products` - Catálogo de productos
- `categories` - Categorías de productos
- `orders` - Pedidos realizados
- `cart` - Carritos de compra activos
- `routes` - Rutas de despacho
- `drivers` - Información de conductores
- `settings` - Configuración del sistema

Ver estructura completa en [Documentación Técnica](./doc/02-tecnica.md).

---

## ✅ Ventajas del Monorepo con Bun

- 🚀 **Una sola instalación**: `bun install` para todo el proyecto
- 📦 **Dependencias compartidas**: TypeScript, tipos, utilidades
- ⚡ **Rendimiento**: Bun es significativamente más rápido que npm/yarn
- 🔧 **Scripts centralizados**: Ejecuta backend y frontend desde la raíz
- 🧩 **Modularidad**: Fácil compartir código entre frontend y backend


---

## 📝 Licencia

Este proyecto es privado y está bajo licencia propietaria.

---

## 📧 Contacto

Para soporte o consultas, contacta al equipo de desarrollo.

---

## 🙏 Agradecimientos

- [Angular](https://angular.io/)
- [Express](https://expressjs.com/)
- [Bun](https://bun.sh/)
- [Firebase](https://firebase.google.com/)
- [TailwindCSS](https://tailwindcss.com/)

---

**Versión**: 1.0.0  
**Última actualización**: Enero 2026
