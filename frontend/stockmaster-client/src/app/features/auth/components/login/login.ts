import { Component, inject, signal, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Mail, Lock } from 'lucide-angular';
import { AuthService } from '../../../../core/auth/auth.service';
import { LayoutService } from '../../../../core/services/layout.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);
  private layoutService = inject(LayoutService);

  @Input() isModal = false;
  @Output() changeMode = new EventEmitter<void>();

  readonly MailIcon = Mail;
  readonly LockIcon = Lock;

  email = signal('');
  password = signal('');

  isLoading = this.authService.isLoading;
  errorMessage = this.authService.error;

  onLogin() {
    this.authService.loginWithEmail(this.email(), this.password()).subscribe({
      next: () => {
        if (this.isModal) {
          this.layoutService.closeAuth();
        }
      }
    });
  }

  onGoogleLogin() {
    this.authService.loginWithGoogle().subscribe({
      next: () => {
        if (this.isModal) {
          this.layoutService.closeAuth();
        }
      },
      error: (e: any) => {
        if (e.code === 'auth/popup-closed-by-user') {
          console.log('[Login] Usuario cerró la ventana de Google');
        } else {
          console.error('Error Google Login', e);
        }
      }
    });
  }

  onForgotPassword() {
    if (!this.email()) {
      this.errorMessage.set('Por favor, ingresa tu correo electrónico primero.');
      return;
    }

    this.isLoading.set(true);
    this.authService.sendPasswordResetEmail(this.email()).subscribe({
      next: () => {
        console.log('[Login] Solicitud de restablecimiento enviada exitosamente a:', this.email());
        this.isLoading.set(false);
        alert('¡Correo enviado! Revisa tu bandeja de entrada para restablecer tu contraseña. (Revisa Spam)');
        this.errorMessage.set(null);
      },
      error: (err) => {
        console.error('[Login] Error enviando correo:', err);
        this.isLoading.set(false);
        this.errorMessage.set('Error: ' + err.message);
      }
    });
  }
}
