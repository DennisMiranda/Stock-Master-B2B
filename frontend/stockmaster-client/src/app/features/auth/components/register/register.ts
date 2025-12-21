import { Component, inject, signal, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Mail, Lock, Building2, User } from 'lucide-angular';
import { AuthService } from '../../../../core/auth/auth.service';
import { LayoutService } from '../../../../core/services/layout.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private authService = inject(AuthService);
  private router = inject(Router);
  private layoutService = inject(LayoutService);

  @Input() isModal = false;
  @Output() changeMode = new EventEmitter<void>();

  readonly MailIcon = Mail;
  readonly LockIcon = Lock;
  readonly BuildingIcon = Building2;
  readonly UserIcon = User;

  // Form State using Signals
  email = signal('');
  password = signal('');
  ruc = signal('');
  companyName = signal('');
  contactName = signal('');

  isLoading = this.authService.isLoading;
  errorMessage = this.authService.error;

  onRegister() {
    this.authService.registerB2B({
      email: this.email(),
      password: this.password(),
      ruc: this.ruc(),
      companyName: this.companyName(),
      contactName: this.contactName()
    }).subscribe({
      next: () => {
        if (this.isModal) {
          this.layoutService.closeAuth();
        }
      }
    });
  }
}
