import { db } from "../config/firebase";
import { CustomResponse as CustomResponseModel } from "../models/custom-response.model";
import { ORDER_VARIANT, OrderDetailItem } from "../models/order.model";
import { CustomResponse } from "../utils/custom-response";

interface SoldProductStatistic {
  id: string;
  name: string;
  unitSold: number;
  boxSold: number;
  totalUnitSold: number;
}

export class StatisticService {
  private get soldProductsCollection() {
    return db.collection("statistics/sold_products");
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

        for (const item of orderItems) {
          const productDocRef = soldProductsRef.doc(item.id);

          const productDoc = await tx.get(productDocRef);
          const productData = productDoc.data() as
            | SoldProductStatistic
            | undefined;

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

          const newProductData: SoldProductStatistic = {
            id: item.id,
            name: item.name!,
            unitSold,
            boxSold,
            totalUnitSold,
          };

          tx.set(productDocRef, newProductData, { merge: true });
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
}
