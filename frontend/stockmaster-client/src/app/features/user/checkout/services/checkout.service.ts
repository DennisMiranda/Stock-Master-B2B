import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../../../core/http/api.service';
import { Order } from '../../../../core/models/order.model';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  apiService = inject(ApiService);

  createOrder(order: Order) {
    return this.apiService.post('/checkout', order);
  }
}
