import { Route, RouteStatus } from '../../../../core/models/route.model';

export function createRoutePopup(route: Route): string {
  const statusColor = getRouteStatusColor(route.status);
  const statusLabel = getRouteStatusLabel(route.status);

  return `
    <div class="font-sans min-w-[280px] p-0 -m-[15px]">
      <!-- Header -->
      <div 
        class="p-4 pt-5 rounded-t-xl text-white"
        style="background: linear-gradient(135deg, ${statusColor.gradient[0]} 0%, ${
    statusColor.gradient[1]
  } 100%);"
      >
        <div class="flex items-center gap-3">
          <div class="bg-white/20 backdrop-blur w-11 h-11 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 fill-white" viewBox="0 0 24 24">
              <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
            </svg>
          </div>
          <div class="flex-1">
            <div class="text-[10px] opacity-90 uppercase tracking-wider font-semibold">
              Ruta de Entrega
            </div>
            <div class="text-lg font-bold mt-0.5">
              ${route.name || `#${route.id}`}
            </div>
          </div>
        </div>
        <div class="mt-3 bg-white/15 backdrop-blur px-3 py-2 rounded-md inline-block">
          <span class="text-[11px] font-bold uppercase tracking-wide">
            ${statusLabel}
          </span>
        </div>
      </div>

      <!-- Body -->
      <div class="p-4 bg-white">
        <!-- Stats -->
        <div class="grid grid-cols-2 gap-2 mb-3">
          <div class="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg text-center">
            <div class="text-xl font-bold text-white mb-0.5">
              ${route.orders.length}
            </div>
            <div class="text-[9px] text-white/90 uppercase tracking-wide font-semibold">
              Pedidos
            </div>
          </div>
          <div class="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-lg text-center">
            <div class="text-lg font-bold text-white mb-0.5">
              ${
                route.geometry?.coordinates ? Math.round(route.geometry.coordinates.length / 10) : 0
              }km
            </div>
            <div class="text-[9px] text-white/90 uppercase tracking-wide font-semibold">
              Estimado
            </div>
          </div>
        </div>

       

        ${
          route.driver
            ? `
          <div class="flex items-center gap-2.5 p-2.5 bg-violet-50 border-l-4 border-violet-500 rounded-r-lg mt-2.5">
            <div class="bg-violet-500 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold text-xs">
              ${route.driver.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </div>
            <div class="flex-1">
              <div class="text-[10px] text-violet-700 font-semibold mb-0.5">
                Conductor Asignado
              </div>
              <div class="text-[13px] text-violet-800 font-bold">
                ${route.driver.name}
              </div>
            </div>
          </div>
        `
            : ''
        }

        <!-- Fecha de creación -->
        <div class="flex items-center gap-2 p-2.5 bg-slate-50 rounded-md text-[11px] text-slate-500 mt-2.5">
          <svg class="w-3.5 h-3.5 fill-slate-400" viewBox="0 0 24 24">
            <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
          </svg>
          <span class="font-medium">
            Creada: ${new Date(route.createdAt!).toLocaleDateString('es-PE', {
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

function getRouteStatusColor(status: string): { gradient: [string, string] } {
  const colors: Record<string, { gradient: [string, string] }> = {
    PLANNED: { gradient: ['#3b82f6', '#2563eb'] },
    IN_PROGRESS: { gradient: ['#8b5cf6', '#7c3aed'] },
    COMPLETED: { gradient: ['#10b981', '#059669'] },
    CANCELLED: { gradient: ['#ef4444', '#dc2626'] },
  };
  return colors[status] || { gradient: ['#6b7280', '#4b5563'] };
}

function getRouteStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PLANNED: 'Planificada',
    IN_PROGRESS: 'En Progreso',
    COMPLETED: 'Completada',
    CANCELLED: 'Cancelada',
  };
  return labels[status] || status;
}