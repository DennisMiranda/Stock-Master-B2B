import { Component, output, signal } from '@angular/core';
import { Ellipsis, Eye, FileText, LucideAngularModule, Pencil } from 'lucide-angular';
import { ORDER_ACTION, OrderAction } from './order-action.model';

@Component({
  selector: 'app-order-actions',
  imports: [LucideAngularModule],
  templateUrl: './order-actions.html',
  styleUrl: './order-actions.css',
})
export class OrderActions {
  actionChange = output<OrderAction>();

  isOpen = signal(false);

  // Icons
  readonly ViewIcon = Eye;
  readonly EditIcon = Pencil;
  readonly FileIcon = FileText;
  readonly MoreIcon = Ellipsis;

  toggleMenu(event: Event) {
    event.stopPropagation();
    this.isOpen.update((v) => !v);
  }

  closeMenu() {
    this.isOpen.set(false);
  }

  onAction(action: OrderAction) {
    this.closeMenu();
    this.actionChange.emit(action);
  }

  generateGuide() {
    this.onAction(ORDER_ACTION.generateGuide);
  }

  viewDetail() {
    this.onAction(ORDER_ACTION.viewDetail);
  }

  updateStatus() {
    this.onAction(ORDER_ACTION.updateStatus);
  }
}
