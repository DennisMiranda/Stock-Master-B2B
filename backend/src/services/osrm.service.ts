import { getOSRMUrl } from '../config/osrm';

interface Coordinate {
  lat: number;
  lng: number;
}

interface OSRMRoute {
  distance: number; // metros
  duration: number; // segundos
  geometry: {
    type: 'LineString';
    coordinates: [number, number][];
  };
}

interface OSRMResponse {
  code: string;
  routes: OSRMRoute[];
  trips?: OSRMRoute[];
  waypoints?: { waypoint_index: number }[];
}

export class OSRMService {

  async calculateRoute(coordinates: Coordinate[]): Promise<OSRMRoute> {
    const coords = coordinates.map(c => `${c.lng},${c.lat}`).join(';');
    const url = `${getOSRMUrl('route')}/${coords}`;

    const response = await fetch(
      url + '?' + new URLSearchParams({
        overview: 'full',
        geometries: 'geojson',
        steps: 'false',
      })
    );

    const data = await response.json() as OSRMResponse;

    if (data.code !== 'Ok') {
      throw new Error('No se pudo calcular la ruta');
    }

    const route = data.routes[0];
    return {
      distance: route!.distance,
      duration: route!.duration,
      geometry: route!.geometry,
    };
  }


  async optimizeRoute(coordinates: Coordinate[]): Promise<{
    optimizedOrder: number[];
    route: OSRMRoute;
  }> {
    const coords = coordinates.map(c => `${c.lng},${c.lat}`).join(';');
    const url = `${getOSRMUrl('trip')}/${coords}`;

    const response = await fetch(
      url + '?' + new URLSearchParams({
        overview: 'full',
        geometries: 'geojson',
        steps: 'false',
        source: 'first', 
      })
    );

    const data = await response.json() as OSRMResponse;

    if (data.code !== 'Ok') {
      throw new Error('No se pudo optimizar la ruta');
    }

    const trip = data.trips![0];
    const waypoints = data.waypoints!;

    return {
      optimizedOrder: waypoints.map((wp) => wp.waypoint_index),
      route: {
        distance: trip!.distance,
        duration: trip!.duration,
        geometry: trip!.geometry,
      },
    };
  }

  async calculateDistance(from: Coordinate, to: Coordinate): Promise<number> {
    const route = await this.calculateRoute([from, to]);
    return route.distance / 1000; // convertir a km
  }
}

export const osrmService = new OSRMService();
