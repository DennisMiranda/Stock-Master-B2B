import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../http/api.service';
import { User } from '../models/auth.model';
import { finalize, tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private api = inject(ApiService);

    // State (Signals)
    users = signal<User[]>([]);
    isLoading = signal<boolean>(false);

    loadUsers() {
        this.isLoading.set(true);
        // Nota: La ruta backend es /v1/api/users, pero ApiService ya añade la base si está configurado.
        // Asumiendo ApiService concatena environment.apiUrl
        this.api.get<User[]>('/users')
            .pipe(
                finalize(() => this.isLoading.set(false))
            )
            .subscribe({
                next: (response) => this.users.set(response.data || []),
                error: (err) => console.error('Error loading users:', err)
            });
    }

    updateUser(uid: string, data: Partial<User>) {
        return this.api.put<User>(`/users/${uid}`, data)
            .subscribe({
                next: (response) => {
                    if (response.success && response.data) {
                        this.users.update(current =>
                            current.map(u => u.uid === uid ? { ...u, ...data } : u)
                        );
                    }
                },
                error: (err) => console.error('Error updating user:', err)
            });
    }

    createUser(data: any) {
        return this.api.post<User>('/users', data).pipe(
            tap((response) => {
                if (response.success && response.data) {
                    this.users.update(current => [...current, response.data!]);
                }
            })
        );
    }
}

