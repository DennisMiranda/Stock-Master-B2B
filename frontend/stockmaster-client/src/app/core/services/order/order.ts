import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../http/api.service';
import { Order } from '../../models/order.model';

export interface OrdersPaginatedResponse {
  orders: Order[];
  metadata: { count: number; pages: number };
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  apiService = inject(ApiService);

  createOrder(order: Order) {
    return this.apiService.post('/orders', order);
  }

  getOrders() {
    return this.apiService.get<OrdersPaginatedResponse>('/orders');
  }

  updateOrderStatus(id: string, status: string) {
    return this.apiService.patch<Order>(`/orders/${id}/status`, { status });
  }

  getOrderById(id: string) {
    return this.apiService.get<Order>(`/orders/${id}`);
  }

  getOrdersByUserId(userId: string) {
    return this.apiService.get<OrdersPaginatedResponse>(`/orders/user/${userId}`);
  }

  deleteOrder(id: string) {
    return this.apiService.delete(`/orders/${id}`);
  }

  updateOrder(id: string, order: Partial<Order>) {
    return this.apiService.put<Order>(`/orders/${id}`, order);
  }
}
