import {
  Component,
  OnInit,
  OnDestroy,
  input,
  effect,
  PLATFORM_ID,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import * as L from 'leaflet';
import { Driver } from '../../../../../core/models/driver.model';
import { Order } from '../../../../../core/models/order.model';
import { Delivery } from '../../../../../core/models/delivery.model';
import { Route } from '../../../../../core/models/route.model';
import { createWarehouseIcon } from '../../icons/warehouse-icon';
import { createOrderIcon } from '../../icons/order-icon';
import { createOrderPopup } from '../../popups/order-popup';
import { createWarehousePopup } from '../../popups/warehouse-popup';
import { createRoutePopup } from '../../popups/route-popup';
import { WAREHOUSE_LOCATION } from '../../config/location';
@Component({
  selector: 'app-map-router',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-router.component.html',
  styleUrl: './map-router.component.css',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class MapRouterComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private map?: L.Map;
  private markers: L.Marker[] = [];
  private polylines: L.Polyline[] = [];
  private warehouseMarker?: L.Marker;
  private readonly WAREHOUSE_LOCATION = WAREHOUSE_LOCATION;
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
  this.map = L.map('map', {
    center: [-12.0464, -77.0428],
    zoom: 14,
    minZoom: 10,  
    maxZoom: 18    
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
  }).addTo(this.map);

  this.updateMap();
  this.addWarehouseMarker();
}



  private updateMap(): void {
    if (!this.map) return;

    this.clearMap();
    this.drawRoutes();
    this.drawOrderMarkers();
    this.fitMapBounds();
  }

  /**
   * ✅ Agregar marcador de la distribuidora
   */
  private addWarehouseMarker(): void {
    if (this.warehouseMarker) {
      this.warehouseMarker.remove();
    }

    this.warehouseMarker = L.marker([this.WAREHOUSE_LOCATION.lat, this.WAREHOUSE_LOCATION.lng], {
      icon: createWarehouseIcon(),
    }).addTo(this.map!);

    this.warehouseMarker.bindPopup(createWarehousePopup(this.WAREHOUSE_LOCATION), {
      className: 'warehouse-popup',
    });
  }
  /**
   * ✅ Dibujar rutas en el mapa
   */
  private drawRoutes(): void {
    this.routes().forEach((route) => {
      if (route.geometry?.coordinates && route.geometry.coordinates.length > 0) {
        const latLngs: L.LatLngExpression[] = route.geometry.coordinates.map(
          (coord) => [coord[1], coord[0]] as L.LatLngExpression
        );

        const color = this.getRouteColor(route.status);

        const polyline = L.polyline(latLngs, {
          color: color,
          weight: 5,
          opacity: 0.8,
          smoothFactor: 1,
          dashArray: route.status === 'PLANNED' ? '10, 10' : undefined,
        }).addTo(this.map!);

        // ✅ Agregar popup a la ruta
        polyline.bindPopup(createRoutePopup(route), { className: 'warehouse-popup' });
        this.polylines.push(polyline);
      }
    });
  }

  /**
   * ✅ Dibujar marcadores de pedidos
   */
  private drawOrderMarkers(): void {
    this.orders().forEach((order) => {
      const marker = L.marker(
        [order.deliveryAddress.location.lat, order.deliveryAddress.location.lng],
        { icon: createOrderIcon(order.status!) }
      ).addTo(this.map!);

      marker.bindPopup(createOrderPopup(order), { className: 'warehouse-popup' });
      this.markers.push(marker);
    });
  }

  /**
   * ✅ Dibujar marcadores de conductores
   */
  

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
    this.markers.forEach((marker) => marker.remove());
    this.polylines.forEach((polyline) => polyline.remove());
    this.markers = [];
    this.polylines = [];
  }

  private getRouteColor(status: string): string {
    const colors: Record<string, string> = {
      PLANNED: '#3B82F6',
      IN_PROGRESS: '#8B5CF6',
      COMPLETED: '#10B981',
      CANCELLED: '#EF4444',
    };
    return colors[status] || '#6B7280';
  }
}
