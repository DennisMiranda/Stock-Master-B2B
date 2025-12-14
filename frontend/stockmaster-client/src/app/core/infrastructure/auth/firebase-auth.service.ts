import { Injectable, signal, computed, inject } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    User,
    onAuthStateChanged
} from 'firebase/auth';
import { environment } from '../../../../environments/environment';

// Inicializar la App de Firebase (asegurar que esto ocurra una sola vez)
const app = initializeApp(environment.firebaseConfig);
const auth = getAuth(app);

@Injectable({
    providedIn: 'root'
})
export class FirebaseAuthService {

    // Signal principal para el usuario actual. Inicialmente null.
    readonly currentUser = signal<User | null>(null);

    // Signal computada para saber si el usuario está autenticado.
    readonly isAuthenticated = computed(() => !!this.currentUser());

    constructor() {
        // Escuchar cambios en el estado de autenticación (Login/Logout/Refresh)
        onAuthStateChanged(auth, (user) => {
            // Actualizar el signal 'currentUser'.
            // Al usar signals, cualquier componente que dependa de esto se actualizará sin Zone.js.
            this.currentUser.set(user);
        });
    }

    /**
     * Iniciar sesión con Google (Popup)
     * @returns Promise<UserCredential>
     */
    async loginWithGoogle() {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            return result.user;
        } catch (error) {
            console.error('Error en Google Login:', error);
            throw error;
        }
    }

    /**
     * Iniciar sesión con Email y Contraseña
     * @param email Email del usuario
     * @param password Contraseña del usuario
     * @returns Promise<UserCredential>
     */
    async loginWithEmail(email: string, password: string) {
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            return result.user;
        } catch (error) {
            console.error('Error en Email Login:', error);
            throw error;
        }
    }

    /**
     * @deprecated El registro se maneja ahora vía Backend (ApiService) para asignar roles.
     * Usar AuthRepository.register()
     */
    // async register(email: string, password: string) { ... }

    /**
     * Cerrar Sesión
     * @returns Promise<void>
     */
    async logout() {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            throw error;
        }
    }
}
