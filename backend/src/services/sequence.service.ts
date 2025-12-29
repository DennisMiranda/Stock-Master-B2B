import { db } from "../config/firebase";

export class SequenceService {
    private collection = db.collection("counters");

    constructor() { }

    /**
     * Obtiene el siguiente valor de una secuencia de forma atómica.
     * Si la secuencia no existe, la crea iniciando en 1.
     * @param sequenceName Nombre del contador (ej. 'product_her_man')
     */
    async getNextSequenceValue(sequenceName: string): Promise<number> {
        const docRef = this.collection.doc(sequenceName);

        return db.runTransaction(async (transaction) => {
            const doc = await transaction.get(docRef);

            let nextValue: number;

            if (!doc.exists) {
                nextValue = 1;
                transaction.set(docRef, { value: nextValue });
            } else {
                const data = doc.data();
                nextValue = (data?.value || 0) + 1;
                transaction.update(docRef, { value: nextValue });
            }

            return nextValue;
        });
    }
}
