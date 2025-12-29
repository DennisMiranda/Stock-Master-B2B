import { Component, OnInit, OnDestroy, input, effect, computed, inject } from '@angular/core';
import {
  LucideAngularModule,
  RefreshCw,
  Target,
  Warehouse,
  Package,
  Truck,
  MapPin,
  LucideIconData,
} from 'lucide-angular';
import * as L from 'leaflet';
import type { Driver, Order, Delivery, Route } from '../../../../../core/models/route.model';

import { PopupBuilderService } from '../../services/popup-builder.service';
import { RouteOptimizerService } from '../../services/route-optimizer.service';
import { linceGeometry, viasData } from '../../../../../data/distrito';

import { DomSanitizer } from '@angular/platform-browser';

interface MapConfig {
  center: [number, number];
  distributor: [number, number];
  zoom: number;
  minZoom: number;
  maxZoom: number;
}

interface MapColors {
  distributor: string;
  order: string;
  delivery: string;
  route: string;
  district: string;
  avenue: string;
  street: string;
}
@Component({
  selector: 'app-map-router',
  imports: [LucideAngularModule],
  templateUrl: './map-router.html',
  styleUrl: './map-router.css',
})
export class MapRouter implements OnInit, OnDestroy {
  RefreshCwIcon = RefreshCw;
  TargetIcon = Target;
  WarehouseIcon = Warehouse;
  PackageIcon = Package;
  TruckIcon = Truck;
  MapPinIcon = MapPin;

  // Inputs
  drivers = input<Driver[]>([]);
  orders = input<Order[]>([]);
  routes = input<Route[]>([]);
  entregas = input<Delivery[]>([]);


  stats = computed(() => ({
    totalDrivers: this.drivers().length,
    availableDrivers: this.drivers().filter((d) => d.status === 'AVAILABLE').length,
    activeOrders: this.orders().filter((o) => !o.delivered).length,
    onRouteDeliveries: this.entregas().filter((d) => d.status === 'ON_ROUTE').length,
  }));


  private sanitizer = inject(DomSanitizer);
  private popupService = inject(PopupBuilderService);
  private routeOptimizer = inject(RouteOptimizerService);


  private map!: L.Map;
  private markers: L.Marker[] = [];
  private polylines: L.Polyline[] = [];
  private geoJsonLayers: L.GeoJSON[] = [];

  private readonly CONFIG = {
    center: { lat: -12.084984, lng: -77.034583 },
    distributor: { lat: -12.087458, lng: -77.033026 },
    zoom: 15,
    minZoom: 13,
    maxZoom: 18,
  };

  private readonly COLORS = {
    distributor: '#4F46E5',
    order: '#10B981',
    delivery: '#F59E0B',
    route: '#8B5CF6',
    district: '#2563EB',
    avenue: '#EF4444',
    street: '#6B7280',
  };

  constructor() {
    effect(() => {
      if (this.map) {
        this.updateAllLayers();
      }
    });
  }

  ngOnInit(): void {
    this.initializeMap();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  // Métodos públicos
  refreshMap(): void {
    this.updateAllLayers();
  }

  resetView(): void {
    this.map?.setView(this.CONFIG.center, this.CONFIG.zoom);
  }

  // Inicialización
  private initializeMap(): void {
    this.createMapInstance();
    this.addBaseTileLayer();
    this.addDistributorMarker();
    this.addGeoJsonLayers();
    this.addMapControls();
    this.updateAllLayers();
  }

  private createMapInstance(): void {
    this.map = L.map('mapRouter', {
      center: this.CONFIG.center,
      zoom: this.CONFIG.zoom,
      minZoom: this.CONFIG.minZoom,
      maxZoom: this.CONFIG.maxZoom,
      zoomControl: false,
    });
  }

  private addBaseTileLayer(): void {
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
      detectRetina: true,
    }).addTo(this.map);
  }

  private addDistributorMarker(): void {
    const icon = this.createMarkerIcon(this.COLORS.distributor, '🏢', 12);

    L.marker(this.CONFIG.distributor, { icon })
      .bindPopup(this.popupService.buildDistributorPopup())
      .addTo(this.map);
  }

  private addGeoJsonLayers(): void {
    const districtLayer = L.geoJSON(linceGeometry as any, {
      style: {
        color: this.COLORS.district,
        weight: 2,
        fillColor: '#93C5FD',
        fillOpacity: 0.1,
      },
      interactive: false,
    }).addTo(this.map);

    const roadsLayer = L.geoJSON(viasData as any, {
      style: (feature) => ({
        color: feature?.properties?.tipo === 'AV' ? this.COLORS.avenue : this.COLORS.street,
        weight: feature?.properties?.tipo === 'AV' ? 3 : 1,
        opacity: 0.6,
      }),
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`
          <div class="p-2 font-sans">
            <h4 class="font-bold text-gray-800 text-sm">${feature.properties?.nombre}</h4>
            <p class="text-xs text-gray-600">Tipo: ${feature.properties?.tipo}</p>
          </div>
        `);
      },
    });

    this.geoJsonLayers.push(districtLayer, roadsLayer);

    L.control
      .layers(
        {},
        {
          '🗺️ Distrito Lince': districtLayer,
          '🛣️ Vías': roadsLayer,
        },
        { collapsed: true, position: 'topright' }
      )
      .addTo(this.map);
  }

  private addMapControls(): void {
    L.control.zoom({ position: 'topright' }).addTo(this.map);
  }

  // Actualización de capas
  private updateAllLayers(): void {
    this.clearMarkers();
    this.clearPolylines();
    this.addOrderMarkers();
    this.addDeliveryMarkers();
    this.drawRoutes();
  }

  private clearMarkers(): void {
    this.markers.forEach((m) => m.remove());
    this.markers = [];
  }

  private clearPolylines(): void {
    this.polylines.forEach((p) => p.remove());
    this.polylines = [];
  }

  // Crear iconos con emoji
  private createMarkerIcon(color: string, emoji: string, size: number = 10): L.DivIcon {
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="flex items-center justify-center w-${size} h-${size} rounded-full shadow-lg border-2 border-white transition-transform hover:scale-110"
             style="background-color: ${color}">
          <span class="text-white text-lg ">${emoji}</span>
          
        </div>
      `,
      iconSize: [size * 4, size * 4],
      iconAnchor: [size * 2, size * 4],
    });
  }

  // Marcadores
  private addOrderMarkers(): void {
    this.orders()
      .filter((order) => !order.delivered)
      .forEach((order) => {
        const icon = this.createMarkerIcon(this.COLORS.order, '📦', 10);
        const assignedDriver = this.drivers().find((d) => d.orders?.includes(order.id));
        const popup = this.popupService.buildOrderPopup(order, assignedDriver);

        const marker = L.marker(
          [order.deliveryAddress.location.lat, order.deliveryAddress.location.lng],
          { icon }
        ).bindPopup(popup);

        marker.addTo(this.map);
        this.markers.push(marker);
      });
  }

  private addDeliveryMarkers(): void {
    this.entregas().forEach((delivery) => {
      const icon = this.createMarkerIcon(this.COLORS.delivery, '🚚', 10);
      const order = this.orders().find((o) => o.id === delivery.orderId);
      const popup = this.popupService.buildDeliveryPopup(delivery, order);

      const marker = L.marker([delivery.currentLocation.lat, delivery.currentLocation.lng], {
        icon,
      }).bindPopup(popup);

      marker.addTo(this.map);
      this.markers.push(marker);
    });
  }

  // Dibujar rutas optimizadas
  private drawRoutes(): void {
    this.drivers()
      .filter((d) => d.assignedRoute && d.orders?.length)
      .forEach((driver) => {
        const driverOrders = this.orders().filter((o) => driver.orders?.includes(o.id));

        if (driverOrders.length === 0) return;

        const optimizedOrders = this.routeOptimizer.optimizeRoute(
          this.CONFIG.distributor,
          driverOrders
        );

        const routePoints: L.LatLngExpression[] = [
          this.CONFIG.distributor,
          ...optimizedOrders.map(
            (o) =>
              [o.deliveryAddress.location.lat, o.deliveryAddress.location.lng] as L.LatLngExpression
          ),
        ];

        const stats = this.routeOptimizer.calculateRouteStats(
          this.CONFIG.distributor,
          optimizedOrders
        );

        const polyline = L.polyline(routePoints, {
          color: this.COLORS.route,
          weight: 3,
          opacity: 0.6,
          dashArray: '10, 10',
        }).bindPopup(
          this.popupService.buildRoutePopup(
            driver.assignedRoute!,
            driver.displayName!,
            optimizedOrders.length,
            stats
          )
        );

        polyline.addTo(this.map);
        this.polylines.push(polyline);
      });
  }

  // Limpieza
  private cleanup(): void {
    this.clearMarkers();
    this.clearPolylines();
    this.geoJsonLayers.forEach((layer) => layer.remove());
    this.geoJsonLayers = [];
    this.map?.remove();
  }
}
