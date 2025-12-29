import { Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Loader2, LucideAngularModule } from 'lucide-angular';
import { ORDER_STATUS, OrderStatus } from '../../../../../../core/models/order.model';
import { OrderStatusPipe } from '../../../../../../shared/pipes/order-status.pipe';
import { Modal } from '../../../../../../shared/ui/modal/modal';

interface OrderEditModalValue {
  id: string;
  status: OrderStatus;
}

@Component({
  selector: 'app-order-edit-modal',
  imports: [ReactiveFormsModule, LucideAngularModule, Modal, OrderStatusPipe],
  templateUrl: './order-edit-modal.html',
  styleUrl: './order-edit-modal.css',
})
export class OrderEditModal {
  order = input.required<OrderEditModalValue>();
  isSaving = input(false);
  close = output<void>();
  save = output<OrderEditModalValue>();

  fb = inject(FormBuilder);
  readonly LoaderIcon = Loader2;

  editForm = this.fb.group({
    status: ['', Validators.required],
  });

  statusOptions = Object.values(ORDER_STATUS);

  constructor() {
    effect(() => {
      console.log(this.order());
      this.editForm.patchValue({
        status: this.order().status,
      });
    });
  }

  onSubmit() {
    if (this.editForm.valid) {
      const { status } = this.editForm.value;
      this.save.emit({
        id: this.order().id,
        status: status as OrderStatus,
      });
    }
  }
}
