import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../../core/http/api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface StatisticItem {
    id: string;
    name: string;
    unitSold: number;
    boxSold: number;
    totalUnitSold: number;
    images: string[];
}

export interface LowStockItem {
    id: string;
    name: string;
    sku: string;
    brand: string;
    stockUnits: number;
    stockBoxes: number;
    images: string[];
    unitPerBox: number;
    isActive: boolean;
}

export interface DashboardStats {
    topSelling: {
        consolidated: StatisticItem[];
        byUnit: StatisticItem[];
        byBox: StatisticItem[];
    };
    lowStock: {
        byUnit: LowStockItem[];
        byBox: LowStockItem[];
    };
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private api = inject(ApiService);

    getStats(): Observable<DashboardStats> {
        // T is the successful data type
        return this.api.get<DashboardStats>('/dashboard/stats').pipe(
            map(response => response.data!)
        );
    }
}
