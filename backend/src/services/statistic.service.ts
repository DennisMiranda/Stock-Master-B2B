import { db } from "../config/firebase";
import { CustomResponse as CustomResponseModel } from "../models/custom-response.model";
import { ORDER_VARIANT, OrderDetailItem } from "../models/order.model";
import { CustomResponse } from "../utils/custom-response";

export interface SoldProductStatistic {
  id: string;
  name: string;
  unitSold: number;
  boxSold: number;
  totalUnitSold: number;
}

export class StatisticService {
  private get soldProductsCollection() {
    return db.collection("statistics").doc("sold_products").collection("data");
  }

  /**
   * Updates the sold products collection by adding up the quantities of each product variant.
   * @param {OrderDetailItem[]} orderItems - Array of order items to update the sold products collection.
   */
  async updateSoldProducts(
    orderItems: OrderDetailItem[]
  ): Promise<CustomResponseModel<null, null>> {
    try {
      return db.runTransaction(async (tx) => {
        const soldProductsRef = this.soldProductsCollection;

        const soldProducts: Record<string, SoldProductStatistic> = {};

        // 1.Guardamos refs y lecturas
        const docRefs = orderItems.map((item) => soldProductsRef.doc(item.id));
        const snapshots = await tx.getAll(...docRefs);

        // 2.Guardamos los datos en un objeto
        for (const snapshot of snapshots) {
          const data = snapshot.data() as SoldProductStatistic | undefined;
          if (data) {
            soldProducts[data.id] = data;
          }
        }

        // 3.Actualizamos los datos del objeto
        for (const item of orderItems) {
          if (!soldProducts[item.id]) {
            soldProducts[item.id] = {
              id: item.id,
              name: item.name!,
              unitSold: 0,
              boxSold: 0,
              totalUnitSold: 0,
            };
          }

          const productDocRef = soldProductsRef.doc(item.id);
          let productData: SoldProductStatistic = soldProducts[item.id]!;

          let unitSold = productData?.unitSold || 0;
          let boxSold = productData?.boxSold || 0;
          let totalUnitSold = productData?.totalUnitSold || 0;

          if (item.variant === ORDER_VARIANT.unit) {
            unitSold += item.quantity;
            totalUnitSold += item.quantity;
          } else {
            boxSold += item.quantity;
            totalUnitSold += item.quantity * item.unitPerBox!;
          }

          soldProducts[item.id] = {
            id: item.id,
            name: item.name!,
            unitSold,
            boxSold,
            totalUnitSold,
          };
        }

        for (const statistic of Object.values(soldProducts)) {
          tx.set(this.soldProductsCollection.doc(statistic.id), statistic, {
            merge: true,
          });
        }

        return CustomResponse.success(null, "Sold products updated");
      });
    } catch (error) {
      console.error("Error updating sold products:", error);
      return CustomResponse.error(
        "STATISTIC_ERROR",
        "Error updating sold products"
      );
    }
  }



  /**
   * Obtiene el Top de productos vendidos ordenados por diferentes criterios.
   * @param {'totalUnitSold' | 'unitSold' | 'boxSold'} orderByField - Campo por el cual ordenar.
   * @param {number} limit - Límite de resultados (default 5).
   */
  async getTopSelling(
    orderByField: 'totalUnitSold' | 'unitSold' | 'boxSold',
    limit: number = 5
  ): Promise<SoldProductStatistic[]> {
    try {
      const snapshot = await this.soldProductsCollection
        .orderBy(orderByField, 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(
        (doc) => doc.data() as SoldProductStatistic
      );
    } catch (error) {
      console.error(`Error fetching top selling by ${orderByField}:`, error);
      return [];
    }
  }
}
