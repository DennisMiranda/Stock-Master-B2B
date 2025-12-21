import admin, { db } from "../config/firebase";
import { User } from "../models/user.model";
import { RegisterInput, SyncInput } from "../utils/validators";

export class AuthService {
    // Registro B2B Manual (Email/Password + Datos Empresa)
    static async registerB2B(data: RegisterInput): Promise<User> {
        const { email, password, ruc, companyName, contactName } = data;

        // 1. Crear usuario en Firebase Auth
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: contactName,
        });

        // 2. Asignar Rol 'client' (Custom Claims)
        await admin.auth().setCustomUserClaims(userRecord.uid, { role: "client" });

        const newUser: User = {
            uid: userRecord.uid,
            email: email,
            displayName: contactName,
            ruc,
            companyName,
            contactName,
            role: "client",
            createdAt: new Date().toISOString(),
            provider: "password",
            isActive: true, // Por defecto activo
        };

        // 3. Guardar en Firestore (Usuario B2B)
        await db.collection("users").doc(userRecord.uid).set(newUser);

        return newUser;
    }

    // Sincronización Google (Google Login -> Backend)
    static async syncGoogleUser(data: SyncInput): Promise<{ success: boolean }> {
        const { uid, email, displayName, photoURL } = data;

        const userRef = db.collection("users").doc(uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            // Es un usuario nuevo que viene de Google
            // Asignamos rol 'client' por defecto
            await admin.auth().setCustomUserClaims(uid, { role: "client" });

            const newUser: User = {
                uid,
                email,
                displayName,
                photoURL,
                role: "client",
                createdAt: new Date().toISOString(),
                provider: "google",
                isActive: true, // Por defecto activo
                // No pedimos RUC aqui todavia (Estrategia Progressive Onboarding)
            };

            await userRef.set(newUser);
            console.log(`[AuthService] Nuevo usuario Google sincronizado: ${email}`);
        } else {
            console.log(`[AuthService] Usuario Google ya existe: ${email}`);
        }

        return { success: true };
    }

    // Ascender a Admin (Requiere Token válido)
    static async grantAdminRole(token: string): Promise<void> {
        // 1. Verificar token
        const decodedToken = await admin.auth().verifyIdToken(token);
        const uid = decodedToken.uid;

        // 2. Set Custom Claim
        await admin.auth().setCustomUserClaims(uid, { role: "admin" });

        // 3. Actualizar Firestore para consistencia visual
        await db.collection("users").doc(uid).update({ role: "admin" });

        console.log(`[AuthService] Usuario ascendido a ADMIN: ${decodedToken.email} (${uid})`);
    }
}
