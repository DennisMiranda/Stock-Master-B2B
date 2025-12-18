import { Component, OnInit, output } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.html',
  styleUrl: './map.css',
})
export class Map implements OnInit {
  selectedLocationChange = output<{ lat: number; lng: number }>();

  private locationMarker: L.Marker | undefined = undefined;
  private map: L.Map | undefined = undefined;

  ngOnInit(): void {
    this.map = L.map('map').setView([51.505, -0.09], 13);
    this.map.on('click', (e) => this.onMapClick(e));

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
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
    this.selectedLocationChange.emit({ lat: e.latlng.lat, lng: e.latlng.lng });
    this.locationMarker?.setLatLng(e.latlng);
    this.locationMarker?.openPopup();
  }
}
