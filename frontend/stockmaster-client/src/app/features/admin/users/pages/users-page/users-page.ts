import { Component, computed, inject, OnInit, signal, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Plus, MoreHorizontal, Check, X } from 'lucide-angular';
import { UserService } from '../../../../../core/services/user.service';
import { AuthService } from '../../../../../core/auth/auth.service';
import { SearchInput } from '../../../../../shared/ui/inputs/search-input/search-input';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, map, startWith } from 'rxjs/operators';
import { User } from '../../../../../core/models/auth.model';
import { UserEditModal } from '../../components/user-edit-modal/user-edit-modal';
import { UserCreateModal } from '../../components/user-create-modal/user-create-modal';
import { UserActionsMenu } from '../../components/user-actions-menu/user-actions-menu';
import { DataTableComponent } from '../../../../../shared/ui/data-table/data-table.component';
import { TableColumn, SortEvent } from '../../../../../shared/ui/data-table/models/table.model';
import { ToastService } from '../../../../../core/services/toast.service';
import { ConfirmationModalComponent } from '../../../../../shared/ui/confirmation-modal/confirmation-modal.component';

@Component({
    selector: 'app-users-page',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        LucideAngularModule,
        SearchInput,
        UserEditModal,
        UserCreateModal,
        UserActionsMenu,
        DataTableComponent,
        ConfirmationModalComponent
    ],
    templateUrl: './users-page.html',
    styleUrl: './users-page.css'
})
export class UsersPage implements OnInit, AfterViewInit {
    private userService = inject(UserService);
    private authService = inject(AuthService);
    private toast = inject(ToastService);

    users = this.userService.users;
    isLoading = this.userService.isLoading;

    searchControl = new FormControl('');
    searchTerm = toSignal(
        this.searchControl.valueChanges.pipe(
            startWith(''),
            debounceTime(300),
            map(term => term?.toLowerCase() || '')
        ),
        { initialValue: '' }
    );

    filteredUsers = computed(() => {
        const term = this.searchTerm();
        const list = this.users();

        if (!term) return list;

        return list.filter((user: User) =>
            user.displayName?.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term) ||
            user.role.toLowerCase().includes(term)
        );
    });

    totalUsers = computed(() => this.users().length);
    activeUsersCount = computed(() => this.users().filter((u: User) => u.isActive).length);

    // Icons
    readonly PlusIcon = Plus;
    readonly MoreIcon = MoreHorizontal;
    readonly SearchIcon = Search;
    readonly CheckIcon = Check;
    readonly XIcon = X;

    // Edit Logic (Simplified)
    selectedUser = signal<User | null>(null);
    isSaving = signal(false);

    // Create Logic
    isCreating = signal(false);

    // Reset Password Logic
    @ViewChild('confirmModal') confirmModal!: ConfirmationModalComponent;
    userToReset: User | null = null;

    // Table Columns Configuration
    columns: TableColumn<User>[] = [];

    // Templates References
    @ViewChild('userTemplate') userTemplate!: TemplateRef<any>;
    @ViewChild('roleTemplate') roleTemplate!: TemplateRef<any>;
    @ViewChild('statusTemplate') statusTemplate!: TemplateRef<any>;
    @ViewChild('actionsTemplate') actionsTemplate!: TemplateRef<any>;

    ngOnInit() {
        this.userService.loadUsers();
    }

    ngAfterViewInit() {
        // Initialize columns AFTER views are initialized (so Templates are available)
        setTimeout(() => {
            this.columns = [
                { key: 'displayName', label: 'Usuario', template: this.userTemplate, sortable: true },
                { key: 'role', label: 'Rol', template: this.roleTemplate, sortable: true },
                { key: 'isActive', label: 'Estado', template: this.statusTemplate, sortable: true },
                { key: 'actions', label: 'Acciones', template: this.actionsTemplate }
            ];
        });
    }

    onSort(event: SortEvent) {
        console.log('Sort triggered:', event);
        // Implement sorting logic here if needed, or leave it client-side if data is small
    }

    // --- Create User ---
    openCreateModal() {
        this.isCreating.set(true);
    }

    closeCreateModal() {
        this.isCreating.set(false);
    }

    onCreate(data: any) {
        this.isSaving.set(true);
        this.userService.createUser(data).subscribe({
            next: () => {
                this.isSaving.set(false);
                this.closeCreateModal();
                this.toast.success('Usuario creado exitosamente');
            },
            error: (err) => {
                this.isSaving.set(false);
                this.toast.error('Error al crear usuario: ' + (err.error?.message || err.message));
            }
        });
    }

    // --- Edit User ---
    onEdit(user: User) {
        this.selectedUser.set(user);
    }

    closeEditModal() {
        this.selectedUser.set(null);
    }

    onSave(data: { uid: string, role: User['role'], isActive: boolean }) {
        this.isSaving.set(true);
        this.userService.updateUser(data.uid, {
            role: data.role,
            isActive: data.isActive
        }).add(() => {
            this.isSaving.set(false);
            this.closeEditModal();
            this.toast.success('Usuario actualizado correctamente');
        });
    }

    // --- Reset Password ---
    onResetPassword(user: User) {
        this.userToReset = user;
        this.confirmModal.open();
    }

    onConfirmResetPassword() {
        if (!this.userToReset) return;

        this.authService.sendPasswordResetEmail(this.userToReset.email).subscribe({
            next: () => {
                this.toast.success(`Correo enviado a ${this.userToReset?.email}`);
                this.userToReset = null;
            },
            error: (err) => {
                this.toast.error('Error al enviar correo: ' + err.message);
                this.userToReset = null;
            }
        });
    }

    getRoleBadgeColor(role: string): string {
        switch (role) {
            case 'admin': return 'bg-blue-100 text-blue-700';
            case 'warehouse': return 'bg-orange-100 text-orange-700';
            case 'driver': return 'bg-indigo-100 text-indigo-700';
            case 'client': return 'bg-emerald-100 text-emerald-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    }

    getRoleLabel(role: string): string {
        const labels: Record<string, string> = {
            'admin': 'Administrador',
            'warehouse': 'Almacenero',
            'driver': 'Conductor',
            'client': 'Cliente'
        };
        return labels[role] || role;
    }
}
