import { Injectable, signal } from '@angular/core';

export type ModalType = 'terms' | 'faq' | 'about' | 'newsletter-success' | 'newsletter-duplicate' |null;

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private activeModal = signal<ModalType>(null);

  get currentModal() {
    return this.activeModal.asReadonly();
  }

  openTerms(): void {
    this.activeModal.set('terms');
    document.body.style.overflow = 'hidden';
  }

  openFaq(): void {
    this.activeModal.set('faq');
    document.body.style.overflow = 'hidden';
  }

  openAbout(): void {
    this.activeModal.set('about');
    document.body.style.overflow = 'hidden';
  }  

  openNewsletterSuccess(): void {
  this.activeModal.set('newsletter-success');
  document.body.style.overflow = 'hidden';
  }

  openNewsletterDuplicate(): void {
  this.activeModal.set('newsletter-duplicate');
  document.body.style.overflow = 'hidden';
  }

  close(): void {
    this.activeModal.set(null);
    document.body.style.overflow = '';
  }
}