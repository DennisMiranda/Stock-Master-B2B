import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { inject } from '@angular/core';
import { ModalService } from '../modal/modal.service';
import { LucideAngularModule, Mail, Phone, MapPin, Send, ChevronRight } from 'lucide-angular';
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {
  // Iconos de Lucide
  readonly Mail = Mail;
  readonly Phone = Phone;
  readonly MapPin = MapPin;
  readonly Send = Send;
  readonly ChevronRight = ChevronRight;

  modalService = inject(ModalService);
  currentYear = new Date().getFullYear();

  // Enlaces de navegación
  quickLinks = [
    { label: 'Inicio', route: '/' },
    { label: 'Productos', route: '/shop/catalog' },    
    { label: 'Sobre Nosotros', action: 'about' },
  ];

  legalLinks = [
    { label: 'Términos y Condiciones', action: 'terms' },
    { label: 'FAQ', action: 'faq' },
  ];

  contactInfo = [
    { icon: this.Mail, text: 'legal@stockmaster.com', type: 'email' },
    { icon: this.Phone, text: '+51 924932128', type: 'phone' },
    { icon: this.MapPin, text: '123 Calle Principal, Lima, Perú', type: 'address' }
  ];

  newsletterEmail = '';

  onSubmitNewsletter(event: Event) {
    event.preventDefault();
    if (this.newsletterEmail) {
      console.log('Suscripción:', this.newsletterEmail);
      // Aquí iría la lógica de suscripción
      this.newsletterEmail = '';
    }
  }

  openModal(action: string): void {
    if (action === 'terms') this.modalService.openTerms();
    else if (action === 'faq') this.modalService.openFaq();
    else if (action === 'about') this.modalService.openAbout();
  }
}
