import { Injectable } from '@angular/core';
import type { Driver, Order, Delivery } from '../../../../core/models/route.model';

interface PopupSection {
  icon: string;
  label: string;
  value: string;
  sublabel?: string;
}
@Injectable({
  providedIn: 'root',
})
export class PopupBuilderService {
  

  buildDistributorPopup(): string {
    
    return `
      <div class="p-4 min-w-[250px] font-sans">
        <h3 class="font-bold text-gray-900 mb-3 text-lg">Distribuidora Central</h3>
        <div class="space-y-2 text-sm">
          <p class="text-gray-700">📍 Av. Francisco Lazo 2352, Lince</p>
          <p class="text-gray-700">🕐 6:00 AM - 10:00 PM</p>
        </div>
      </div>
    `;
  }

  buildOrderPopup(order: Order, assignedDriver?: Driver): string {
    const totalAmount = order.items?.reduce((sum, item) => sum + item.subTotal!, 0) || 0;
    const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    const driverSection = assignedDriver 
      ? `<p class="text-gray-700">🚚 Conductor: <span class="font-semibold">${assignedDriver.displayName}</span></p>`
      : '';

    return `
      <div class=" min-w-[280px] font-sans">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-bold text-gray-900 text-lg">Pedido ${order.id}</h3>
          <span class="text-xs px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold">
            ${this.getOrderStatusLabel(order.status)}
          </span>
        </div>
        
        <div class="space-y-2 text-sm mb-3">
          <p class="text-gray-700">🏢 <span class="font-semibold">${order.customer.companyName}</span></p>
          <p class="text-gray-600 text-xs ml-4">${order.customer.contactName}</p>
          <p class="text-gray-700">📦<span class="font-semibold">${itemCount} artículos</span></p>
          <p class="text-gray-700">📍 ${order.deliveryAddress.street}</p>
          <p class="text-gray-600 text-xs ml-4">${order.deliveryAddress.district}, ${order.deliveryAddress.city}</p>
          ${driverSection}
        </div>
        
        <div class="pt-3 border-t border-gray-200">
          <div class="flex justify-between items-center">
            <span class="font-semibold text-gray-700">Total:</span>
            <span class="font-bold text-green-600 text-lg">S/ ${totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    `;
  }

  buildDeliveryPopup(delivery: Delivery, order?: Order): string {
    const orderSection = order 
      ? `<p class="text-gray-700">📦 Pedido: <span class="font-semibold">${order.id}</span></p>`
      : '';

    return `
      <div class=" min-w-[250px] font-sans">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-bold text-gray-900 text-lg">Entrega ${delivery.id}</h3>
          <span class="text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold">
            ${this.getDeliveryStatusLabel(delivery.status)}
          </span>
        </div>
        
        <div class="space-y-2 text-sm">
          <p class="text-gray-700">👤 ${delivery.driverName}</p>
          ${orderSection}
          <p class="text-gray-700">🕐 Iniciado: ${new Date(delivery.startedAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</p>
          <p class="text-gray-600 text-xs">📍 ${delivery.currentLocation.lat.toFixed(4)}, ${delivery.currentLocation.lng.toFixed(4)}</p>
        </div>
      </div>
    `;
  }

  buildRoutePopup(routeId: string, driverName: string, ordersCount: number, stats?: { totalDistance: string; estimatedTime: number }): string {
    const statsSection = stats 
      ? `
        <div class="pt-3 border-t border-gray-200">
          <div class="grid grid-cols-2 gap-3 text-center">
            <div>
              <p class="text-2xl font-bold text-purple-600">${stats.totalDistance} km</p>
              <p class="text-xs text-gray-600">Distancia</p>
            </div>
            <div>
              <p class="text-2xl font-bold text-purple-600">${stats.estimatedTime} min</p>
              <p class="text-xs text-gray-600">Tiempo est.</p>
            </div>
          </div>
        </div>
      `
      : '';

    return `
      <div class=" min-w-[250px] font-sans">
        <h3 class="font-bold text-gray-900 text-lg mb-3">Ruta ${routeId}</h3>
        <div class="space-y-2 text-sm mb-3">
          <p class="text-gray-700">👤 ${driverName}</p>
          <p class="text-gray-700">📦 ${ordersCount} entregas</p>
        </div>
        ${statsSection}
      </div>
    `;
  }

  private getOrderStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'CREATED': 'Creado',
      'ASSIGNED': 'Asignado',
      'ON_ROUTE': 'En ruta',
      'DELIVERED': 'Entregado',
      'FAILED': 'Fallido',
    };
    return labels[status] || status;
  }

  private getDeliveryStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PENDING': 'Pendiente',
      'ON_ROUTE': 'En ruta',
      'DELIVERED': 'Entregado',
      'FAILED': 'Fallido',
    };
    return labels[status] || status;
  }
}
