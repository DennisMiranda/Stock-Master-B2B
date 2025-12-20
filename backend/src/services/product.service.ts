import { Filter } from "firebase-admin/firestore";
import { db } from "../config/firebase";
import type { Product } from "../models/product.model";

export class ProductService {
  constructor() {}
  
  /**
   * Servicio para buscar productos
   */
  async searchProducts(params: {
    search: string;
    limit: number;
    page: number;
  }) {
    try {
      const searchTerm = params.search?.toUpperCase() ?? "";
      const page = params.page || 1;
      const limit = params.limit || 10;
      const offset = (page - 1) * limit;

      let query = db.collection("products");

      if (!searchTerm) {
        const snapshotTotal = await query.count().get();
        const totalProducts = snapshotTotal.data().count;
        const snapshot = await query.offset(offset).limit(limit).get();

        const products = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];

        return {
          products,
          metadata: {
            count: totalProducts,
            pages: Math.ceil(totalProducts / limit),
          },
        };
      }

      const baseQuery = query.where(
        Filter.or(
          ...searchTerm
            .split(" ")
            .map((term) =>
              Filter.and(
                Filter.where("searchName", ">=", term),
                Filter.where("searchName", "<=", term + "\uf8ff")
              )
            ),
          Filter.and(
            Filter.where("sku", ">=", searchTerm),
            Filter.where("sku", "<=", searchTerm + "\uf8ff")
          ),
          Filter.and(Filter.where("searchArray", "array-contains", searchTerm))
        )
      );

      const snapshotTotal = await baseQuery.count().get();
      const totalProducts = snapshotTotal.data().count;

      const snapshot = await baseQuery.offset(offset).limit(limit).get();

      const products = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];

      return {
        products,
        metadata: {
          count: totalProducts,
          pages: Math.ceil(totalProducts / limit),
        },
      };
    } catch (error) {
      console.error("Search error", error);
      return { products: [], metadata: { count: 0, pages: 0 } };
    }
  }
}
