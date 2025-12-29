import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../http/api.service';
import { finalize, tap } from 'rxjs/operators';

export interface ProductModel {
    id: string;
    sku: string;
    name: string;
    description?: string;
    prices: any[];
    images: string[];
    stockUnits: number;
    stockBoxes: number;
    isActive: boolean;
    brand: string;
    categoryId: string;
    subcategoryId: string;
    unitPerBox: number;
}

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private api = inject(ApiService);

    // State (Signals)
    // State (Signals)
    products = signal<ProductModel[]>([]);
    isLoading = signal<boolean>(false);

    // Pagination State
    totalItems = signal(0);
    totalPages = signal(1);
    currentPage = signal(1);
    itemsPerPage = signal(10);

    loadProducts(params: any = {}) {
        this.isLoading.set(true);

        // Ensure defaults
        const requestParams = {
            page: params.page || this.currentPage(),
            limit: params.limit || this.itemsPerPage(),
            ...params
        };

        // Update current page immediately to reflect UI state
        if (requestParams.page) this.currentPage.set(requestParams.page);

        const queryString = new URLSearchParams(requestParams).toString();

        this.api.get<any>(`/products?${queryString}`)
            .pipe(
                finalize(() => this.isLoading.set(false))
            )
            .subscribe({
                next: (response) => {
                    // Scenario A: Standard Backend Response with Metadata
                    if (response.success && response.data?.products) {
                        this.products.set(response.data.products);

                        if (response.data.metadata) {
                            this.totalItems.set(response.data.metadata.count);
                            this.totalPages.set(response.data.metadata.pages);
                            this.currentPage.set(response.data.metadata.page);
                        }
                    }
                    // Scenario B: Fallback (Legacy/Array)
                    else if (Array.isArray(response)) {
                        this.products.set(response);
                    }
                },
                error: (err) => console.error('Error loading products:', err)
            });
    }

    getProductById(id: string) {
        return this.api.get<any>(`/products/${id}`);
    }

    createProduct(data: any) {
        return this.api.post<any>('/products', data).pipe(
            tap((response) => {
                if (response.success && response.data) {
                    this.products.update(current => [...current, response.data]);
                }
            })
        );
    }

    updateProduct(id: string, data: any) {
        return this.api.put<any>(`/products/${id}`, data).pipe(
            tap((response) => {
                if (response.success) {
                    this.products.update(current =>
                        current.map(p => p.id === id ? { ...p, ...data } : p)
                    );
                }
            })
        );
    }

    deleteProduct(id: string) {
        return this.api.delete<any>(`/products/${id}`).pipe(
            tap((response) => {
                if (response.success) {
                    this.products.update(current => current.filter(p => p.id !== id));
                }
            })
        );
    }
}
