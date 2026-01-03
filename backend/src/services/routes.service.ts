import { db, COLLECTIONS } from "../config/firebase";
import { Route, RouteStatus, RouteParsed } from "../models/route.model";
import { Order } from "../models/order.model";
import { osrmService } from "./osrm.service";
import { normalizeGeometry, parseGeometry } from "../utils/geometry";

interface CreateRouteData {
  driverId: string;
  orderIds: string[];
  startLocation: { lat: number; lng: number };
}

interface OptimizedRouteResult {
  route: RouteParsed;
  distance: number;
  duration: number;
  optimizedOrderIds: string[];
}

export class RoutesService {
  private collection = COLLECTIONS.ROUTES;

  private parseRoute(route: Route): RouteParsed {
    const geometry = parseGeometry(route.geometry);
    if (!geometry) {
      throw new Error("Invalid geometry in route");
    }
    return {
      ...route,
      geometry,
    };
  }

  async getAll(): Promise<RouteParsed[]> {
    const snapshot = await db.collection(this.collection).get();
    const routes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Route[];

    return routes.map((route) => this.parseRoute(route));
  }

  async getById(id: string): Promise<RouteParsed | null> {
    const doc = await db.collection(this.collection).doc(id).get();
    if (!doc.exists) return null;

    const route = { id: doc.id, ...doc.data() } as Route;
    return this.parseRoute(route);
  }

  async getByDriver(driverId: string): Promise<RouteParsed[]> {
    const snapshot = await db
      .collection(this.collection)
      .where("driverId", "==", driverId)
      .get();

    const routes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Route[];

    return routes.map((route) => this.parseRoute(route));
  }

  async getByStatus(status: RouteStatus): Promise<RouteParsed[]> {
    const snapshot = await db
      .collection(this.collection)
      .where("status", "==", status)
      .get();

    const routes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Route[];

    return routes.map((route) => this.parseRoute(route));
  }

  async create(data: Omit<Route, "id" | "createdAt">): Promise<Route> {
    const routeData = {
      ...data,
      createdAt: Date.now(),
    };

    console.log(
      "📝 Creating route with data:",
      JSON.stringify(routeData, null, 2)
    );

    const docRef = await db.collection(this.collection).add(routeData);
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as Route;
  }

  async update(id: string, data: Partial<Route>): Promise<Route> {
    await db.collection(this.collection).doc(id).update(data);
    const doc = await db.collection(this.collection).doc(id).get();
    return { id: doc.id, ...doc.data() } as Route;
  }

  async updateStatus(id: string, status: RouteStatus): Promise<RouteParsed> {
    const route = await this.update(id, { status });
    return this.parseRoute(route);
  }

  async delete(id: string): Promise<void> {
    await db.collection(this.collection).doc(id).delete();
  }


  async createOptimized(data: CreateRouteData): Promise<OptimizedRouteResult> {
    const { driverId, orderIds, startLocation } = data;

    console.log("🚀 Starting route optimization...");
    console.log("Driver:", driverId);
    console.log("Orders:", orderIds);
    console.log("Start location:", startLocation);

    // Obtener pedidos
    const ordersPromises = orderIds.map((id) =>
      db.collection(COLLECTIONS.ORDERS).doc(id).get()
    );
    const ordersDocs = await Promise.all(ordersPromises);

    const orders: Order[] = ordersDocs
      .filter((doc) => doc.exists)
      .map((doc) => ({ id: doc.id, ...doc.data() } as Order));

    if (orders.length === 0) {
      throw new Error("No se encontraron pedidos válidos");
    }

    console.log(`✅ Found ${orders.length} valid orders`);

    const coordinates = [
      startLocation,
      ...orders.map((o) => o.deliveryAddress.location),
    ];

    console.log("📍 Coordinates:", coordinates);

    const { optimizedOrder, route: osrmRoute } =
      await osrmService.optimizeRoute(coordinates);

    console.log("🗺️ OSRM optimization complete");
    console.log("Optimized order:", optimizedOrder);
    console.log("Distance:", osrmRoute.distance, "meters");
    console.log("Duration:", osrmRoute.duration, "seconds");


    const optimizedOrderIds = optimizedOrder
      .slice(1)
      .map((idx) => orders[idx - 1]?.id)
      .filter((id): id is string => id !== undefined);

    console.log("📦 Optimized order IDs:", optimizedOrderIds);


    const geometryString = normalizeGeometry(osrmRoute.geometry);

    console.log("💾 Geometry string length:", geometryString.length);


    const route = await this.create({
      driverId,
      orders: optimizedOrderIds,
      geometry: geometryString, 
      status: "PLANNED",
    });

    const updatePromises = optimizedOrderIds.map((orderId) =>
      db.collection(COLLECTIONS.ORDERS).doc(orderId).update({ status: "READY" })
    );
    await Promise.all(updatePromises);

    const parsedRoute = this.parseRoute(route);

    return {
      route: parsedRoute,
      distance: osrmRoute.distance,
      duration: osrmRoute.duration,
      optimizedOrderIds,
    };
  }

  async getRouteStats(routeId: string): Promise<{
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    totalDistance: number;
    estimatedDuration: number;
  }> {
    const route = await this.getById(routeId);
    if (!route) throw new Error("Ruta no encontrada");


    const deliveriesSnapshot = await db
      .collection(COLLECTIONS.DELIVERIES)
      .where("routeId", "==", routeId)
      .get();

    const completed = deliveriesSnapshot.docs.filter(
      (doc) => doc.data().status === "DELIVERED"
    ).length;

    let totalDistance = 0;
    if (route.geometry?.coordinates) {
      for (let i = 0; i < route.geometry.coordinates.length - 1; i++) {
        const coord1 = route.geometry.coordinates[i];
        const coord2 = route.geometry.coordinates[i + 1];
        if (!coord1 || !coord2) continue;
        const [lng1, lat1] = coord1;
        const [lng2, lat2] = coord2;

        const distance = await osrmService.calculateDistance(
          { lat: lat1, lng: lng1 },
          { lat: lat2, lng: lng2 }
        );
        totalDistance += distance;
      }
    }

    return {
      totalOrders: route.orders.length,
      completedOrders: completed,
      pendingOrders: route.orders.length - completed,
      totalDistance: Math.round(totalDistance * 100) / 100,
      estimatedDuration: Math.round(totalDistance * 2), 
    };
  }
}

export const routesService = new RoutesService();
