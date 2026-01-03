import { db, COLLECTIONS } from '../config/firebase';
import { Delivery, DeliveryStatus } from '../models/deliveries.model';

export class DeliveriesService {
  private collection = COLLECTIONS.DELIVERIES;

  async getAll(): Promise<Delivery[]> {
    const snapshot = await db.collection(this.collection).get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Delivery[];
  }

  async getById(id: string): Promise<Delivery | null> {
    const doc = await db.collection(this.collection).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Delivery;
  }

  async getByRoute(routeId: string): Promise<Delivery[]> {
    const snapshot = await db.collection(this.collection)
      .where('routeId', '==', routeId)
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Delivery[];
  }

  async getByDriver(driverId: string): Promise<Delivery[]> {
    const snapshot = await db.collection(this.collection)
      .where('driverId', '==', driverId)
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Delivery[];
  }

  async getByStatus(status: DeliveryStatus): Promise<Delivery[]> {
    const snapshot = await db.collection(this.collection)
      .where('status', '==', status)
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Delivery[];
  }

  async create(data: Omit<Delivery, 'id'>): Promise<Delivery> {
    const deliveryData = {
      ...data,
      timestamp: Date.now(),
    };

    const docRef = await db.collection(this.collection).add(deliveryData);
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as Delivery;
  }

  async update(id: string, data: Partial<Delivery>): Promise<Delivery> {
    await db.collection(this.collection).doc(id).update({
      ...data,
      timestamp: Date.now(),
    });
    const doc = await db.collection(this.collection).doc(id).get();
    return { id: doc.id, ...doc.data() } as Delivery;
  }

  async updateStatus(id: string, status: DeliveryStatus): Promise<Delivery> {
    return this.update(id, { status });
  }

  async complete(id: string): Promise<Delivery> {
    const delivery = await this.update(id, { status: 'DELIVERED' });


    if (delivery.orderId) {
      await db.collection(COLLECTIONS.ORDERS)
        .doc(delivery.orderId)
        .update({ status: 'DELIVERED' });
    }

    return delivery;
  }

  async fail(id: string, reason?: string): Promise<Delivery> {
    return this.update(id, { 
      status: 'FAILED',

    });
  }

  async cancel(id: string): Promise<Delivery> {
    return this.update(id, { status: 'CANCELLED' });
  }

  async delete(id: string): Promise<void> {
    await db.collection(this.collection).doc(id).delete();
  }


  async getPendingByDriver(driverId: string): Promise<Delivery[]> {
    const snapshot = await db.collection(this.collection)
      .where('driverId', '==', driverId)
      .where('status', '==', 'PENDING')
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Delivery[];
  }
}

export const deliveriesService = new DeliveriesService();
