import type { Order } from '../../../../core/models/order.model';
function getOrderStatusColor(status: string): { gradient: [string, string] } {
  const colors: Record<string, { gradient: [string, string] }> = {
    CREATED: { gradient: ['#f59e0b', '#d97706'] },
    IN_PACKING: { gradient: ['#3b82f6', '#2563eb'] },
    READY: { gradient: ['#10b981', '#059669'] },
    DELIVERED: { gradient: ['#6b7280', '#4b5563'] },
    CANCELLED: { gradient: ['#ef4444', '#dc2626'] },
  };
  return colors[status] || { gradient: ['#6b7280', '#4b5563'] };
}

function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    CREATED: 'Creado',
    IN_PACKING: 'Empaquetando',
    READY: 'Listo',
    DELIVERED: 'Entregado',
    CANCELLED: 'Cancelado',
  };
  return labels[status] || status;
}
export function createOrderPopup(order: Order): string {
  const statusColor = getOrderStatusColor(order.status!);
  const statusLabel = getOrderStatusLabel(order.status!);

  return `
      <div style="
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        min-width: 300px;
        padding: 0;
        margin: -15px;
      ">
        <!-- Header -->
        <div style="
          background: linear-gradient(135deg, ${statusColor.gradient[0]} 0%, ${
    statusColor.gradient[1]
  } 100%);
          padding: 16px 20px;
          border-radius: 12px 12px 0 0;
          color: white;
        ">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="
                background: rgba(255,255,255,0.2);
                backdrop-filter: blur(10px);
                width: 40px;
                height: 40px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                <svg width="22" height="22" fill="white" viewBox="0 0 24 24">
                  <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>
                </svg>
              </div>
              <div>
                <div style="font-size: 10px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                  Pedido
                </div>
                <div style="font-size: 16px; font-weight: 700; margin-top: 2px;">
                  #${order.id}
                </div>
              </div>
            </div>
            <div style="
              background: rgba(255,255,255,0.25);
              backdrop-filter: blur(10px);
              padding: 6px 12px;
              border-radius: 20px;
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            ">
              ${statusLabel}
            </div>
          </div>
        </div>

        <!-- Body -->
        <div style="padding: 16px; background: white;">
          <!-- Cliente -->
          <div style="
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px;
            background: #f1f5f9;
            border-radius: 8px;
            margin-bottom: 10px;
          ">
            <div style="
              background: #3b82f6;
              width: 32px;
              height: 32px;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
            ">
              <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
            </div>
            <div style="flex: 1; min-width: 0;">
              <div style="font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${order.customer.companyName}
              </div>
              <div style="font-size: 11px; color: #64748b;">
                ${order.customer.contactName}
              </div>
            </div>
          </div>

          <!-- Dirección -->
          <div style="
            display: flex;
            align-items: flex-start;
            gap: 10px;
            padding: 10px;
            background: #fef3c7;
            border-left: 3px solid #f59e0b;
            border-radius: 0 8px 8px 0;
            margin-bottom: 10px;
          ">
            <div style="
              background: #f59e0b;
              width: 28px;
              height: 28px;
              border-radius: 6px;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
              margin-top: 2px;
            ">
              <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <div style="flex: 1;">
              <div style="font-size: 12px; font-weight: 600; color: #92400e; margin-bottom: 3px;">
                ${order.deliveryAddress.street} ${order.deliveryAddress.number}
              </div>
              <div style="font-size: 10px; color: #b45309;">
                ${order.deliveryAddress.district}, ${order.deliveryAddress.city}
              </div>
            </div>
          </div>

          <!-- Info Grid -->
          <div style="
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-bottom: 10px;
          ">
            <div style="
              background: #dbeafe;
              padding: 10px;
              border-radius: 8px;
              text-align: center;
            ">
              <div style="font-size: 18px; font-weight: 700; color: #1e40af; margin-bottom: 2px;">
                ${order.items.reduce((sum, item) => sum + item.quantity, 0)}
              </div>
              <div style="font-size: 9px; color: #3b82f6; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                Items
              </div>
            </div>
            <div style="
              background: #d1fae5;
              padding: 10px;
              border-radius: 8px;
              text-align: center;
            ">
              <div style="font-size: 16px; font-weight: 700; color: #065f46; margin-bottom: 2px;">
                ${order.payment.currency} ${order.payment.total.toFixed(2)}
              </div>
              <div style="font-size: 9px; color: #059669; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                Total
              </div>
            </div>
          </div>

          <!-- Contacto -->
          <div style="
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 10px;
            background: #f8fafc;
            border-radius: 6px;
            font-size: 11px;
            color: #64748b;
          ">
            <svg width="14" height="14" fill="#94a3b8" viewBox="0 0 24 24">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
            <span style="font-weight: 500;">${order.customer.phone}</span>
          </div>
        </div>
      </div>
    `;
}
