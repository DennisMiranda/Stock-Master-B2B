import { db, COLLECTIONS } from '../config/firebase';
import { DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore';

export class FirebaseService {

  async getById<T>(collection: string, id: string): Promise<T | null> {
    const doc = await db.collection(collection).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as T;
  }


  async getAll<T>(collection: string): Promise<T[]> {
    const snapshot = await db.collection(collection).get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  }

  async getWhere<T>(
    collection: string,
    field: string,
    operator: FirebaseFirestore.WhereFilterOp,
    value: any
  ): Promise<T[]> {
    const snapshot = await db.collection(collection).where(field, operator, value).get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  }


  async create<T>(collection: string, data: Partial<T>): Promise<T> {
    const docRef = await db.collection(collection).add({
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as T;
  }


  async createWithId<T>(collection: string, id: string, data: Partial<T>): Promise<T> {
    await db.collection(collection).doc(id).set({
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    const doc = await db.collection(collection).doc(id).get();
    return { id: doc.id, ...doc.data() } as T;
  }


  async update<T>(collection: string, id: string, data: Partial<T>): Promise<T> {
    await db.collection(collection).doc(id).update({
      ...data,
      updatedAt: Date.now(),
    });
    
    const doc = await db.collection(collection).doc(id).get();
    return { id: doc.id, ...doc.data() } as T;
  }

  async delete(collection: string, id: string): Promise<void> {
    await db.collection(collection).doc(id).delete();
  }


  async getPaginated<T>(
    collection: string,
    limit: number,
    lastDocId?: string
  ): Promise<{ data: T[]; hasMore: boolean }> {
    let query = db.collection(collection).orderBy('createdAt', 'desc').limit(limit + 1);

    if (lastDocId) {
      const lastDoc = await db.collection(collection).doc(lastDocId).get();
      query = query.startAfter(lastDoc);
    }

    const snapshot = await query.get();
    const docs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];

    const hasMore = docs.length > limit;
    if (hasMore) docs.pop();

    return { data: docs, hasMore };
  }
}

export const firebaseService = new FirebaseService();
