import { effect, inject, Injectable, signal } from '@angular/core';
import { finalize, tap } from 'rxjs/operators';
import { ApiService } from '../http/api.service';
import { User } from '../models/auth.model';

export interface UsersPaginatedResponse {
  users: User[];
  metadata: { count: number; pages: number };
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private api = inject(ApiService);

  // State (Signals)
  users = signal<User[]>([]);
  metadata = signal<UsersPaginatedResponse['metadata']>({ count: 0, pages: 0 });
  isLoading = signal<boolean>(false);
  page = signal(1);

  constructor() {
    effect(() => {
      this.loadUsers({ page: this.page(), limit: 10 });
    });
  }

  loadUsers(params: { page?: number; limit?: number } = { page: 1, limit: 10 }) {
    this.isLoading.set(true);
    // Nota: La ruta backend es /v1/api/users, pero ApiService ya añade la base si está configurado.
    // Asumiendo ApiService concatena environment.apiUrl
    this.api
      .get<UsersPaginatedResponse>('/users', { params })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.users.set(response.data?.users || []);
          this.metadata.set(response.data?.metadata || { count: 0, pages: 0 });
        },
        error: (err) => console.error('Error loading users:', err),
      });
  }

  updateUser(uid: string, data: Partial<User>) {
    return this.api.put<User>(`/users/${uid}`, data).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.users.update((current) =>
            current.map((u) => (u.uid === uid ? { ...u, ...data } : u))
          );
        }
      },
      error: (err) => console.error('Error updating user:', err),
    });
  }

  createUser(data: any) {
    return this.api.post<User>('/users', data).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.users.update((current) => [...current, response.data!]);
        }
      })
    );
  }
}
