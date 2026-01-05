import { Pipe, PipeTransform } from '@angular/core';
import { ORDER_VARIANT_LABELS, OrderVariant } from '../../core/models/order.model';

@Pipe({
  name: 'variant',
})
export class VariantPipe implements PipeTransform {
  transform(value: OrderVariant): string {
    return ORDER_VARIANT_LABELS[value];
  }
}
