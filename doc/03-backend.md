# Backend - Express + Firestore

## Estructura del Proyecto

```
backend/
├── src/
│   ├── routes/           # Definición de endpoints
│   ├── controllers/      # Lógica de requests
│   ├── services/         # Lógica de negocio
│   ├── models/           # Schemas Zod
│   ├── middlewares/      # Auth, validación, errores
│   ├── config/           # Configuración Firebase
│   └── index.ts          # Punto de entrada
├── .env                  # Variables de entorno
└── package.json
```

## Configuración de Entorno

### Archivo `.env` (Backend)

Crear en `backend/.env`:

```env
PORT=3000

# Firebase Admin SDK (JSON completo, una sola línea)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key":"..."}

FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com

# Cloudinary (opcional, para imágenes)
CLOUDINARY_CLOUD_NAME=tu-cloud
CLOUDINARY_API_KEY=tu-key
CLOUDINARY_API_SECRET=tu-secret

# Google APIs (opcional)
GOOGLE_API_KEY=tu-google-api-key
```

**Obtener credenciales Firebase**:
1. Firebase Console → Configuración → Cuentas de servicio
2. Generar nueva clave privada
3. Copiar todo el contenido JSON (en una sola línea para el .env)


## Generación de PDFs

Usa **PDFKit** para crear documentos:

```typescript
import PDFDocument from 'pdfkit';

async generateInvoice(orderId: string, res: Response) {
  const doc = new PDFDocument();
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=factura-${orderId}.pdf`);
  
  doc.pipe(res);
  doc.fontSize(20).text('FACTURA', { align: 'center' });
  doc.text(`Pedido: ${orderId}`);
  // ... más contenido
  doc.end();
}
```

## Flujo de Pedido (Backend)

1. Cliente POST `/v1/api/orders`
2. Validar datos con Zod
3. Verificar stock en Firestore
4. Crear documento en `orders`
5. Actualizar stock en `products`
6. Limpiar carrito
7. Generar factura PDF
8. Retornar pedido creado

## Scripts

```bash
# Desarrollo (hot reload)
bun run dev

# Build
bun run build              # Compila a /dist

# Producción
bun start                  # Ejecuta /dist/index.js
```

## Seguridad

✅ Tokens JWT verificados en cada request  
✅ Validación de datos con Zod  
✅ Reglas de Firestore por rol  
✅ Variables sensibles en `.env`  
✅ CORS configurado  

---

[← Frontend](./02-frontend.md) | [General →](Stock%20Master%20B2B%20-%20Información%20General.md)
