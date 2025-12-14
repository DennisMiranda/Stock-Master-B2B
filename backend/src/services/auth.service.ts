import { auth, db } from '../config/firebase';

export interface CreateUserData {
    email: string;
    password: string;
    role?: 'client' | 'admin' | 'almacenero';
    ruc?: string;
    companyName?: string;
    contactName?: string;
}

export class AuthService {

    async registerUser(data: CreateUserData) {
        const { email, password, role = 'client', ruc, companyName, contactName } = data;

        try {
            // 1. Crear usuario en Firebase Auth
            const userRecord = await auth.createUser({
                email,
                password,
                displayName: companyName || contactName
            });

            // 2. Asignar Claims (Rol)
            await auth.setCustomUserClaims(userRecord.uid, { role });

            // 3. Guardar datos adicionales en Firestore (colección 'users')
            if (ruc || companyName) {
                await db.collection('users').doc(userRecord.uid).set({
                    email,
                    role,
                    ruc: ruc || null,
                    companyName: companyName || null,
                    contactName: contactName || null,
                    createdAt: new Date()
                });
            }

            return {
                uid: userRecord.uid,
                email: userRecord.email,
                role,
                ruc,
                companyName
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Sincroniza el usuario de Google con la base de datos.
     * Si no existe en Firestore, lo crea y le asigna el rol 'client'.
     */
    async syncUser(uid: string, email: string, displayName?: string) {
        try {
            console.log(`🔍 Buscando usuario en Firestore ID: ${uid}`);
            const userRef = db.collection('users').doc(uid);
            const userDoc = await userRef.get();

            if (!userDoc.exists) {
                console.log('📝 Usuario no existe. Creando nuevo registro...');
                // Si no existe, lo creamos
                const newUser = {
                    email,
                    displayName: displayName || null,
                    role: 'client',
                    createdAt: new Date(),
                    authProvider: 'google'
                };

                await userRef.set(newUser);
                console.log('💾 Guardado en Firestore');

                // Aseguramos que tenga el claim
                await auth.setCustomUserClaims(uid, { role: 'client' });
                console.log('🔒 Claims asignados');

                return { ...newUser, uid, isNew: true };
            }

            console.log('ℹ️ Usuario ya existe en Firestore');
            // Si ya existe, devolvemos sus datos
            return { ...userDoc.data(), uid, isNew: false };
        } catch (error) {
            console.error('❌ Error en authService.syncUser:', error);
            throw error;
        }
    }
}
