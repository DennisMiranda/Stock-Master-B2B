import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import emailjs from '@emailjs/browser';
import { ModalService } from '../modal/modal.service';
import { environment } from '../../environments/environment';
import { LucideAngularModule, Mail, Phone, MapPin, Send, ChevronRight } from 'lucide-angular';
import { firstValueFrom } from 'rxjs';

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
  isLoading = false;

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

    // Validar correo
    if (!email || !this.validateEmail(email)) {
      this.newsletterMessage = '❌ Por favor, ingresa un correo válido.';
      return;
    }

    this.isLoading = true;
    this.newsletterMessage = '';

    try {
      // 1️⃣ Enviar correo con EmailJS (solo si no es duplicado)
      const response: any = await firstValueFrom(this.http.post(`${environment.apiURL}/newsletter`, { email }));


      if (response.duplicate) {
        // ⚠️ Correo ya suscrito
       this.modalService.openNewsletterDuplicate();
      } else {
        // ✅ Correo nuevo — enviar notificación y mostrar éxito
        await emailjs.send(
          environment.emailjs.serviceId,
          environment.emailjs.templateId,
          { email },
          environment.emailjs.publicKey
        );

        this.modalService.openNewsletterSuccess();
      }

      // Limpieza controlada
      setTimeout(() => {
        this.newsletterEmail = '';
      }, 0);

    } catch (error) {
      console.error('Error en la suscripción:', error);
      this.newsletterMessage = '⚠️ Error al procesar la suscripción.';
    } finally {
      setTimeout(() => { this.isLoading = false; }, 0);
    }
  }

  validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  openModal(action: string): void {
    if (action === 'terms') this.modalService.openTerms();
    else if (action === 'faq') this.modalService.openFaq();
    else if (action === 'about') this.modalService.openAbout();
  }
}
