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

    const deliveriesSnapshot = await db
      .collection(COLLECTIONS.DELIVERIES)
      .where("status", "==", "DELIVERED")
      .get();

    const deliveriesByRoute = new Map<string, string[]>();
    deliveriesSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const routeId = data.routeId;
      if (!deliveriesByRoute.has(routeId)) {
        deliveriesByRoute.set(routeId, []);
      }
      deliveriesByRoute.get(routeId)!.push(data.orderId);
    });

    return routes.map((route) => ({
      ...this.parseRoute(route),
      deliveredOrders: deliveriesByRoute.get(route.id!) || [],
    }));
  }

  async getById(id: string): Promise<RouteParsed | null> {
    const doc = await db.collection(this.collection).doc(id).get();
    if (!doc.exists) return null;

    const route = { id: doc.id, ...doc.data() } as Route;

    const deliveriesSnapshot = await db
      .collection(COLLECTIONS.DELIVERIES)
      .where("routeId", "==", id)
      .where("status", "==", "DELIVERED")
      .get();

    const deliveredOrders = deliveriesSnapshot.docs.map(
      (doc) => doc.data().orderId as string
    );

    return {
      ...this.parseRoute(route),
    };
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

    if (route.driverId) {
      let driverStatus: string;
      let currentRouteId: string | null | undefined = route.id;

      switch (status) {
        case "IN_PROGRESS":
          driverStatus = "ON_ROUTE";
          break;
        case "COMPLETED":
        case "CANCELLED":
          driverStatus = "AVAILABLE";
          currentRouteId = null;
          break;
        default:
          driverStatus = "ASSIGNED";
      }

      await db.collection(COLLECTIONS.DRIVERS).doc(route.driverId).update({
        status: driverStatus,
        currentRouteId: currentRouteId,
      });
    }

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

    const coordinates = [
      startLocation,
      ...orders.map((o) => o.deliveryAddress.location),
    ];

    const { optimizedOrder, route: osrmRoute } =
      await osrmService.optimizeRoute(coordinates);

    const optimizedOrderIds = optimizedOrder
      .slice(1)
      .map((idx) => orders[idx - 1]?.id)
      .filter((id): id is string => id !== undefined);

    const geometryString = normalizeGeometry(osrmRoute.geometry);

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
    await db.collection(COLLECTIONS.DRIVERS).doc(driverId).update({
      status: "ASSIGNED",
      currentRouteId: route.id,
    });

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

    // ✅ Usar deliveredOrders del objeto route
    const completed = route.deliveredOrders?.length || 0;

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
  async addOrder(
    routeId: string,
    orderId: string,
    startLocation: { lat: number; lng: number }
  ): Promise<RouteParsed> {
    console.log(`📦 Adding order ${orderId} to route ${routeId}`);

    // 1. Obtener la ruta actual
    const doc = await db.collection(this.collection).doc(routeId).get();
    if (!doc.exists) {
      throw new Error("Ruta no encontrada");
    }

    const route = { id: doc.id, ...doc.data() } as Route;

    // 2. Validar estado de la ruta
    if (route.status === "COMPLETED") {
      throw new Error(
        `No se puede agregar pedidos a una ruta con estado ${route.status}`
      );
    }

    // 3. Validar que el pedido no esté repetido
    if (route.orders.includes(orderId)) {
      throw new Error("El pedido ya está asignado a esta ruta");
    }

    // 4. Obtener el nuevo pedido
    const orderDoc = await db.collection(COLLECTIONS.ORDERS).doc(orderId).get();
    if (!orderDoc.exists) {
      throw new Error("Pedido no encontrado");
    }

    const newOrder = { id: orderDoc.id, ...orderDoc.data() } as Order;

    // 5. Validar estado del pedido
    if (newOrder.status !== "READY" && newOrder.status !== "IN_PACKING") {
      throw new Error(
        `El pedido debe estar en estado READY o IN_PACKING (actual: ${newOrder.status})`
      );
    }

    // 6. Obtener pedidos existentes en la ruta
    const existingOrdersDocs = await Promise.all(
      route.orders.map((id) => db.collection(COLLECTIONS.ORDERS).doc(id).get())
    );

    const existingOrders: Order[] = existingOrdersDocs
      .filter((doc) => doc.exists)
      .map((doc) => ({ id: doc.id, ...doc.data() } as Order));

    console.log(`✅ Current route has ${existingOrders.length} orders`);

    // 7. ✅ CORRECCIÓN: Incluir punto de inicio (distribuidora)
    const allCoordinates = [
      startLocation, // ⚠️ IMPORTANTE: Siempre incluir el punto de inicio
      ...existingOrders.map((o) => o.deliveryAddress.location),
      newOrder.deliveryAddress.location,
    ];

    console.log(`📍 Total coordinates to optimize: ${allCoordinates.length}`);

    // 8. Re-optimizar la ruta con OSRM
    const { optimizedOrder, route: osrmRoute } =
      await osrmService.optimizeRoute(allCoordinates);

    console.log("🗺️ Route re-optimized");
    console.log("New optimized order:", optimizedOrder);

    // 9. ✅ CORRECCIÓN: Mapear correctamente los índices (excluir índice 0 = distribuidora)
    const allOrders = [...existingOrders, newOrder];
    const optimizedOrderIds = optimizedOrder
      .slice(1) // ⚠️ Excluir el índice 0 (distribuidora)
      .map((idx) => allOrders[idx - 1]?.id) // ⚠️ idx-1 porque el array de pedidos no incluye la distribuidora
      .filter((id): id is string => id !== undefined);

    console.log("📦 Optimized order IDs:", optimizedOrderIds);

    // 10. Normalizar geometría
    const geometryString = normalizeGeometry(osrmRoute.geometry);

    // 11. Actualizar la ruta en Firestore
    await db.collection(this.collection).doc(routeId).update({
      orders: optimizedOrderIds,
      geometry: geometryString,
      updatedAt: Date.now(),
    });

    console.log("✅ Route updated in Firestore");

    // 12. ✅ CORRECCIÓN: Actualizar estado del nuevo pedido
    await db.collection(COLLECTIONS.ORDERS).doc(orderId).update({
      status: "ASSIGNED",
      updatedAt: Date.now(),
    });

    console.log("✅ Order status updated to ASSIGNED");

    // 13. Retornar la ruta actualizada
    const updatedDoc = await db.collection(this.collection).doc(routeId).get();
    return this.parseRoute({
      id: updatedDoc.id,
      ...updatedDoc.data(),
    } as Route);
  }

  async removeOrder(
    routeId: string,
    orderId: string,
    startLocation: { lat: number; lng: number }
  ): Promise<RouteParsed> {
    console.log(`🗑️ Removing order ${orderId} from route ${routeId}`);

    const doc = await db.collection(this.collection).doc(routeId).get();
    if (!doc.exists) {
      throw new Error("Ruta no encontrada");
    }
    const route = { id: doc.id, ...doc.data() } as Route;

    if (route.status === "COMPLETED") {
      throw new Error("No se puede modificar una ruta completada");
    }

    if (!route.orders.includes(orderId)) {
      throw new Error("El pedido no está asignado a esta ruta");
    }

    const remainingOrderIds = route.orders.filter((id) => id !== orderId);

    if (remainingOrderIds.length === 0) {
      await db
        .collection(this.collection)
        .doc(routeId)
        .update({
          orders: [],
          geometry: JSON.stringify({ type: "LineString", coordinates: [] }),
          updatedAt: Date.now(),
        });

      await db.collection(COLLECTIONS.ORDERS).doc(orderId).update({
        status: "READY",
        updatedAt: Date.now(),
      });

      const updatedDoc = await db
        .collection(this.collection)
        .doc(routeId)
        .get();
      return this.parseRoute({
        id: updatedDoc.id,
        ...updatedDoc.data(),
      } as Route);
    }

    const remainingOrdersDocs = await Promise.all(
      remainingOrderIds.map((id) =>
        db.collection(COLLECTIONS.ORDERS).doc(id).get()
      )
    );

    const remainingOrders: Order[] = remainingOrdersDocs
      .filter((doc) => doc.exists)
      .map((doc) => ({ id: doc.id, ...doc.data() } as Order));

    const allCoordinates = [
      startLocation,
      ...remainingOrders.map((o) => o.deliveryAddress.location),
    ];

    const { optimizedOrder, route: osrmRoute } =
      await osrmService.optimizeRoute(allCoordinates);

    const optimizedOrderIds = optimizedOrder
      .slice(1)
      .map((idx) => remainingOrders[idx - 1]?.id)
      .filter((id): id is string => id !== undefined);

    const geometryString = normalizeGeometry(osrmRoute.geometry);

    await db.collection(this.collection).doc(routeId).update({
      orders: optimizedOrderIds,
      geometry: geometryString,
      updatedAt: Date.now(),
    });

    await db.collection(COLLECTIONS.ORDERS).doc(orderId).update({
      status: "READY",
      updatedAt: Date.now(),
    });

    const updatedDoc = await db.collection(this.collection).doc(routeId).get();
    return this.parseRoute({
      id: updatedDoc.id,
      ...updatedDoc.data(),
    } as Route);
  }

  async markOrderAsDelivered(
    routeId: string,
    orderId: string
  ): Promise<RouteParsed> {
    const doc = await db.collection(this.collection).doc(routeId).get();
    if (!doc.exists) {
      throw new Error("Ruta no encontrada");
    }
    const route = { id: doc.id, ...doc.data() } as Route;
    if (!route.orders.includes(orderId)) {
      throw new Error("El pedido no está asignado a esta ruta");
    }
    if (route.status !== "IN_PROGRESS") {
      throw new Error("Solo se pueden marcar entregas en rutas en progreso");
    }
    const deliverySnapshot = await db
      .collection(COLLECTIONS.DELIVERIES)
      .where("routeId", "==", routeId)
      .where("orderId", "==", orderId)
      .get();

    if (deliverySnapshot.empty) {
      await db.collection(COLLECTIONS.DELIVERIES).add({
        routeId,
        orderId,
        status: "DELIVERED",
        deliveredAt: Date.now(),
        createdAt: Date.now(),
      });
    } else {
      const deliveryDoc = deliverySnapshot.docs[0];
      await db.collection(COLLECTIONS.DELIVERIES).doc(deliveryDoc!.id).update({
        status: "DELIVERED",
        deliveredAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    await db.collection(COLLECTIONS.ORDERS).doc(orderId).update({
      status: "DELIVERED",
      updatedAt: Date.now(),
    });
    return this.parseRoute(route);
  }
}

export const routesService = new RoutesService();
