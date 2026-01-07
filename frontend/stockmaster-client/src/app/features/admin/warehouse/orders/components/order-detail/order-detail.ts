import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Order, OrderDeliveryAddress } from '../../../../../../core/models/order.model';
import { OrderService } from '../../../../../../core/services/order/order';
import { OrderHeaderDetail } from './order-header-detail/order-header-detail';
import { OrderItemsDetail } from './order-items-detail/order-items-detail';
import { Location } from '@angular/common';
import { LucideAngularModule, ArrowLeft } from 'lucide-angular';

@Component({
  selector: 'app-order-detail',
  imports: [OrderHeaderDetail, OrderItemsDetail, LucideAngularModule],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.css',
})
export class OrderDetail implements OnInit {
  private orderService = inject(OrderService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  readonly ArrowLeftIcon = ArrowLeft;

  order = signal<Order>({} as Order);
  isLoading = signal(true);

  goBack(): void {
    this.location.back();
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;

    this.orderService.getOrderById(id).subscribe({
      next: (res) => {
        const { data } = res;
        if (data) {
          this.order.set(data);
          this.isLoading.set(false);
        }
      },
      error: (error) => {
        console.error(error);
        this.isLoading.set(false);
      },
    });
  }
  formatAddress(addr: OrderDeliveryAddress) {
    return `${addr.street} ${addr.number}\n${addr.city}`;
  }
}
