import { Request, Response } from 'express';
import { db } from '../config/firebase';
import admin from '../config/firebase';
import { User } from '../models/user.model';
import { createUserSchema, updateUserSchema } from '../utils/validators';

export const userController = {
    // Crear Usuario (Solo Admin)
    createUser: async (req: Request, res: Response) => {
        try {
            // 1. Validar Inputs
            const validation = createUserSchema.safeParse(req.body);
            if (!validation.success) {
                res.status(400).json({ success: false, errors: validation.error.format() });
                return;
            }

            const { email, password, displayName, role } = validation.data;

            // 2. Crear en Firebase Auth
            const userRecord = await admin.auth().createUser({
                email,
                password,
                displayName
            });

            // 3. Set Custom Claims
            await admin.auth().setCustomUserClaims(userRecord.uid, { role });

            // 4. Guardar en Firestore
            const newUser: User = {
                uid: userRecord.uid,
                email,
                displayName,
                role,
                createdAt: new Date().toISOString(),
                provider: 'password',
                isActive: true
            };

            await db.collection('users').doc(userRecord.uid).set(newUser);

            res.status(201).json({
                success: true,
                message: 'Usuario creado exitosamente',
                data: newUser
            });

        } catch (error: any) {
            console.error('Error creating user:', error);
            res.status(500).json({
                success: false,
                message: error.code === 'auth/email-already-exists' ? 'El email ya está registrado' : 'Error al crear usuario'
            });
        }
    },

    // Actualizar usuario (Rol y Estado)
    updateUser: async (req: Request, res: Response) => {
        const { uid } = req.params as { uid: string };

        // 1. Validar Inputs
        const validation = updateUserSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({ success: false, errors: validation.error.format() });
            return;
        }

        const { role, isActive } = validation.data;

        if (!uid) {
            res.status(400).json({ success: false, message: 'UID es requerido' });
            return;
        }

        try {
            // 2. Validar si usuario existe en Firestore
            const userRef = db.collection('users').doc(uid);
            const userDoc = await userRef.get();

            if (!userDoc.exists) {
                res.status(404).json({ success: false, message: 'Usuario no encontrado' });
                return;
            }

            // 3. Actualizar Firestore
            const updates: Partial<User> = {};
            if (role) updates.role = role;
            if (isActive !== undefined) updates.isActive = isActive;

            await userRef.update(updates);

            // 4. Sincronizar con Firebase Auth (Claims y Estado)
            if (role) {
                await admin.auth().setCustomUserClaims(uid, { role });
            }

            if (isActive !== undefined) {
                await admin.auth().updateUser(uid, { disabled: !isActive });
            }

            // 5. Responder
            res.status(200).json({
                success: true,
                message: 'Usuario actualizado correctamente',
                data: { uid, ...userDoc.data(), ...updates }
            });

        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ success: false, message: 'Error al actualizar usuario' });
        }
    },

    // Obtener todos los usuarios (Solo Admin)
    getAllUsers: async (req: Request, res: Response) => {
        try {
            const usersSnapshot = await db.collection('users').get();
            const users = usersSnapshot.docs.map(doc => {
                const data = doc.data() as User;
                // Retrocompatibilidad: Si no existe isActive, asumir true
                return {
                    ...data,
                    isActive: data.isActive !== undefined ? data.isActive : true,
                    lastLogin: data.lastLogin || undefined
                };
            });

            res.status(200).json({
                success: true,
                message: 'Usuarios obtenidos correctamente',
                data: users
            });
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ message: 'Error interno al obtener usuarios' });
        }
    }
};
