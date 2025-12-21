import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
    return (route, state): Observable<boolean | UrlTree> => {
        const authService = inject(AuthService);
        const router = inject(Router);

        // Esperamos a que el servicio de Auth termine de cargar (usuario + claims)
        return toObservable(authService.authInitialized).pipe(
            filter(isInitialized => isInitialized), // Solo pasamos cuando sea true
            take(1), // Completamos el observable después del primer valor 'true'
            map(() => {
                const role = authService.userRole();
                const user = authService.currentUser();

                if (!user) {
                    return router.createUrlTree(['/auth/login']);
                }

                if (role && allowedRoles.includes(role)) {
                    return true;
                }

                // Rol no permitido
                if (role === 'client') {
                    return router.createUrlTree(['/shop/home']);
                }

                return router.createUrlTree(['/auth/login']);
            })
        );
    };
};
