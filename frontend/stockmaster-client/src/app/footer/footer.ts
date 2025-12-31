import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import emailjs from '@emailjs/browser';
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

  newsletterEmail = '';
  newsletterMessage = ''; // mensaje visual para el usuario

  constructor(private http: HttpClient) {}

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

  /**
   * Envía el correo al servicio EmailJS y al endpoint del backend
   */
  async onSubmitNewsletter(event: Event) {
    event.preventDefault();

    const email = this.newsletterEmail.trim();
    if (!email || !this.validateEmail(email)) {
      this.newsletterMessage = '❌ Por favor, ingresa un correo válido.';
      return;
    }

    try {
      // 1️⃣ Envía un correo de notificación con EmailJS (opcional)
      await emailjs.send(
        'service_stockmaster',      // ID del servicio en EmailJS
        'template_newsletter',      // ID de la plantilla
        { email: this.newsletterEmail }, // parámetros de la plantilla
        'PUBLIC_KEY_EMAILJS'        // tu clave pública
      );

      // 2️⃣ Envía al backend (para guardar en Firestore)
      await this.http.post('https://tu-servidor.com/api/newsletter', { email }).toPromise();

      this.newsletterMessage = '🎉 ¡Gracias por suscribirte al newsletter!';
      this.newsletterEmail = '';
    } catch (error) {
      console.error('Error en la suscripción:', error);
      this.newsletterMessage = '⚠️ Error al procesar la suscripción.';
    }
  }

  validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /*onSubmitNewsletter(event: Event) {
    event.preventDefault();
    if (this.newsletterEmail) {
      console.log('Suscripción:', this.newsletterEmail);
      // Aquí iría la lógica de suscripción
      this.newsletterEmail = '';
    }
  }*/

  openModal(action: string): void {
    if (action === 'terms') this.modalService.openTerms();
    else if (action === 'faq') this.modalService.openFaq();
    else if (action === 'about') this.modalService.openAbout();
  }
}
