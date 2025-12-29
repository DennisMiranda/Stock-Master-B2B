import { Pipe, PipeTransform } from '@angular/core';
import { ORDER_STATUS_LABELS, OrderStatus } from '../../core/models/order.model';

@Pipe({
  name: 'orderStatus',
})
export class OrderStatusPipe implements PipeTransform {
  transform(value: OrderStatus): string {
    return ORDER_STATUS_LABELS[value];
  }
}
