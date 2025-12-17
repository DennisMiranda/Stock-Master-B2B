import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './profile.html'
})
export class Profile {
    private authService = inject(AuthService);
    private router = inject(Router);

    logout() {
        this.authService.logout().subscribe({
            next: () => this.router.navigate(['/shop/home'])
        });
    }
}
