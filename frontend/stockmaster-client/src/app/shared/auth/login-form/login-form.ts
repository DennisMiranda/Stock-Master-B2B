import { Component, model, output, input } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-login-form',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './login-form.html',
    styleUrl: './login-form.css'
})
export class LoginForm {
    // Signals para Inputs (Two-way binding con model)
    readonly email = model<string>('');
    readonly password = model<string>('');

    // Signal para estado de carga
    readonly isLoading = input<boolean>(false);

    // Output events
    readonly login = output<void>();
    readonly googleLogin = output<void>();

    onSubmit() {
        if (this.email() && this.password()) {
            this.login.emit();
        }
    }
}
