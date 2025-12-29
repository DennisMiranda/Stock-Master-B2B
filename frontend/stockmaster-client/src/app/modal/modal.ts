import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, X } from 'lucide-angular';
import { ModalService } from './modal.service';
import { inject } from '@angular/core';

interface FAQ {
  question: string;
  answer: string;
  isOpen: boolean;
}

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal implements OnInit, OnDestroy {
  
  readonly X = X;
  modalService = inject(ModalService);

  // FAQ Data
  faqs: FAQ[] = [
    {
      question: '¿Qué es Stock Master B2B?',
      answer: 'Stock Master B2B es una plataforma integral de gestión de inventario y operaciones B2B diseñada para optimizar procesos empresariales.',
      isOpen: false
    },
    {
      question: '¿Cómo creo una cuenta?',
      answer: 'Haga clic en "Registrarse", complete el formulario con su información de empresa y contacto, verifique su email, y estará listo para comenzar.',
      isOpen: false
    },
    {
      question: '¿Ofrecen período de prueba gratuito?',
      answer: 'Sí, ofrecemos un período de prueba gratuito de 14 días con acceso completo a todas las funcionalidades. No se requiere tarjeta de crédito.',
      isOpen: false
    },
    {
      question: '¿Cuántos productos puedo gestionar?',
      answer: 'Depende de su plan: Básico hasta 1,000 productos, Profesional hasta 10,000, y Empresarial productos ilimitados.',
      isOpen: false
    },
    {
      question: '¿Qué métodos de pago aceptan?',
      answer: 'Aceptamos tarjetas de crédito/débito (Visa, Mastercard, Amex), transferencias bancarias y PayPal.',
      isOpen: false
    },
    {
      question: '¿Es accesible desde dispositivos móviles?',
      answer: 'Sí, es completamente responsivo y también ofrecemos aplicaciones nativas para iOS y Android.',
      isOpen: false
    },
    {
      question: '¿Cómo protegen mis datos?',
      answer: 'Implementamos encriptación SSL/TLS, autenticación 2FA, copias de seguridad diarias y cumplimos con estándares SOC 2 e ISO 27001.',
      isOpen: false
    },
    {
      question: '¿Puedo cancelar mi suscripción?',
      answer: 'Sí, puede cancelar en cualquier momento sin penalizaciones. La cancelación tiene efecto al final de su período de facturación actual.',
      isOpen: false
    }
  ];

  ngOnInit(): void {
    document.addEventListener('keydown', this.onKeyDown.bind(this));
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.onKeyDown.bind(this));
  }

  closeModal(): void {
    this.modalService.close();
  }

  toggleFaq(faq: FAQ): void {
    faq.isOpen = !faq.isOpen;
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeModal();
    }
  }
}
