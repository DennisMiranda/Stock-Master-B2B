import {
  AfterViewInit,
  Component,
  inject,
  OnInit,
  signal,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { ORDER_STATUS, OrderStatus } from '../../../../../../core/models/order.model';
import { OrderService } from '../../../../../../core/services/order/order';
import { OrderStatusPipe } from '../../../../../../shared/pipes/order-status.pipe';
import { DataTableComponent } from '../../../../../../shared/ui/data-table/data-table.component';
import { TableColumn } from '../../../../../../shared/ui/data-table/models/table.model';
import { ORDER_ACTION, OrderAction } from '../order-actions/order-action.model';
import { OrderActions } from '../order-actions/order-actions';
import { OrderEditModal } from '../order-edit-modal/order-edit-modal';

interface OrderRow {
  id: string;
  name: string;
  taxId: string;
  createdAt: string;
  status: OrderStatus;
  total: number;
  actions: TemplateRef<any>;
}
[];

@Component({
  selector: 'app-orders-table',
  imports: [DataTableComponent, OrderActions, OrderEditModal, OrderStatusPipe],
  templateUrl: './orders-table.html',
  styleUrl: './orders-table.css',
})
export class OrdersTable implements OnInit, AfterViewInit {
  @ViewChild('nameTemplate') nameTemplate!: TemplateRef<HTMLElement>;
  @ViewChild('statusTemplate') statusTemplate!: TemplateRef<HTMLElement>;
  @ViewChild('actionTemplate') actionTemplate!: TemplateRef<HTMLElement>;

  isEditModalOpen = signal(false);
  selectedOrder = signal<OrderRow | null>(null);

  data = signal<OrderRow[]>([]);
  columns = signal<TableColumn<OrderRow>[]>([]);
  isLoading = signal(true);

  orderService = inject(OrderService);
  router = inject(Router);

  ngOnInit() {
    this.orderService
      .getOrders()
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          console.log(response);
          if (response.data) {
            this.data.set(
              response.data.orders.map((order) => ({
                id: order.id || 'unknown',
                name: order.customer?.companyName || 'Sin nombre',
                taxId: order.customer?.taxId || 'Sin RUC',
                createdAt: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '',
                items: order.items.length,
                total: order.payment.total || 0,
                status: order.status || ORDER_STATUS.created,
                actions: this.actionTemplate,
              }))
            );
          }
        },
        complete: () => {
          this.isLoading.set(false);
        },
      });
  }

  ngAfterViewInit(): void {
    this.columns.set([
      {
        key: 'id',
        label: 'Pedido',
      },
      {
        key: 'name',
        label: 'Cliente',
        template: this.nameTemplate,
      },
      {
        key: 'createdAt',
        label: 'Fecha',
      },
      {
        key: 'items',
        label: 'Items',
      },
      {
        key: 'total',
        label: 'Total',
      },
      {
        key: 'status',
        label: 'Estado',
        template: this.statusTemplate,
      },
      {
        key: 'actions',
        label: 'Acciones',
        template: this.actionTemplate,
      },
    ]);
  }
  getStatusBadgeColor(status: string): string {
    switch (status) {
      case ORDER_STATUS.created:
        return 'bg-blue-100 text-blue-600';
      case ORDER_STATUS.inPacking:
        return 'bg-amber-100 text-amber-700';
      case ORDER_STATUS.ready:
        return 'bg-indigo-100 text-indigo-800';
      case ORDER_STATUS.assigned:
        return 'bg-cyan-100 text-cyan-700';
      case ORDER_STATUS.inTransit:
        return 'bg-violet-100 text-violet-700';
      case ORDER_STATUS.delivered:
        return 'bg-emerald-100 text-emerald-700';
      case ORDER_STATUS.cancelled:
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  onAction(action: OrderAction, row: OrderRow) {
    switch (action) {
      case ORDER_ACTION.viewDetail:
        this.router.navigate(['admin/orders', row.id]);
        break;
      case ORDER_ACTION.generateGuide:
        break;
      case ORDER_ACTION.updateStatus:
        this.selectedOrder.set(row);
        this.isEditModalOpen.set(true);

        break;
      default:
        break;
    }
  }

  closeEditModal() {
    this.isEditModalOpen.set(false);
    this.selectedOrder.set(null);
  }

  onUpdateStatus(event: { id: string; status: OrderStatus }) {
    this.orderService
      .updateOrder(event.id, { status: event.status })
      .pipe(take(1))
      .subscribe({
        next: () => {
          console.log('Orden actualizada');
          this.data.update((prev) => {
            const updatedOrder = prev.find((order) => order.id === event.id);
            if (updatedOrder) {
              updatedOrder.status = event.status;
            }
            return prev;
          });
        },
        error: (error) => {
          console.error(error);
        },
        complete: () => {
          this.closeEditModal();
        },
      });
  }
}
