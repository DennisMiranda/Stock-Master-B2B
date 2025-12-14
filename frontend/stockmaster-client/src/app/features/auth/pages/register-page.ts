import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { RegisterForm } from '../../../shared/auth/register-form/register-form';
import { AuthRepositoryImpl } from '../../../core/infrastructure/repositories/auth.repository.impl'; // Importamos Implementación (o token de inyección si usáramos DI estricto)

@Component({
    selector: 'app-register-page',
    standalone: true,
    imports: [RegisterForm],
    templateUrl: './register-page.html',
    styleUrl: './register-page.css'
})
export class RegisterPage {
    // Inyectamos el Repositorio en lugar del Service
    private authRepository = inject(AuthRepositoryImpl);
    private router = inject(Router);

    readonly email = signal('');
    readonly password = signal('');
    readonly ruc = signal('');
    readonly companyName = signal('');
    readonly contactName = signal('');

    readonly isLoading = signal(false);
    readonly errorMessage = signal('');

    async onRegister() {
        this.isLoading.set(true);
        this.errorMessage.set('');
        try {
            await this.authRepository.register({
                email: this.email(),
                password: this.password(),
                ruc: this.ruc(),
                companyName: this.companyName(),
                contactName: this.contactName()
            });
            // Redirigir al home o a una página de "Pendiente de Aprobación"
            this.router.navigate(['/home']);
        } catch (error: any) {
            this.errorMessage.set(error.message || 'Error al registrar usuario');
        } finally {
            this.isLoading.set(false);
        }
    }
}
