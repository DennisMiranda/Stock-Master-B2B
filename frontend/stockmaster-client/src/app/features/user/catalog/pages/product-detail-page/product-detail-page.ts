import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideAngularModule, ShoppingCart, Truck, ShieldCheck, ChevronLeft, Box } from 'lucide-angular';
import { ProductService, ProductModel } from '../../../../../core/services/product.service';
import type { CartItem } from '../../../../../core/models/cart.model';
import type { Variant, Price } from '../../../../../core/models/product.model';
import { PrimaryButton } from '../../../../../shared/ui/buttons/primary-button/primary-button';
import { CardPriceVariant } from '../../../../../shared/ui/cards/card-price-variant/card-price-variant';
import { CartService } from '../../../cart/services/cart.service';
import { CategoryService } from '../../../../../core/services/category.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ToastService } from '../../../../../core/services/toast.service';

@Component({
    selector: 'app-product-detail-page',
    standalone: true,
    imports: [
        CommonModule,
        LucideAngularModule,
        RouterLink,
        PrimaryButton,
        CardPriceVariant
    ],
    templateUrl: './product-detail-page.html'
})
export class ProductDetailPage implements OnInit {
    private route = inject(ActivatedRoute);
    private productService = inject(ProductService);
    private cartService = inject(CartService);
    private categoryService = inject(CategoryService);
    private toastService = inject(ToastService);

    product = signal<ProductModel | null>(null);
    loading = signal(true);

    // Categories Data
    categories = toSignal(this.categoryService.getCategoriesWithSubcategories(), { initialValue: [] });

    // Computed Category Names
    categoryName = computed(() => {
        const p = this.product();
        if (!p?.categoryId) return '';
        const cat = this.categories().find(c => c.id === p.categoryId);
        return cat?.name || '';
    });

    subcategoryName = computed(() => {
        const p = this.product();
        if (!p?.categoryId || !p?.subcategoryId) return '';
        const cat = this.categories().find(c => c.id === p.categoryId);
        const sub = cat?.subcategories?.find(s => s.id === p.subcategoryId);
        return sub?.name || '';
    });

    // Gallery State
    activeImageIndex = signal(0);
    activeImage = computed(() => {
        const p = this.product();
        if (!p?.images?.length) return null;
        return p.images[this.activeImageIndex()];
    });

    // Quantities State (Map<Variant, number>)
    variantQuantities = signal<Map<Variant, number>>(new Map());

    // Computed Base Price for Unit (Reference for Box comparison)
    baseUnitPrice = computed(() => {
        const p = this.product();
        if (!p?.prices) return 0;
        return p.prices.find(price => price.label === 'unit')?.price || 0;
    });

    // Computed Totals
    totalPrice = computed(() => {
        let total = 0;
        const p = this.product();
        if (!p) return 0;

        p.prices.forEach((price: Price) => {
            const qty = this.variantQuantities().get(price.label) || 0;
            if (qty > 0) {
                const effectivePrice = this.calculateEffectivePrice(price, qty);
                total += effectivePrice * qty;
            }
        });
        return total;
    });

    totalItems = computed(() => {
        let count = 0;
        this.variantQuantities().forEach((qty) => (count += qty));
        return count;
    });

    // Icons
    readonly Icons = {
        ShoppingCart, Truck, ShieldCheck, ChevronLeft, Box
    };

    ngOnInit() {
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.loadProduct(params['id']);
            }
        });
    }

    loadProduct(id: string) {
        this.loading.set(true);
        this.productService.getProductById(id).subscribe({
            next: (response: any) => {
                if (response.success) {
                    this.product.set(response.data);
                    // Reset quantities on new product load
                    this.variantQuantities.set(new Map());
                    this.activeImageIndex.set(0);
                }
                this.loading.set(false);
            },
            error: (err: any) => {
                console.error(err);
                this.loading.set(false);
            }
        });
    }

    // Handlers
    onQuantityChange(variant: Variant, newQty: number) {
        this.variantQuantities.update((map) => {
            const newMap = new Map(map);
            if (newQty <= 0) {
                newMap.delete(variant);
            } else {
                newMap.set(variant, newQty);
            }
            return newMap;
        });
    }

    getStock(variant: Variant): number {
        const p = this.product();
        if (!p) return 0;
        return variant === 'unit'
            ? (p.stockUnits || 0)
            : (p.stockBoxes || 0);
    }

    getQuantity(variant: Variant): number {
        return this.variantQuantities().get(variant) || 0;
    }

    addToCart() {
        const product = this.product();
        if (!product) return;

        let addedCount = 0;

        this.variantQuantities().forEach((qty, variant) => {
            if (qty > 0) {
                const variantPrice = product.prices.find((p: any) => p.label === variant);
                if (!variantPrice) return;

                const price = this.calculateEffectivePrice(variantPrice, qty);

                const maxQuantity = variant === 'unit'
                    ? product.stockUnits ?? 0
                    : product.stockBoxes ?? 0;

                const cartItem: CartItem = {
                    productId: product.id,
                    variant,
                    quantity: qty,
                    maxQuantity,
                    product: {
                        id: product.id,
                        sku: product.sku,
                        name: product.name,
                        brand: product.brand,
                        price,
                        images: product.images,
                    },
                };

                this.cartService.addItem(cartItem).subscribe();
                addedCount++;
            }
        });

        if (addedCount > 0) {
            this.toastService.success('Productos agregados al carrito correctamente.');
        }
    }

    // Helper
    private calculateEffectivePrice(price: Price, quantity: number): number {
        if (!price.discounts || price.discounts.length === 0) {
            return price.price;
        }
        const sortedDiscounts = [...price.discounts].sort((a, b) => b.minQuantity - a.minQuantity);
        const discount = sortedDiscounts.find((d) => quantity >= d.minQuantity);
        return discount ? discount.price : price.price;
    }
}
