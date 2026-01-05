import { Component, inject, OnInit, output } from '@angular/core';
import * as L from 'leaflet';
import { ToastService } from '../../../../core/services/toast.service';

const LIMA_LIMITS = L.latLngBounds(L.latLng(-12.3, -77.2), L.latLng(-11.8, -76.8));

@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.html',
  styleUrl: './map.css',
})
export class Map implements OnInit {
  selectedLocationChange = output<{ lat: number; lng: number }>();

  private toastService = inject(ToastService);

  private locationMarker: L.Marker | undefined = undefined;
  private map: L.Map | undefined = undefined;

  ngOnInit(): void {
    this.map = L.map('map', {
      center: [-12.0464, -77.0428],
      zoom: 12,
      minZoom: 10,
      maxZoom: 15,
      maxBounds: LIMA_LIMITS,
      maxBoundsViscosity: 1.0,
    });

    this.map.on('click', (e: L.LeafletMouseEvent) => this.onMapClick(e));

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    this.getLocation();
  }

  getLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        this.map?.setView([lat, lng], 13);
        this.locationMarker = L.marker([lat, lng]);
        this.locationMarker.addTo(this.map!).bindPopup('Ubicación seleccionada').openPopup();
        this.selectedLocationChange.emit({ lat, lng });
      });
    }
  }

  onMapClick(e: L.LeafletMouseEvent) {
    if (!LIMA_LIMITS.contains(e.latlng)) {
      this.toastService.warning('Selecciona una ubicación dentro de Lima Metropolitana');
      return;
    }

    if (!this.locationMarker) {
      this.locationMarker = L.marker(e.latlng).addTo(this.map!).bindPopup('Ubicación seleccionada');
    } else {
      this.locationMarker.setLatLng(e.latlng);
    }

    this.locationMarker.openPopup();

    this.selectedLocationChange.emit({
      lat: e.latlng.lat,
      lng: e.latlng.lng,
    });
  }
}
