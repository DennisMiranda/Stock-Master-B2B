import {
  QueryDocumentSnapshot,
  QuerySnapshot,
  Transaction,
} from "@google-cloud/firestore";
import { Filter } from "firebase-admin/firestore";
import { db } from "../config/firebase";

import type {
  Category,
  Product,
  ProductDoc,
  Subcategory,
} from "../models/product.model";


export class ProductService {
  private productsCollection = db.collection("products");

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


  private async buildProduct(doc: QueryDocumentSnapshot): Promise<Product> {
    const data = doc.data() as ProductDoc;

    let category: Category | undefined;
    if (data.categoryId) {
      const categorySnap = await db
        .collection("categories")
        .doc(data.categoryId)
        .get();
      if (categorySnap.exists) {
        const catData = categorySnap.data();
        if (catData) {
          category = { id: categorySnap.id, name: catData.name as string };
        }
      }
    }

    let subCategory: Subcategory | undefined;
    if (data.categoryId && data.subcategoryId) {
      const subSnap = await db
        .collection("categories")
        .doc(data.categoryId)
        .collection("subcategories")
        .doc(data.subcategoryId)
        .get();

      if (subSnap.exists) {
        const subData = subSnap.data();
        if (subData) {
          subCategory = { id: subSnap.id, name: subData.name as string };
        }
      }
    }

    const { categoryId, subcategoryId, ...rest } = data;

    return {
      ...rest,
      id: doc.id,
      category,
      subCategory,
    };
  }

  private async mapProducts(snapshot: QuerySnapshot): Promise<Product[]> {
    return Promise.all(snapshot.docs.map((doc) => this.buildProduct(doc)));
  }

  /**
   * Obtiene un mapa de productos por su ID
   * @param ids - Array de IDs de productos
   * @param tx - Transacción opcional
   * @returns Un mapa de productos con sus IDs como claves
   */
  async getProductsMapById(ids: string[], tx?: Transaction) {
    const handler = tx || db;

    const productsSnapshots = await handler.getAll(
      ...ids.map((id) => this.productsCollection.doc(id))
    );

    const products = productsSnapshots.reduce((acc, snap) => {
      acc[snap.id] = snap.data() as ProductDoc;
      return acc;
    }, {} as Record<string, ProductDoc>);

    return products;
  }
}
