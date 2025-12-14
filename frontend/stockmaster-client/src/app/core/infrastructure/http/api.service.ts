import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { catchError, throwError } from 'rxjs';
import { firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private http = inject(HttpClient);
    // Corregimos para que coincida con environment.ts (apiURL)
    private apiUrl = (environment as any).apiURL || 'http://localhost:3000/api';

    /**
     * Realiza una petición POST
     * @param path Ruta del endpoint (ej: '/auth/register')
     * @param body Datos a enviar
     * @returns Promise con la respuesta
     */
    async post<T>(path: string, body: any): Promise<T> {
        const url = `${this.apiUrl}${path}`;

        // Convertimos el Observable a Promise para usar async/await moderno
        return await firstValueFrom(
            this.http.post<T>(url, body).pipe(
                catchError(this.handleError)
            )
        );
    }

    private handleError(error: HttpErrorResponse) {
        let errorMessage = 'Error desconocido';
        if (error.error instanceof ErrorEvent) {
            // Error del lado del cliente
            errorMessage = error.error.message;
        } else {
            // Error del lado del servidor
            // Intentamos extraer el mensaje del backend si existe (ej: { message: '...' })
            errorMessage = error.error?.message || `Código de error: ${error.status}`;
        }
        console.error('API Error:', errorMessage);
        return throwError(() => new Error(errorMessage));
    }
}
