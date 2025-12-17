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
          this.router.navigate(['/shop/home']);
        }
      }
    });
  }

  onGoogleLogin() {
    this.authService.loginWithGoogle().subscribe({
      next: () => {
        if (this.isModal) {
          this.layoutService.closeAuth();
          this.router.navigate(['/shop/home']);
        }
      }
    });
  }
}
