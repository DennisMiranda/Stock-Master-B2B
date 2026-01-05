import admin from "firebase-admin";
import { env } from "./env.js";

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: env.firebase.projectId,
    clientEmail: env.firebase.clientEmail,
    privateKey: env.firebase.privateKey?.replace(/\\n/g, "\n"),
  }),
});

export const db = admin.firestore();

export default admin;

export const COLLECTIONS = {
  USERS: 'users',
  ORDERS: 'orders',
  ROUTES: 'routes',
  DRIVERS: 'drivers',
  DELIVERIES: 'deliveries',
} as const;