import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LayoutService {
    //signal es una variable reactiva que se puede observar, en un inicio esta en false y cambiara a true cuando se abra el modal en el componente user-layout
    showLoginModal = signal(false);
    showRegisterModal = signal(false);

    //openLogin es una funcion que se ejecuta cuando se abra el modal de login
    openLogin() {
        this.showRegisterModal.set(false);
        this.showLoginModal.set(true);
    }
    //openRegister es una funcion que se ejecuta cuando se abra el modal de registro
    openRegister() {
        this.showLoginModal.set(false);
        this.showRegisterModal.set(true);
    }

    //closeAuth es una funcion que se ejecuta cuando se cierre el modal
    closeAuth() {
        this.showLoginModal.set(false);
        this.showRegisterModal.set(false);
    }

    // ===== Sidebar Mobile/Tablet State =====
    isSidebarOpen = signal(false);

    toggleSidebar() {
        this.isSidebarOpen.update(v => !v);
    }

    closeSidebar() {
        this.isSidebarOpen.set(false);
    }
}
