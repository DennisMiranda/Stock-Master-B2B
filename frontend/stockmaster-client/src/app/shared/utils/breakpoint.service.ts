import { Injectable, signal } from '@angular/core';

/**
 * Servicio reactivo para detectar breakpoints usando Signals.
 * Compatible con Angular 21+ y diseñado para SSR (verifica window).
 */
@Injectable({ providedIn: 'root' })
export class BreakpointService {
    private readonly MOBILE_BREAKPOINT = 768;
    private readonly TABLET_BREAKPOINT = 1024;

    /** Signal reactivo: true si el viewport es móvil (<768px) */
    readonly isMobile = signal(this.checkMobile());

    /** Signal reactivo: true si el viewport es tablet (768-1024px) */
    readonly isTablet = signal(this.checkTablet());

    /** Signal reactivo: true si el viewport es desktop (>1024px) */
    readonly isDesktop = signal(this.checkDesktop());

    constructor() {
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', () => this.updateBreakpoints());
        }
    }

    private checkMobile(): boolean {
        if (typeof window === 'undefined') return false;
        return window.innerWidth < this.MOBILE_BREAKPOINT;
    }

    private checkTablet(): boolean {
        if (typeof window === 'undefined') return false;
        return window.innerWidth >= this.MOBILE_BREAKPOINT && window.innerWidth < this.TABLET_BREAKPOINT;
    }

    private checkDesktop(): boolean {
        if (typeof window === 'undefined') return true;
        return window.innerWidth >= this.TABLET_BREAKPOINT;
    }

    private updateBreakpoints(): void {
        this.isMobile.set(this.checkMobile());
        this.isTablet.set(this.checkTablet());
        this.isDesktop.set(this.checkDesktop());
    }
}
