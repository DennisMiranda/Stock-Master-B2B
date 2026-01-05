import { db, COLLECTIONS } from '../config/firebase';
import { Driver, DriverStatus } from '../models/driver.model';

interface DriverWithUserInfo extends Driver {
  displayName?: string;
  email?: string;
  photoURL?: string;
  isActive?: boolean;
}

export class DriversService {
  private collection = COLLECTIONS.DRIVERS;

  private async getUserInfo(userId: string) {
    const userDoc = await db.collection(COLLECTIONS.USERS).doc(userId).get();
    if (!userDoc.exists) return null;
    
    const userData = userDoc.data();
    return {
      displayName: userData?.displayName,
      email: userData?.email,
      photoURL: userData?.photoURL,
      isActive: userData?.isActive,
    };
  }


  private async enrichDriverWithUserInfo(driver: Driver): Promise<DriverWithUserInfo> {
    const userInfo = await this.getUserInfo(driver.userId);
    return {
      ...driver,
      displayName: userInfo?.displayName || 'Sin nombre',
      email: userInfo?.email || 'Sin email',
      photoURL: userInfo?.photoURL,
      isActive: userInfo?.isActive ?? true,
    };
  }

  async getAll(): Promise<DriverWithUserInfo[]> {
    const snapshot = await db.collection(this.collection).get();
    const drivers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Driver[];

    // ✅ Enriquecer todos los drivers con info de usuario
    return Promise.all(
      drivers.map(driver => this.enrichDriverWithUserInfo(driver))
    );
  }

  async getById(id: string): Promise<DriverWithUserInfo | null> {
    const doc = await db.collection(this.collection).doc(id).get();
    if (!doc.exists) return null;
    
    const driver = { id: doc.id, ...doc.data() } as Driver;
    return this.enrichDriverWithUserInfo(driver);
  }

  async getByStatus(status: DriverStatus): Promise<DriverWithUserInfo[]> {
    const snapshot = await db.collection(this.collection)
      .where('status', '==', status)
      .get();
    
    const drivers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Driver[];

    return Promise.all(
      drivers.map(driver => this.enrichDriverWithUserInfo(driver))
    );
  }

  async getByUserId(userId: string): Promise<DriverWithUserInfo | null> {
    const snapshot = await db.collection(this.collection)
      .where('userId', '==', userId)
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    const driver = { id: doc!.id, ...doc!.data() } as Driver;
    return this.enrichDriverWithUserInfo(driver);
  }

  async create(data: Omit<Driver, 'id'>): Promise<DriverWithUserInfo> {
    const docRef = await db.collection(this.collection).add(data);
    const doc = await docRef.get();
    const driver = { id: doc.id, ...doc.data() } as Driver;
    return this.enrichDriverWithUserInfo(driver);
  }

  async update(id: string, data: Partial<Driver>): Promise<DriverWithUserInfo> {
    await db.collection(this.collection).doc(id).update(data);
    const doc = await db.collection(this.collection).doc(id).get();
    const driver = { id: doc.id, ...doc.data() } as Driver;
    return this.enrichDriverWithUserInfo(driver);
  }

  async assignRoute(driverId: string, routeId: string): Promise<DriverWithUserInfo> {
    return this.update(driverId, {
      status: 'ASSIGNED',
      currentRouteId: routeId,
    });
  }

  async unassignRoute(driverId: string): Promise<DriverWithUserInfo> {
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