import { Injectable } from '@angular/core';
import type { GeoLocation, Order } from '../../../../core/models/route.model';

interface RoutePoint {
  location: GeoLocation;
  order: Order;
  distanceFromPrevious: number;
}
@Injectable({
  providedIn: 'root',
})
export class RouteOptimizerService {
  /**
   * Calcula la distancia entre dos puntos geográficos (fórmula de Haversine)
   */
  calculateDistance(point1: GeoLocation, point2: GeoLocation): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRad(point2.lat - point1.lat);
    const dLon = this.toRad(point2.lng - point1.lng);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(point1.lat)) * Math.cos(this.toRad(point2.lat)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Optimiza la ruta usando el algoritmo del vecino más cercano
   */
  optimizeRoute(startPoint: GeoLocation, orders: Order[]): Order[] {
    if (orders.length === 0) return [];
    if (orders.length === 1) return orders;

    const unvisited = [...orders];
    const optimized: Order[] = [];
    let currentLocation = startPoint;

    while (unvisited.length > 0) {
      let nearestIndex = 0;
      let minDistance = this.calculateDistance(
        currentLocation,
        unvisited[0].deliveryAddress.location
      );

      for (let i = 1; i < unvisited.length; i++) {
        const distance = this.calculateDistance(
          currentLocation,
          unvisited[i].deliveryAddress.location
        );

        if (distance < minDistance) {
          minDistance = distance;
          nearestIndex = i;
        }
      }

      const nearest = unvisited[nearestIndex];
      optimized.push(nearest);
      currentLocation = nearest.deliveryAddress.location;
      unvisited.splice(nearestIndex, 1);
    }

    return optimized;
  }

  /**
   * Calcula el tiempo estimado de viaje (asumiendo 30 km/h promedio)
   */
  calculateEstimatedTime(distance: number): number {
    const avgSpeed = 30; // km/h
    return (distance / avgSpeed) * 60; // minutos
  }

  /**
   * Calcula las estadísticas de una ruta
   */
  calculateRouteStats(startPoint: GeoLocation, orders: Order[]) {
    let totalDistance = 0;
    let currentPoint = startPoint;

    orders.forEach(order => {
      const distance = this.calculateDistance(currentPoint, order.deliveryAddress.location);
      totalDistance += distance;
      currentPoint = order.deliveryAddress.location;
    });

    return {
      totalDistance: totalDistance.toFixed(2),
      estimatedTime: Math.round(this.calculateEstimatedTime(totalDistance)),
      stops: orders.length,
    };
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
