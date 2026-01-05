import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../../../core/http/api.service';
import { Order, OrderDetailItem } from '../../../../core/models/order.model';
import { ResponseError } from '../../../../core/models/api-response.model';
import { Product } from '../../../../core/models/product.model';

export type ItemWithError = { item: OrderDetailItem; suggestions?: Product[] };
export type CreateOrderError = ResponseError<ItemWithError>[] | null;

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  apiService = inject(ApiService);

  createOrder(order: Order) {
    return this.apiService.post<Order | null, CreateOrderError>('/orders', order);
  }
}
