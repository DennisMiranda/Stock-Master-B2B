import { Component,signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink,RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
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
