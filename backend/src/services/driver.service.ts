import { db, COLLECTIONS } from '../config/firebase';
import { Driver, DriverStatus } from '../models/driver.model';

export class DriversService {
  private collection = COLLECTIONS.DRIVERS;

  async getAll(): Promise<Driver[]> {
    const snapshot = await db.collection(this.collection).get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Driver[];
  }

  async getById(id: string): Promise<Driver | null> {
    const doc = await db.collection(this.collection).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Driver;
  }

  async getByStatus(status: DriverStatus): Promise<Driver[]> {
    const snapshot = await db.collection(this.collection)
      .where('status', '==', status)
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Driver[];
  }

  async getByUserId(userId: string): Promise<Driver | null> {
    const snapshot = await db.collection(this.collection)
      .where('userId', '==', userId)
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc!.id, ...doc!.data() } as Driver;
  }

  async create(data: Omit<Driver, 'id'>): Promise<Driver> {
    const docRef = await db.collection(this.collection).add(data);
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as Driver;
  }

  async update(id: string, data: Partial<Driver>): Promise<Driver> {
    await db.collection(this.collection).doc(id).update(data);
    const doc = await db.collection(this.collection).doc(id).get();
    return { id: doc.id, ...doc.data() } as Driver;
  }

  async assignRoute(driverId: string, routeId: string): Promise<Driver> {
    return this.update(driverId, {
      status: 'ASSIGNED',
      currentRouteId: routeId,
    });
  }

  async unassignRoute(driverId: string): Promise<Driver> {
    return this.update(driverId, {
      status: 'AVAILABLE',
      currentRouteId: null,
    });
  }

  async delete(id: string): Promise<void> {
    await db.collection(this.collection).doc(id).delete();
  }

  async getDriverStats(driverId: string): Promise<{
    totalDeliveries: number;
    completedDeliveries: number;
    currentRoute: string | null;
  }> {
    const driver = await this.getById(driverId);
    if (!driver) throw new Error('Conductor no encontrado');


    const deliveriesSnapshot = await db.collection(COLLECTIONS.DELIVERIES)
      .where('driverId', '==', driverId)
      .get();

    const total = deliveriesSnapshot.size;
    const completed = deliveriesSnapshot.docs.filter(
      doc => doc.data().status === 'DELIVERED'
    ).length;

    return {
      totalDeliveries: total,
      completedDeliveries: completed,
      currentRoute: driver.currentRouteId!,
    };
  }
}

export const driversService = new DriversService();
