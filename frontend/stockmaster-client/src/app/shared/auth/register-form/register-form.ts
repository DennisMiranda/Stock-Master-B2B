import { Component, model, output, input } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-register-form',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './register-form.html',
    styleUrl: './register-form.css'
})
export class RegisterForm {
    readonly email = model<string>('');
    readonly password = model<string>('');

    // Nuevos campos B2B
    readonly ruc = model<string>('');
    readonly companyName = model<string>('');
    readonly contactName = model<string>('');

    readonly isLoading = input<boolean>(false);
    readonly register = output<void>();

    onSubmit() {
        if (this.email() && this.password() && this.ruc() && this.companyName()) {
            this.register.emit();
        }
    }
}
