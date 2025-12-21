import { Component, inject, effect } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { LucideAngularModule, Loader2 } from 'lucide-angular';

@Component({
    selector: 'app-startup',
    standalone: true,
    imports: [LucideAngularModule],
    template: `
    <div class="h-screen w-full flex flex-col items-center justify-center bg-white">
      <lucide-icon [img]="LoaderIcon" class="w-10 h-10 animate-spin text-blue-600"></lucide-icon>
      <p class="mt-4 text-sm text-gray-500 font-medium tracking-wide animate-pulse">
        Iniciando StockMaster...
      </p>
    </div>
  `
})
export class StartupComponent {
    private authService = inject(AuthService);
    private router = inject(Router);

    readonly LoaderIcon = Loader2;

    constructor() {
        effect(() => {
            // 1. Wait for Auth to be initialized (Firebase check done)
            if (this.authService.authInitialized()) {
                const role = this.authService.userRole();

                // 2. Redirect Logic
                if (role && ['admin', 'warehouse', 'driver'].includes(role)) {
                    // Staff -> Dashboard
                    this.router.navigate(['/admin'], { replaceUrl: true });
                } else {
                    // Client/Guest -> Shop Home
                    this.router.navigate(['/shop/home'], { replaceUrl: true });
                }
            }
        });
    }
}
