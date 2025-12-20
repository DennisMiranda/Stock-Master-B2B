import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { LucideAngularModule } from 'lucide-angular';

// ✅ Íconos de marcas (redes sociales) desde Simple Icons
import { siFacebook, siInstagram, siX } from 'simple-icons';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  email = '';
  mensaje = '';
  cargando = false;

  constructor(private http: HttpClient) {}

  // SVGs puros de Simple Icons (logos de redes sociales)
  icons = {
    facebook: siFacebook.svg,
    instagram: siInstagram.svg,
    x: siX.svg
  };
}