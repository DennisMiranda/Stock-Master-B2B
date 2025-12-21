import { inject, Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    User as FirebaseUser
} from 'firebase/auth';
import { from, Observable } from 'rxjs';
import { switchMap, tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiService } from '../http/api.service';
import { RegisterRequest, User } from '../models/auth.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiService = inject(ApiService);
    private router = inject(Router);

    // Firebase Init
    private app = initializeApp(environment.firebaseConfig);
    private auth = getAuth(this.app);

    // State (Signals)
    currentUser = signal<FirebaseUser | null>(null);
    currentToken = signal<string | null>(null); // Added for Interceptor
    userRole = signal<string | null>(null);
    authInitialized = signal<boolean>(false);
    isLoading = signal<boolean>(false);
    error = signal<string | null>(null);

    // Computed
    isAdmin = computed(() => this.userRole() === 'admin');
    isWarehouse = computed(() => this.userRole() === 'warehouse');
    isDriver = computed(() => this.userRole() === 'driver');

    constructor() {
        // Escuchar cambios de sesión
        onAuthStateChanged(this.auth, async (user) => {
            this.currentUser.set(user);
            if (user) {
                try {
                    // Forzar refresh del token (true) para asegurar que tenemos los últimos claims
                    const tokenResult = await user.getIdTokenResult(true);

                    console.log('🔑 TU TOKEN DE ACCESO (Copia esto en Postman):', tokenResult.token);
                    this.currentToken.set(tokenResult.token); // Store token
                    this.userRole.set((tokenResult.claims['role'] as string) || 'client');
                } catch (e) {
                    console.error('Error fetching token claims', e);
                    this.userRole.set(null);
                    this.currentToken.set(null);
                }
            } else {
                this.userRole.set(null);
                this.currentToken.set(null);
            }
            // Marcamos como inicializado
            this.authInitialized.set(true);
        });
    }

    // --- Helper Redirección ---
    private async redirectUser(user: FirebaseUser) {
        try {
            // Forzamos refresh (true) para garantizar que 'claims' estén actualizados al 100%
            const tokenResult = await user.getIdTokenResult(true);
            const role = tokenResult.claims['role'];

            console.log('[AuthService] Redireccionando... Rol detectado:', role);

            // Cast role to string explicitly for TS check
            const userRole = role as string;

            // CRITICAL FIX: Update signal explicitly BEFORE navigation so Guards see it immediately
            this.userRole.set(userRole);

            if (['admin', 'warehouse', 'driver'].includes(userRole)) {
                console.log('[AuthService] Usuario STAFF -> /admin');
                await this.router.navigate(['/admin']);
            } else {
                console.log('[AuthService] Usuario CLIENT/OTRO -> /shop/home');
                await this.router.navigate(['/shop/home']);
            }
        } catch (e) {
            console.error('[AuthService] Redirection Error:', e);
            await this.router.navigate(['/shop/home']);
        }
    }

    // --- Login con Email ---
    loginWithEmail(email: string, password: string): Observable<void> {
        this.isLoading.set(true);
        return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
            switchMap(async (credential) => {
                await this.redirectUser(credential.user);
                this.isLoading.set(false);
            }),
            catchError((err) => {
                this.isLoading.set(false);
                this.error.set(err.message);
                throw err;
            })
        );
    }

    // --- Login con Google (Sync) ---
    loginWithGoogle(): Observable<void> {
        this.isLoading.set(true);
        const provider = new GoogleAuthProvider();

        return from(signInWithPopup(this.auth, provider)).pipe(
            switchMap((userCredential) => {
                // Notificar al backend para sincronizar
                const { uid, email, displayName, photoURL } = userCredential.user;
                // Usamos ApiService para sincronizar y luego redireccionar
                return this.apiService.post<{ success: boolean }>('/auth/sync', { uid, email, displayName, photoURL })
                    .pipe(
                        map(() => userCredential.user) // Pasamos el usuario al siguiente paso
                    );
            }),
            switchMap(async (user) => {
                await this.redirectUser(user);
                this.isLoading.set(false);
            }),
            catchError((err: any) => {
                this.isLoading.set(false);
                // Si el usuario cerró el popup, no lo mostramos como error en la UI
                if (err.code === 'auth/popup-closed-by-user') {
                    console.log('Login cancelado por el usuario (Popup cerrado)');
                    return []; // Retornamos observable vacío para completar el flujo sin error
                }
                this.error.set(err.message);
                throw err;
            })
        );
    }

    // --- Registro B2B ---
    registerB2B(data: RegisterRequest): Observable<void> {
        this.isLoading.set(true);
        // Usamos ApiService para registrar
        return this.apiService.post<User>('/auth/register', data).pipe(
            switchMap(() => {
                // Login automático tras registro exitoso
                return from(signInWithEmailAndPassword(this.auth, data.email, data.password!));
            }),
            switchMap(async (credential) => {
                await this.redirectUser(credential.user);
                this.isLoading.set(false);
            }),
            catchError((err) => {
                this.isLoading.set(false);
                // Extraer mensaje de error personalizado del Backend si existe
                const errorMessage = err.error?.error || err.error?.message || 'Error en el registro';
                this.error.set(errorMessage);
                throw err;
            })
        );
    }

    // --- Recuperación de Contraseña ---
    sendPasswordResetEmail(email: string): Observable<void> {
        return from(sendPasswordResetEmail(this.auth, email));
    }

    // --- Logout ---
    logout() {
        return from(signOut(this.auth)).pipe(
            tap(() => {
                this.currentUser.set(null);
                this.userRole.set(null);
                this.router.navigate(['/auth/login']);
            })
        );
    }

    // --- Gestión de Perfil (Update Password) ---
    updateUserPassword(currentPassword: string, newPassword: string): Observable<void> {
        const user = this.auth.currentUser;
        if (!user || !user.email) {
            return new Observable(observer => {
                observer.error(new Error('No hay usuario autenticado'));
                observer.complete();
            });
        }

        // 1. Crear credencial con la contraseña actual
        // Necesitamos importar EmailAuthProvider dynamica o estaticamente.
        // Usaremos import dinamico para evitar conflictos si no esta importado arriba
        const credential = import('firebase/auth').then(m =>
            m.EmailAuthProvider.credential(user.email!, currentPassword)
        );

        return from(credential).pipe(
            // 2. Re-autenticar (Obligatorio por seguridad)
            switchMap(cred => from(import('firebase/auth').then(m => m.reauthenticateWithCredential(user, cred)))),
            // 3. Actualizar contraseña
            switchMap(() => from(import('firebase/auth').then(m => m.updatePassword(user, newPassword))))
        );
    }
}
