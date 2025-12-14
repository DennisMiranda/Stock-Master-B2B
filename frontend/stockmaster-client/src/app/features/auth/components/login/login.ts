import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthRepositoryImpl } from '../../../../core/infrastructure/repositories/auth.repository.impl';
import { LoginForm } from '../../../../shared/auth/login-form/login-form';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [LoginForm],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  // Inyección de dependencias
  private authRepository = inject(AuthRepositoryImpl);
  private router = inject(Router);

  // Signals para manejar el estado local del formulario
  readonly email = signal('');
  readonly password = signal('');
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  // Manejador de Login con Email
  async onLogin() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    try {
      await this.authRepository.login({ email: this.email(), password: this.password() });
      // Redirigir al home o dashboard tras login exitoso
      this.router.navigate(['/home']);
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Error al iniciar sesión');
    } finally {
      this.isLoading.set(false);
    }
  }

  // Manejador de Login con Google
  async onGoogleLogin() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    try {
      await this.authRepository.loginWithGoogle();
      this.router.navigate(['/home']);
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Error al iniciar sesión con Google');
    } finally {
      this.isLoading.set(false);
    }
  }
}
