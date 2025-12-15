import { Component,signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, Menu, X, ShoppingCart, User, Search } from 'lucide-angular';


@Component({
  selector: 'app-header',
  imports: [LucideAngularModule,RouterLink,RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {

  readonly MenuIcon = Menu;
  readonly XIcon = X;
  readonly ShoppingCartIcon = ShoppingCart;
  readonly UserIcon = User;
  readonly SearchIcon = Search;


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
}
