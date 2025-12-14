import { Injectable, inject } from '@angular/core';
import { AuthRepository } from '../../domain/repositories/auth.repository';
import { LoginRequest, RegisterRequest, User } from '../../domain/models/auth.model';
import { FirebaseAuthService } from '../auth/firebase-auth.service';
import { ApiService } from '../http/api.service';

@Injectable({
    providedIn: 'root'
})
export class AuthRepositoryImpl extends AuthRepository {

    private authService = inject(FirebaseAuthService); // Firebase SDK
    private apiService = inject(ApiService);   // Backend API

    async login(data: LoginRequest): Promise<User> {
        // 1. Login con Firebase para obtener el token
        const firebaseUser = await this.authService.loginWithEmail(data.email, data.password);

        // 2. (Opcional) Llamar al backend para obtener datos del usuario si no están en el token
        // Por ahora, devolvemos un usuario básico basado en Firebase
        // Idealmente: return this.apiService.get<User>('/auth/me');

        return {
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            role: 'client' // Esto debería venir de los claims o del backend
        };
    }

    async loginWithGoogle(): Promise<User> {
        console.log('🔵 [AuthRepo] Iniciando loginWithGoogle...');
        const firebaseUser = await this.authService.loginWithGoogle();
        console.log('🟢 [AuthRepo] Google Login exitoso. Usuario:', firebaseUser.email);

        try {
            // Sincronizar con el backend para asegurar que existe en Firestore y tiene rol
            console.log('📡 [AuthRepo] Llamando a /auth/sync...');
            const response = await this.apiService.post<{ user: User }>('/auth/sync', {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName
            });
            console.log('✅ [AuthRepo] Sync exitoso. Respuesta:', response);

            return {
                uid: firebaseUser.uid,
                email: firebaseUser.email!,
                role: (response.user as any).role || 'client' // Usamos el rol que nos devuelve el backend
            };
        } catch (error) {
            console.error('❌ [AuthRepo] Error en Sync:', error);
            // Aunque falle el sync, dejamos pasar al usuario (fallback) o lanzamos error?
            // Por seguridad, si el sync falla, el usuario no tendrá rol en DB. 
            // Podríamos retornarlo con rol 'guest' o lanzar error. 
            // Retornemos 'client' por defecto para no bloquear acceso, pero logueando el error.
            return {
                uid: firebaseUser.uid,
                email: firebaseUser.email!,
                role: 'client'
            };
        }
    }

    async register(data: RegisterRequest): Promise<User> {
        // 1. Delegar el registro al BACKEND
        // El backend creará el usuario en Firebase y asignará el rol
        const response = await this.apiService.post<{ user: User }>('/auth/register', data);

        // 2. Después de que el backend crea el usuario, podríamos hacer login automático
        // await this.authService.loginWithEmail(data.email, data.password);

        return response.user;
    }

    async logout(): Promise<void> {
        await this.authService.logout();
    }
}
