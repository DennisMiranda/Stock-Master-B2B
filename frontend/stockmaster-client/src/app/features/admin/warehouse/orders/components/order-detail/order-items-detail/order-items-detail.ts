import { CurrencyPipe } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-order-items-detail',
  imports: [CurrencyPipe],
  templateUrl: './order-items-detail.html',
  styleUrl: './order-items-detail.css',
})
export class OrderItemsDetail {
  name = input.required<string>();
  quantity = input.required<number>();
  variant = input.required<string>();
  price = input.required<number>();
  imageUrl = input<string | File>();
}
