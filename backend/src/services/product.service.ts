import { Filter } from "firebase-admin/firestore";
import { db } from "../config/firebase";

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

      console.log(searchTerm);

      let query = db.collection("products");

      if (!searchTerm) {
        const snapshot = await query.offset(offset).limit(limit).get();
        const products = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        return products;
      }

      const snapshot = await query
        .where(
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
            Filter.and(
              Filter.where("searchArray", "array-contains", searchTerm)
            )
          )
        )
        .offset(offset)
        .limit(limit)
        .get();

      const products = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return products;
    } catch (error) {
      console.error("Search error", error);
      return [];
    }
  }
}
