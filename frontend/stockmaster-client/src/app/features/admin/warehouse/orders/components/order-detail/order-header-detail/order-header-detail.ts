import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { OrderDeliveryAddress } from '../../../../../../../core/models/order.model';

@Component({
  selector: 'app-order-header-detail',
  imports: [DatePipe, CurrencyPipe],
  templateUrl: './order-header-detail.html',
  styleUrl: './order-header-detail.css',
})
export class OrderHeaderDetail {
  orderId = input.required<string>();
  orderDate = input.required<number>();
  totalAmount = input.required<number>();
  address = input.required<OrderDeliveryAddress>();
  companytName = input.required<string>();
}
