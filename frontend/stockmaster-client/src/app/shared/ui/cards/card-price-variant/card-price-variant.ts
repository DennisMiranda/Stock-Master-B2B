import { Component, input, output, signal, computed, effect } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { LucideAngularModule, Package, Tag, Minus, Plus } from 'lucide-angular';
import type { Price, Discount } from '../../../../core/models/product.model';

@Component({
    selector: 'app-card-price-variant',
    standalone: true,
    imports: [CurrencyPipe, LucideAngularModule],
    templateUrl: './card-price-variant.html',
    styleUrl: './card-price-variant.css',
})
export class CardPriceVariant {
    // Inputs
    priceInfo = input.required<Price>();
    stock = input.required<number>();
    label = input.required<string>(); // 'unit' | 'box' | 'wholesale'
    unitPerBox = input<number>();
    baseUnitPrice = input<number>(0); // New Input: Reference for Box comparison
    initialQuantity = input<number>(0);

    // Outputs
    quantityChange = output<number>();

    // Icons
    readonly PackageIcon = Package;
    readonly TagIcon = Tag;
    readonly MinusIcon = Minus;
    readonly PlusIcon = Plus;

    // State
    quantity = signal(0);

    // Computed
    effectivePrice = computed(() => {
        const qty = this.quantity();
        return this.calculateEffectivePrice(this.priceInfo(), qty);
    });

    totalPrice = computed(() => {
        return this.effectivePrice() * this.quantity();
    });

    appliedDiscount = computed(() => {
        return this.getAppliedDiscount(this.priceInfo(), this.quantity());
    });

    displayLabel = computed(() => {
        if (this.label() === 'unit') return 'Unitario';
        if (this.label() === 'wholesale') return 'Mayorista';
        if (this.label() === 'box') return 'Por Caja';
        return this.label();
    });

    // UX: Explicit Savings (Unified Logic for Unit & Box)
    savingsPercentage = computed(() => {
        const currentPrice = this.effectivePrice();
        let referencePrice = this.priceInfo().price;

        // If Box, reference is Unit * UnitsPerBox
        if (this.label() === 'box' && this.unitPerBox() && this.baseUnitPrice() > 0) {
            referencePrice = this.baseUnitPrice() * this.unitPerBox()!;
        }

        if (!referencePrice || referencePrice <= currentPrice) return 0;
        return Math.round(((referencePrice - currentPrice) / referencePrice) * 100);
    });

    savingsAmount = computed(() => {
        const currentPrice = this.effectivePrice();
        let referencePrice = this.priceInfo().price;

        // If Box, reference is Unit * UnitsPerBox
        if (this.label() === 'box' && this.unitPerBox() && this.baseUnitPrice() > 0) {
            referencePrice = this.baseUnitPrice() * this.unitPerBox()!;
        }

        if (!referencePrice || referencePrice <= currentPrice) return 0;

        // Savings per item * quantity (if qty > 0), else show savings for 1 unit context
        // Logic check: User wants to see "Save X" even if qty=0? The previous logic used qty.
        // Let's stick to total savings if selected, or potential savings?
        // Current logic: (base - effective) * quantity. So only shows when selected.
        // But for "Box vs Unit" comparison badge, maybe we want to show it always?
        // Let's keep it consistent: calculated based on quantity for the "Total Savings" text at bottom.
        // But the BADGE (%) is unit agnostic.

        return (referencePrice - currentPrice) * (this.quantity() || 1);
        // CAUTION: If quantity is 0, we can't show "You save X on total".
        // The HTML condition `if (savingsAmount() > 0)` currently hides it.
        // Let's refine:
        // Badge % -> Always visible if diff exists.
        // Text "Ahorras..." -> Only visible if quantity > 0.
    });

    // Explicit separation for Text display
    currentTotalSavings = computed(() => {
        if (this.quantity() <= 0) return 0;

        const currentPrice = this.effectivePrice();
        let referencePrice = this.priceInfo().price;

        if (this.label() === 'box' && this.unitPerBox() && this.baseUnitPrice() > 0) {
            referencePrice = this.baseUnitPrice() * this.unitPerBox()!;
        }

        if (referencePrice <= currentPrice) return 0;
        return (referencePrice - currentPrice) * this.quantity();
    });

    constructor() {
        effect(() => {
            // Sync initial quantity input to internal signal
            this.quantity.set(this.initialQuantity());
        }, { allowSignalWrites: true });
    }

    // Actions
    increase() {
        if (this.quantity() < this.stock()) {
            this.updateQuantity(this.quantity() + 1);
        }
    }

    decrease() {
        if (this.quantity() > 0) {
            this.updateQuantity(this.quantity() - 1);
        }
    }

    onInput(event: Event) {
        const input = event.target as HTMLInputElement;
        let val = parseInt(input.value, 10);
        if (isNaN(val) || val < 0) val = 0;
        if (val > this.stock()) val = this.stock();

        this.updateQuantity(val);
        input.value = val.toString();
    }

    private updateQuantity(newQty: number) {
        this.quantity.set(newQty);
        this.quantityChange.emit(newQty);
    }

    // Helpers (Extracted from ModalCart)
    private calculateEffectivePrice(price: Price, quantity: number): number {
        if (!price.discounts || price.discounts.length === 0) {
            return price.price;
        }
        const sortedDiscounts = [...price.discounts].sort((a, b) => b.minQuantity - a.minQuantity);
        const discount = sortedDiscounts.find((d) => quantity >= d.minQuantity);
        return discount ? discount.price : price.price;
    }

    private getAppliedDiscount(price: Price, quantity: number): Discount | null {
        if (!price.discounts || price.discounts.length === 0) return null;
        const sortedDiscounts = [...price.discounts].sort((a, b) => b.minQuantity - a.minQuantity);
        return sortedDiscounts.find((d) => quantity >= d.minQuantity) || null;
    }
}
