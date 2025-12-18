import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
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
    isLoading = signal<boolean>(false);
    error = signal<string | null>(null);

    constructor() {
        // Escuchar cambios de sesión
        onAuthStateChanged(this.auth, (user) => {
            this.currentUser.set(user);
        });
    }

    // --- Login con Email ---
    loginWithEmail(email: string, password: string): Observable<void> {
        this.isLoading.set(true);
        return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
            tap(() => {
                this.isLoading.set(false);
                this.router.navigate(['/shop/home']);
            }),
            map(() => void 0), // Explicitly return void
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
                // Usamos ApiService para sincronizar
                return this.apiService.post<{ success: boolean }>('/auth/sync', { uid, email, displayName, photoURL });
            }),
            tap(() => {
                this.isLoading.set(false);
                this.router.navigate(['/shop/home']);
            }),
            map(() => void 0), // Normalize return to void
            catchError((err) => {
                this.isLoading.set(false);
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
            tap(() => {
                this.isLoading.set(false);
                this.router.navigate(['/shop/home']);
            }),
            map(() => void 0), // Normalize return to void
            catchError((err) => {
                this.isLoading.set(false);
                // Extraer mensaje de error personalizado del Backend si existe
                const errorMessage = err.error?.error || err.error?.message || 'Error en el registro';
                this.error.set(errorMessage);
                throw err;
            })
        );
    }

    // --- Logout ---
    logout() {
        return from(signOut(this.auth)).pipe(
            tap(() => {
                this.currentUser.set(null);
                this.router.navigate(['/auth/login']);
            })
        );
    }
}
