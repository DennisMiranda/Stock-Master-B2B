import { Component, signal, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, Menu, X, ShoppingCart, User, Search, LogOut } from 'lucide-angular';
import { AuthService } from '../../../core/auth/auth.service';
import { LayoutService } from '../../../core/services/layout.service';


@Component({
  selector: 'app-header',
  imports: [LucideAngularModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  //inject obtiene instancia del authService para poder acceder a sus metodos y propiedades y lo asigna a la variable authService
  private authService = inject(AuthService);
  //inject obtiene instancia del layoutService para poder acceder a sus metodos y propiedades y lo asigna a la variable layoutService
  layoutService = inject(LayoutService);
  //currentUser es una variable que obtiene el usuario actual
  currentUser = this.authService.currentUser;

  readonly MenuIcon = Menu;
  readonly XIcon = X;
  readonly ShoppingCartIcon = ShoppingCart;
  readonly UserIcon = User;
  readonly SearchIcon = Search;
  //readonly LogOutIcon es una variable que contiene el icono de cerrar sesión
  readonly LogOutIcon = LogOut;


  isMenuOpen = signal(false);
  isSearchOpen = signal(false);
  cartCount = signal(3);

  navLinks = [
    { path: '/shop/home', label: 'Inicio' },
    { path: '/shop/catalog', label: 'Catalogo' },
  ];

  toggleMenu() {
    this.isMenuOpen.update(value => !value);
    if (this.isMenuOpen()) {
      this.isSearchOpen.set(false);
    }
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }

  toggleSearch() {
    this.isSearchOpen.update(value => !value);
    if (this.isSearchOpen()) {
      this.isMenuOpen.set(false);
    }
  }

  //logout es una funcion que se ejecuta cuando se cierre el modal
  logout() {
    this.authService.logout().subscribe();
  }
}
