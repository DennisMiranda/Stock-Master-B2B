import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

export const clientGuard: CanActivateFn = (route, state): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return toObservable(authService.authInitialized).pipe(
    filter(isInitialized => isInitialized),
    take(1),
    map(() => {
      const user = authService.currentUser();
      const role = authService.userRole();

      if (!user) {
        return router.createUrlTree(['/auth/login']);
      }

      if (role == 'client') {
        return true;
      }

      return router.createUrlTree(['/auth/login']);
    })
  );
};
