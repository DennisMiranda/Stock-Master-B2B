import { Component, OnInit, OnDestroy, input, effect, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import * as L from 'leaflet';
import { Driver } from '../../../../../core/models/driver.model';
import { Order } from '../../../../../core/models/order.model';
import { Delivery } from '../../../../../core/models/delivery.model';
import { Route } from '../../../../../core/models/route.model';

@Component({
  selector: 'app-map-router',
  imports: [CommonModule],
  templateUrl: './map-router.component.html',
  styleUrl: './map-router.component.css',
})
export class MapRouterComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private map?: L.Map;
  private markers: L.Marker[] = [];
  private polylines: L.Polyline[] = [];
  private warehouseMarker?: L.Marker;

  // Coordenadas de la distribuidora
  private readonly WAREHOUSE_LOCATION = {
    lat: -12.087458,
    lng: -77.033026
  };

  // Inputs
  drivers = input<Driver[]>([]);
  orders = input<Order[]>([]);
  entregas = input<Delivery[]>([]);
  routes = input<Route[]>([]);

  constructor() {
    effect(() => {
      if (this.map) {
        this.updateMap();
      }
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initMap();
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    this.map = L.map('map').setView([-12.0464, -77.0428], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Agregar marcador de la distribuidora
    this.addWarehouseMarker();
    this.updateMap();
  }

  private updateMap(): void {
    if (!this.map) return;

    this.clearMap();
    this.drawRoutes();
    this.drawOrderMarkers();
    this.drawDriverMarkers();
    this.fitMapBounds();
  }

  /**
   * ✨ NUEVO: Marcador de la distribuidora
   */
  private addWarehouseMarker(): void {
    if (this.warehouseMarker) {
      this.warehouseMarker.remove();
    }

    this.warehouseMarker = L.marker(
      [this.WAREHOUSE_LOCATION.lat, this.WAREHOUSE_LOCATION.lng],
      { icon: this.createWarehouseIcon() }
    ).addTo(this.map!);

    this.warehouseMarker.bindPopup(this.createWarehousePopup());
  }

  private drawRoutes(): void {
    this.routes().forEach(route => {
      if (route.geometry?.coordinates && route.geometry.coordinates.length > 0) {
        const latLngs: L.LatLngExpression[] = route.geometry.coordinates.map(
          coord => [coord[1], coord[0]] as L.LatLngExpression
        );

        const color = this.getRouteColor(route.status);

        const polyline = L.polyline(latLngs, {
          color: color,
          weight: 5,
          opacity: 0.8,
          smoothFactor: 1,
          dashArray: route.status === 'PLANNED' ? '10, 10' : undefined
        }).addTo(this.map!);

        polyline.bindPopup(this.createRoutePopup(route));
        this.polylines.push(polyline);
      }
    });
  }

  private drawOrderMarkers(): void {
    this.orders().forEach(order => {
      const marker = L.marker([
        order.deliveryAddress.location.lat,
        order.deliveryAddress.location.lng
      ], {
        icon: this.createOrderIcon(order.status!)
      }).addTo(this.map!);

      marker.bindPopup(this.createOrderPopup(order));
      this.markers.push(marker);
    });
  }

  private drawDriverMarkers(): void {
    this.drivers().forEach(driver => {
      if (driver.location) {
        const marker = L.marker([
          driver.location.lat,
          driver.location.lng
        ], {
          icon: this.createDriverIcon()
        }).addTo(this.map!);

        marker.bindPopup(this.createDriverPopup(driver));
        this.markers.push(marker);
      }
    });
  }

  private fitMapBounds(): void {
    const allFeatures = [...this.markers, ...this.polylines];
    if (this.warehouseMarker) {
      allFeatures.push(this.warehouseMarker);
    }
    
    if (allFeatures.length > 0) {
      const group = L.featureGroup(allFeatures);
      this.map!.fitBounds(group.getBounds().pad(0.15));
    }
  }

  private clearMap(): void {
    this.markers.forEach(marker => marker.remove());
    this.polylines.forEach(polyline => polyline.remove());
    this.markers = [];
    this.polylines = [];
  }
  private createWarehouseIcon(): L.DivIcon {
    return L.divIcon({
      className: 'custom-icon',
      html: `
        <div style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 4px solid white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        ">
          <svg width="26" height="26" fill="white" viewBox="0 0 24 24">
            <path d="M4 21V10L12 3L20 10V21H14V14H10V21H4Z" opacity="0.3"/>
            <path d="M12 3L4 9V21H9V14H15V21H20V9L12 3Z"/>
          </svg>
          <div style="
            position: absolute;
            bottom: -3px;
            right: -3px;
            background: #22c55e;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            border: 3px solid white;
            animation: pulse 2s infinite;
          "></div>
        </div>
        <style>
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
          }
        </style>
      `,
      iconSize: [50, 50],
      iconAnchor: [25, 50],
      popupAnchor: [0, -50]
    });
  }

  private createOrderIcon(status: string): L.DivIcon {
    const colors: Record<string, string> = {
      'CREATED': '#EAB308',
      'IN_PACKING': '#3B82F6',
      'READY': '#10B981',
      'DELIVERED': '#6B7280',
      'CANCELLED': '#EF4444'
    };

    const color = colors[status] || '#6B7280';

    return L.divIcon({
      className: 'custom-icon',
      html: `
        <div style="
          background: ${color};
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 3px 10px rgba(0,0,0,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
            <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z"/>
          </svg>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36]
    });
  }

  private createDriverIcon(): L.DivIcon {
    return L.divIcon({
      className: 'custom-icon',
      html: `
        <div style="
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="22" height="22" fill="white" viewBox="0 0 24 24">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
          </svg>
        </div>
      `,
      iconSize: [42, 42],
      iconAnchor: [21, 42],
      popupAnchor: [0, -42]
    });
  }

  private getRouteColor(status: string): string {
    const colors: Record<string, string> = {
      'PLANNED': '#3B82F6',
      'IN_PROGRESS': '#8B5CF6',
      'COMPLETED': '#10B981',
      'CANCELLED': '#EF4444'
    };
    return colors[status] || '#6B7280';
  }

  private getRouteStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'PLANNED': 'bg-blue-100 text-blue-800',
      'IN_PROGRESS': 'bg-purple-100 text-purple-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  private getRouteStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PLANNED': 'Planificada',
      'IN_PROGRESS': 'En Progreso',
      'COMPLETED': 'Completada',
      'CANCELLED': 'Cancelada'
    };
    return labels[status] || status;
  }

  private getRouteStatusColor(status: string): { gradient: [string, string] } {
    const colors: Record<string, { gradient: [string, string] }> = {
      'PLANNED': { gradient: ['#3b82f6', '#2563eb'] },
      'IN_PROGRESS': { gradient: ['#8b5cf6', '#7c3aed'] },
      'COMPLETED': { gradient: ['#10b981', '#059669'] },
      'CANCELLED': { gradient: ['#ef4444', '#dc2626'] }
    };
    return colors[status] || { gradient: ['#6b7280', '#4b5563'] };
  }

  private getOrderStatusColor(status: string): { gradient: [string, string] } {
    const colors: Record<string, { gradient: [string, string] }> = {
      'CREATED': { gradient: ['#f59e0b', '#d97706'] },
      'IN_PACKING': { gradient: ['#3b82f6', '#2563eb'] },
      'READY': { gradient: ['#10b981', '#059669'] },
      'DELIVERED': { gradient: ['#6b7280', '#4b5563'] },
      'CANCELLED': { gradient: ['#ef4444', '#dc2626'] }
    };
    return colors[status] || { gradient: ['#6b7280', '#4b5563'] };
  }

  private getOrderStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'CREATED': 'Creado',
      'IN_PACKING': 'Empaquetando',
      'READY': 'Listo',
      'DELIVERED': 'Entregado',
      'CANCELLED': 'Cancelado'
    };
    return labels[status] || status;
  }

  private getDriverStatusColorScheme(status: string): { 
    gradient: [string, string];
    bg: string;
    border: string;
    text: string;
  } {
    const schemes: Record<string, any> = {
      'AVAILABLE': {
        gradient: ['#10b981', '#059669'],
        bg: '#d1fae5',
        border: '#10b981',
        text: '#065f46'
      },
      'ASSIGNED': {
        gradient: ['#3b82f6', '#2563eb'],
        bg: '#dbeafe',
        border: '#3b82f6',
        text: '#1e40af'
      },
      'ON_ROUTE': {
        gradient: ['#8b5cf6', '#7c3aed'],
        bg: '#ede9fe',
        border: '#8b5cf6',
        text: '#5b21b6'
      },
      'OFFLINE': {
        gradient: ['#6b7280', '#4b5563'],
        bg: '#f3f4f6',
        border: '#6b7280',
        text: '#374151'
      }
    };
    return schemes[status] || schemes['OFFLINE'];
  }

  private getDriverStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'AVAILABLE': 'Disponible',
      'ASSIGNED': 'Asignado',
      'ON_ROUTE': 'En Ruta',
      'OFFLINE': 'Desconectado'
    };
    return labels[status] || status;
  }

  private getDriverStatusClass(status: string): string {
  const classes: Record<string, string> = {
    'AVAILABLE': 'bg-green-100 text-green-800',
    'ASSIGNED': 'bg-blue-100 text-blue-800',
    'ON_ROUTE': 'bg-purple-100 text-purple-800',
    'OFFLINE': 'bg-gray-100 text-gray-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
}

renderWarehouseCard(): string {
  return `
    <div style="
      background: rgba(255,255,255,0.2);
      backdrop-filter: blur(10px);
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg width="28" height="28" fill="white" viewBox="0 0 24 24">
        <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
        <path d="M3 2h18v20H3z" opacity="0.3"/>
      </svg>
    </div>
    <div style="flex: 1;">
      <div style="font-size: 11px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
        Centro de Distribución
      </div>
      <div style="font-size: 18px; font-weight: 700; margin-top: 2px;">
        Almacén Principal
      </div>
    </div>
  </div>
</div>

<!-- Body -->
<div style="padding: 20px; background: white;">
  <!-- Location -->
  <div style="
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
    background: #f8fafc;
    border-radius: 8px;
    margin-bottom: 12px;
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
      <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    </div>
    <div style="flex: 1;">
      <div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
        Ubicación
      </div>
      <div style="font-size: 13px; color: #1e293b; font-weight: 500; line-height: 1.4;">
        Lima, Perú
      </div>
      <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">
        ${this.WAREHOUSE_LOCATION.lat.toFixed(6)}, ${this.WAREHOUSE_LOCATION.lng.toFixed(6)}
      </div>
    </div>
  </div>

  <!-- Stats Grid -->
  <div style="
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  ">
    <div style="
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      padding: 12px;
      border-radius: 8px;
      text-align: center;
    ">
      <div style="font-size: 20px; font-weight: 700; color: white; margin-bottom: 2px;">
        ${this.routes().length}
      </div>
      <div style="font-size: 10px; color: rgba(255,255,255,0.9); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
        Rutas Activas
      </div>
    </div>
    <div style="
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      padding: 12px;
      border-radius: 8px;
      text-align: center;
    ">
      <div style="font-size: 20px; font-weight: 700; color: white; margin-bottom: 2px;">
        ${this.orders().length}
      </div>
      <div style="font-size: 10px; color: rgba(255,255,255,0.9); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
        Pedidos
      </div>
    </div>
  </div>
</div>
</div>
`;
}

  private createWarehousePopup(): string {
    return `
      <div style="
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        min-width: 280px;
        padding: 0;
        margin: -15px;
      ">
        <!-- Header con gradiente -->
        <div style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
          border-radius: 12px 12px 0 0;
          color: white;
        ">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
            <div style="
              background: rgba(255,255,255,0.2);
              backdrop-filter: blur(10px);
              width: 48px;
              height: 48px;
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <svg width="28" height="28" fill="white" viewBox="0 0 24 24">
                <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
                <path d="M3 2h18v20H3z" opacity="0.3"/>
              </svg>
            </div>
            <div style="flex: 1;">
              <div style="font-size: 11px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                Centro de Distribución
              </div>
              <div style="font-size: 18px; font-weight: 700; margin-top: 2px;">
                Almacén Principal
              </div>
            </div>
          </div>
        </div>

        <!-- Body -->
        <div style="padding: 20px; background: white;">
          <!-- Location -->
          <div style="
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 12px;
            background: #f8fafc;
            border-radius: 8px;
            margin-bottom: 12px;
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
              <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <div style="flex: 1;">
              <div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
                Ubicación
              </div>
              <div style="font-size: 13px; color: #1e293b; font-weight: 500; line-height: 1.4;">
                Lima, Perú
              </div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">
                ${this.WAREHOUSE_LOCATION.lat.toFixed(6)}, ${this.WAREHOUSE_LOCATION.lng.toFixed(6)}
              </div>
            </div>
          </div>

          <!-- Stats Grid -->
          <div style="
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          ">
            <div style="
              background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
              padding: 12px;
              border-radius: 8px;
              text-align: center;
            ">
              <div style="font-size: 20px; font-weight: 700; color: white; margin-bottom: 2px;">
                ${this.routes().length}
              </div>
              <div style="font-size: 10px; color: rgba(255,255,255,0.9); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                Rutas Activas
              </div>
            </div>
            <div style="
              background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
              padding: 12px;
              border-radius: 8px;
              text-align: center;
            ">
              <div style="font-size: 20px; font-weight: 700; color: white; margin-bottom: 2px;">
                ${this.orders().length}
              </div>
              <div style="font-size: 10px; color: rgba(255,255,255,0.9); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                Pedidos
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }


  private createOrderPopup(order: Order): string {
    const statusColor = this.getOrderStatusColor(order.status!);
    const statusLabel = this.getOrderStatusLabel(order.status!);

    return `
      <div style="
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        min-width: 300px;
        padding: 0;
        margin: -15px;
      ">
        <!-- Header -->
        <div style="
          background: linear-gradient(135deg, ${statusColor.gradient[0]} 0%, ${statusColor.gradient[1]} 100%);
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


  private createRoutePopup(route: Route): string {
    const statusColor = this.getRouteStatusColor(route.status);
    const statusLabel = this.getRouteStatusLabel(route.status);

    return `
      <div style="
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        min-width: 280px;
        padding: 0;
        margin: -15px;
      ">
        <!-- Header -->
        <div style="
          background: linear-gradient(135deg, ${statusColor.gradient[0]} 0%, ${statusColor.gradient[1]} 100%);
          padding: 16px 20px;
          border-radius: 12px 12px 0 0;
          color: white;
        ">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="
              background: rgba(255,255,255,0.2);
              backdrop-filter: blur(10px);
              width: 44px;
              height: 44px;
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
              </svg>
            </div>
            <div style="flex: 1;">
              <div style="font-size: 10px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                Ruta de Entrega
              </div>
              <div style="font-size: 18px; font-weight: 700; margin-top: 3px;">
                #${route.id}
              </div>
            </div>
          </div>
          <div style="
            margin-top: 12px;
            background: rgba(255,255,255,0.15);
            backdrop-filter: blur(10px);
            padding: 8px 12px;
            border-radius: 6px;
            display: inline-block;
          ">
            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
              ${statusLabel}
            </span>
          </div>
        </div>

        <!-- Body -->
        <div style="padding: 16px; background: white;">
          <!-- Stats -->
          <div style="
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            margin-bottom: 12px;
          ">
            <div style="
              background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
              padding: 12px 8px;
              border-radius: 8px;
              text-align: center;
            ">
              <div style="font-size: 20px; font-weight: 700; color: white; margin-bottom: 2px;">
                ${route.orders.length}
              </div>
              <div style="font-size: 9px; color: rgba(255,255,255,0.9); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                Pedidos
              </div>
            </div>
            <div style="
              background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
              padding: 12px 8px;
              border-radius: 8px;
              text-align: center;
            ">
              <div style="font-size: 20px; font-weight: 700; color: white; margin-bottom: 2px;">
                ${route.districts?.length || 0}
              </div>
              <div style="font-size: 9px; color: rgba(255,255,255,0.9); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                Distritos
              </div>
            </div>
            <div style="
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              padding: 12px 8px;
              border-radius: 8px;
              text-align: center;
            ">
              <div style="font-size: 18px; font-weight: 700; color: white; margin-bottom: 2px;">
                ${Math.round((route.geometry?.coordinates?.length || 0) / 100)}km
              </div>
              <div style="font-size: 9px; color: rgba(255,255,255,0.9); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                Distancia
              </div>
            </div>
          </div>

          ${route.districts && route.districts.length > 0 ? `
            <div style="
              background: #f8fafc;
              border-radius: 8px;
              padding: 12px;
            ">
              <div style="
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 8px;
              ">
                <svg width="14" height="14" fill="#64748b" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <span style="font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                  Distritos de Entrega
                </span>
              </div>
              <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                ${route.districts.map(district => `
                  <span style="
                    background: white;
                    border: 1px solid #e2e8f0;
                    padding: 4px 10px;
                    border-radius: 12px;
                    font-size: 11px;
                    color: #475569;
                    font-weight: 500;
                  ">${district}</span>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  private createDriverPopup(driver: Driver): string {
  const statusColor = this.getDriverStatusColorScheme(driver.status);

  return `
    <div style="
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-width: 280px;
      padding: 0;
      margin: -15px;
    ">
      <!-- Header -->
      <div style="
        background: linear-gradient(135deg, ${statusColor.gradient[0]} 0%, ${statusColor.gradient[1]} 100%);
        padding: 20px;
        border-radius: 12px 12px 0 0;
        color: white;
      ">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="
            background: rgba(255,255,255,0.25);
            backdrop-filter: blur(10px);
            width: 56px;
            height: 56px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            font-weight: 700;
          ">
            ${driver.displayName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'}
          </div>
          <div style="flex: 1;">
            <div style="font-size: 16px; font-weight: 700; margin-bottom: 4px;">
              ${driver.displayName || 'Conductor desconocido'}
            </div>
            <div style="font-size: 12px; opacity: 0.9;">
              ${driver.email || 'Sin correo'}
            </div>
            <div style="font-size: 12px; opacity: 0.9;">
              ${driver.phone || 'Sin teléfono'}
            </div>
          </div>
        </div>
      </div>

      <!-- Body -->
      <div style="padding: 16px; background: white; border-radius: 0 0 12px 12px;">
        <div style="margin-bottom: 12px;">
          <span style="
            display: inline-block;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            background: ${statusColor.bg};
            color: ${statusColor.text};
          ">
            ${driver.status}
          </span>
        </div>

        <div style="font-size: 13px; color: #1e293b; margin-bottom: 8px;">
          <strong>Vehículo:</strong> ${driver.vehicle || 'No asignado'}
        </div>

        <div style="font-size: 13px; color: #1e293b; margin-bottom: 8px;">
          <strong>Ruta actual:</strong> ${driver.currentRouteId || 'Ninguna'}
        </div>

        <div style="font-size: 13px; color: #1e293b;">
          <strong>Pedidos asignados:</strong> ${driver.orders?.length || 0}
        </div>
      </div>
    </div>
  `;
}

}