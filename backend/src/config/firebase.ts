import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Cargar variables de entorno
dotenv.config();

// Inicializar Firebase Admin
// Se asume que GOOGLE_APPLICATION_CREDENTIALS está configurado o se pasan credenciales explícitas.
// Para desarrollo local se puede usar serviceAccountKey.json
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.PROJECT_ID,
      clientEmail: process.env.CLIENT_EMAIL,
      // Reemplazar \\n con saltos de línea reales para la clave privada
      privateKey: process.env.PRIVATE_KEY?.replace(/\\n/g, '\n'),
    })
  });
}

export const db = getFirestore();
export const auth = getAuth();