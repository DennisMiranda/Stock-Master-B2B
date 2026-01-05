import type { Order } from '../../../../core/models/order.model';

function getOrderStatusConfig(status: string) {
  const configs: Record<string, any> = {
    'CREATED': {
      gradient: 'from-amber-500 to-orange-600',
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      label: 'Creado'
    },
    'IN_PACKING': {
      gradient: 'from-blue-500 to-cyan-600',
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
      label: 'Empaquetando'
    },
    'READY': {
      gradient: 'from-emerald-500 to-green-600',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      label: 'Listo'
    },
    'ASSIGNED': {
      gradient: 'from-purple-500 to-pink-600',
      badge: 'bg-purple-100 text-purple-800 border-purple-200',
      label: 'Asignado'
    },
    'IN_TRANSIT': {
      gradient: 'from-indigo-500 to-purple-600',
      badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      label: 'En Tránsito'
    },
    'DELIVERED': {
      gradient: 'from-gray-500 to-slate-600',
      badge: 'bg-gray-100 text-gray-800 border-gray-200',
      label: 'Entregado'
    },
    'CANCELLED': {
      gradient: 'from-red-500 to-rose-600',
      badge: 'bg-red-100 text-red-800 border-red-200',
      label: 'Cancelado'
    }
  };
  return configs[status] || configs['CREATED'];
}

export function createOrderPopup(order: Order): string {
  const config = getOrderStatusConfig(order.status!);
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return `
    <div class="font-sans min-w-[320px] p-0 -m-[15px]">
      <!-- Header -->
      <div class="bg-gradient-to-br ${config.gradient} p-4 pt-5 rounded-t-xl text-white">
        <div class="flex items-center gap-3">
          <div class="bg-white/20 backdrop-blur w-11 h-11 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z"/>
            </svg>
          </div>
          <div class="flex-1">
            <div class="text-xs opacity-90 uppercase tracking-wider font-semibold">
              Pedido
            </div>
            <div class="text-sm font-bold mt-0.5">
              #${order.id}
            </div>
          </div>
        </div>
        <div class="mt-3 bg-white/15 backdrop-blur px-3 py-2 rounded-md inline-block">
          <span class="text-[11px] font-bold uppercase tracking-wide">
            ${config.label}
          </span>
        </div>
      </div>

      <!-- Body -->
      <div class="p-4 grid grid-cols-1 md:grid-cols-2 bg-white space-y-1">
        <!-- Stats -->
        <div class="grid grid-cols-2 col-span-2 gap-2">
          <div class="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg text-center">
            <div class="text-sm font-bold text-white mb-0.5">
              ${totalItems}
            </div>
            <div class="text-[9px] text-white/90 uppercase tracking-wide font-semibold">
              Items
            </div>
          </div>
          <div class="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 rounded-lg text-center">
            <div class="text-sm font-semibold text-white ">
              ${order.payment.currency} ${order.payment.total.toFixed(2)}
            </div>
            <div class="text-[9px] text-white/90 uppercase tracking-wide font-semibold">
              Total
            </div>
          </div>
        </div>

        <!-- Cliente -->
        <div class="bg-slate-50 rounded-lg p-3 flex flex-col ">
          <div class="flex items-center gap-2 ">
            <svg class="w-3.5 h-3.5 fill-slate-500" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
            <span class="text-[10px] text-slate-500 font-bold uppercase tracking-wide">
              Cliente
            </span>
          </div>
          <div>
            <p class="text-xs font-bold text-slate-800 ">
              ${order.customer.companyName}
            </p>
            <p class="text-xs text-slate-600">
              ${order.customer.contactName}
            </p>
          </div>
        </div>



        <!-- Contacto -->
        <div class="bg-slate-50 flex flex-col   rounded-lg p-3 ">
          <div class="flex items-center gap-2 ">
            <svg class="w-3.5  h-3.5 fill-slate-500" viewBox="0 0 24 24">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
            <span class="text-[10px]  text-slate-500 font-bold uppercase tracking-wide">
              Contacto
            </span>
          </div>
          <div>
            <p class="text-sm  font-bold text-slate-800">
              ${order.customer.phone}
            </p>
            ${
              order.customer.email
                ? `<p class="text-xs text-slate-600 ">${order.customer.email}</p>`
                : ''
            }
          </div>
        </div>

                <!-- Dirección -->
        <div class="bg-slate-50 flex flex-col  col-span-2 rounded-lg p-3 ">
          <div class="flex items-center gap-2 ">
            <svg class="w-3.5 h-3.5 fill-slate-500" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span class="text-[10px] text-slate-500 font-bold uppercase tracking-wide">
              Dirección
            </span>
          </div>
          <div>
            <p class="text-xs font-bold text-slate-800 ">
              ${order.deliveryAddress.street} ${order.deliveryAddress.number}
            </p>
            <p class="text-xs text-slate-600">
              ${order.deliveryAddress.district}, ${order.deliveryAddress.city}
            </p>
            ${
              order.deliveryAddress.reference 
                ? `<p class="text-xs text-slate-500  italic">${order.deliveryAddress.reference}</p>`
                : ''
            }
          </div>
        </div>

        <!-- Fecha de creación -->
        <div class="flex items-center col-span-2 gap-2 p-2.5 bg-slate-50 rounded-md text-[11px] text-slate-500">
          <svg class="w-3.5 h-3.5 fill-slate-400" viewBox="0 0 24 24">
            <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
          </svg>
          <span class="font-medium">
            Creado: ${new Date(order.createdAt!).toLocaleDateString('es-PE', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>
    </div>
  `;
}