export function createWarehousePopup(WAREHOUSE_LOCATION: any): string {
  return `
   <div class="font-sans min-w-[320px] -m-1  rounded-sm">
      <!-- Header con gradiente -->
      <div class="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-6 py-5">
        <!-- Patrón de fondo -->
        <div class="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        
        <div class="relative flex items-center gap-4">
          <!-- Icono -->
          <div class="bg-white/20 backdrop-blur-md w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-white/30">
            <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L4 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-8-5zm0 18.5c-4.28-1.13-7-5.69-7-10.5V8.5l7-4 7 4V10c0 4.81-2.72 9.37-7 10.5z" opacity="0.3"/>
              <path d="M12 2L4 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-8-5zm7 15c0 4.81-2.72 9.37-7 10.5-4.28-1.13-7-5.69-7-10.5V8.5l7-4 7 4V17z"/>
            </svg>
          </div>
          
          <!-- Info -->
          <div class="flex-1">
            <p class="text-xs text-white/80 font-semibold uppercase tracking-widest mb-1">
              Centro de Distribución
            </p>
            <h2 class="text-xl font-bold text-white">
              Almacén Principal
            </h2>
          </div>
        </div>

        <!-- Indicador activo -->
        <div class="absolute top-3 right-3">
          <div class="relative">
            <div class="w-3 h-3 bg-green-400 rounded-full"></div>
            <div class="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
          </div>
        </div>
      </div>

      <!-- Body -->
      <div class="bg-gradient-to-b from-gray-50 to-white p-2 space-y-2">
        <!-- Ubicación -->
        <div class="flex items-start gap-2 bg-white rounded-xl p-2 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div class="bg-blue-500 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
            <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
          
          <div class="flex-1 min-w-0">
            <p class="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">
              Ubicación Principal
            </p>
            <p class="text-sm text-gray-900 font-semibold mb-1">Lima, Perú</p>
            <p class="text-xs text-gray-400 font-mono">
              ${WAREHOUSE_LOCATION.lat.toFixed(6)}, ${WAREHOUSE_LOCATION.lng.toFixed(6)}
            </p>
          </div>
        </div>


        <!-- Footer Info -->
        <div class="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <svg class="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
          </svg>
          <p class="text-xs text-amber-800 font-medium">Punto de inicio para todas las rutas</p>
        </div>
      </div>
    </div>
  `;
}

  