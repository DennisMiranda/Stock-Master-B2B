import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import {
  ChevronDown,
  FileText,
  LogOut,
  LucideAngularModule,
  Menu,
  Search,
  Settings,
  ShoppingCart,
  User,
  X,
} from 'lucide-angular';
import { AuthService } from '../../../core/auth/auth.service';
import { LayoutService } from '../../../core/services/layout.service';
import { CartPage } from '../../../features/user/cart/pages/cart-page/cart-page';
import { CartService } from '../../../features/user/cart/services/cart.service';

@Component({
  selector: 'app-header',
  imports: [LucideAngularModule, RouterLink, RouterLinkActive, CartPage],

  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  readonly MenuIcon = Menu;
  readonly XIcon = X;
  readonly ShoppingCartIcon = ShoppingCart;
  readonly UserIcon = User;
  readonly SearchIcon = Search;
  readonly LogOutIcon = LogOut;
  readonly OrderIcon = FileText;
  cartService = inject(CartService);
  //inject obtiene instancia del authService para poder acceder a sus metodos y propiedades y lo asigna a la variable authService
  private authService = inject(AuthService);
  //inject obtiene instancia del layoutService para poder acceder a sus metodos y propiedades y lo asigna a la variable layoutService
  layoutService = inject(LayoutService);
  //currentUser es una variable que obtiene el usuario actual
  currentUser = this.authService.currentUser;
  userRole = this.authService.userRole;

  showCartModal = signal(false);

  isUserMenuOpen = signal(false);
  isMenuOpen = signal(false);
  isSearchOpen = signal(false);
  cartCount = this.cartService.cartCount;

  navLinks = [
    { path: '/shop/home', label: 'Inicio' },
    { path: '/shop/catalog', label: 'Catálogo' },
  ];

  displayName = computed(() => {
    const user = this.currentUser();
    return user?.displayName || user?.email || 'Usuario';
  });

  displayRole = computed(() => {
    const role = this.userRole();
    if (!role) return 'Usuario';
    const roles: Record<string, string> = {
      admin: 'Administrador',
      warehouse: 'Almacenero',
      driver: 'Conductor',
      client: 'Cliente',
    };
    return roles[role] || role;
  });

  isOpen = signal(false);

  readonly SettingsIcon = Settings;
  readonly ChevronDownIcon = ChevronDown;

  openCart() {
    this.showCartModal.set(true);
  }

  closeCart() {
    this.showCartModal.set(false);
  }

  toggleUserMenu() {
    this.isUserMenuOpen.update((value) => !value);
  }

  toggleMenu() {
    this.isMenuOpen.update((value) => !value);
    if (this.isMenuOpen()) {
      this.isSearchOpen.set(false);
    }
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }

  toggleSearch() {
    this.isSearchOpen.update((value) => !value);
    if (this.isSearchOpen()) {
      this.isMenuOpen.set(false);
    }
  }

  logout() {
    this.authService.logout().subscribe();
  }
}
