import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseAuthService } from '../../../core/infrastructure/auth/firebase-auth.service';

@Component({
    selector: 'app-home-page',
    standalone: true,
    imports: [],
    templateUrl: './home-page.html',
    styles: ``
})
export class HomePage {
    authService = inject(FirebaseAuthService);
    private router = inject(Router);

    async onLogout() {
        await this.authService.logout();
        this.router.navigate(['/login']);
    }
}
