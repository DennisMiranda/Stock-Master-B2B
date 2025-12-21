import {
  Transaction,
} from "@google-cloud/firestore";
import { Filter } from "firebase-admin/firestore";
import { db } from "../config/firebase";

import type {
  Product,
  ProductDoc,
} from "../models/product.model";

export class ProductService {
  private productsCollection = db.collection("products");

  constructor() {}

  /**
<<<<<<< HEAD
   * Servicio para buscar productos con filtros opcionales (listado + paginación)
   * Los filtros se aplican en Firestore antes de la paginación para mantener consistencia
=======
   * Servicio para buscar productos con filtros opcionales
>>>>>>> origin/filtros
   */
  async searchProducts(params: {
    search?: string;
    limit?: number;
    page?: number;
    categoryId?: string;
    subcategoryId?: string;
    brand?: string;
    inStockOnly?: boolean;
  }) {
    try {
      const searchTerm = params.search?.toUpperCase() ?? "";
      const page = params.page || 1;
      const limit = params.limit || 10;
      const offset = (page - 1) * limit;

<<<<<<< HEAD
      let query: any = this.productsCollection;
=======
      let query = db.collection("products") as any;
>>>>>>> origin/filtros

      // Aplicar filtros de igualdad primero (Firestore requiere que estos se apliquen antes de OR)
      if (params.categoryId) {
        query = query.where("categoryId", "==", params.categoryId);
<<<<<<< HEAD
      }

      if (params.subcategoryId) {
        query = query.where("subcategoryId", "==", params.subcategoryId);
      }

      if (params.brand) {
        query = query.where("brand", "==", params.brand);
      }

      if (params.inStockOnly) {
        query = query.where("stockUnits", ">", 0);
      }

      // Sin término de búsqueda: solo paginación con filtros aplicados
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

      // Con término de búsqueda: usar solo el primer término para evitar problemas con Firestore
      // Nota: Firestore tiene limitaciones con múltiples términos, por lo que se usa solo el primero
      const firstTerm = searchTerm.split(" ")[0];
      const baseQuery = query.where(
        Filter.or(
          Filter.and(
            Filter.where("searchName", ">=", firstTerm),
            Filter.where("searchName", "<=", firstTerm + "\uf8ff")
          ),
          Filter.and(
            Filter.where("sku", ">=", searchTerm),
            Filter.where("sku", "<=", searchTerm + "\uf8ff")
          ),
          Filter.where("searchArray", "array-contains", searchTerm)
        )
      );
=======
      }

      if (params.subcategoryId) {
        query = query.where("subcategoryId", "==", params.subcategoryId);
      }
>>>>>>> origin/filtros

      if (params.brand) {
        query = query.where("brand", "==", params.brand);
      }

      if (params.inStockOnly) {
        query = query.where("stockUnits", ">", 0);
      }

      // Aplicar búsqueda de texto si existe
      if (searchTerm) {
        const firstTerm = searchTerm.split(" ")[0];
        query = query.where(
          Filter.or(
            Filter.and(
              Filter.where("searchName", ">=", firstTerm),
              Filter.where("searchName", "<=", firstTerm + "\uf8ff")
            ),
            Filter.and(
              Filter.where("sku", ">=", searchTerm),
              Filter.where("sku", "<=", searchTerm + "\uf8ff")
            ),
            Filter.where("searchArray", "array-contains", searchTerm)
          )
        );
      }

      // Obtener total de productos (para paginación)
      const snapshotTotal = await query.count().get();
      const totalProducts = snapshotTotal.data().count;

      // Obtener productos paginados
      const snapshot = await query.offset(offset).limit(limit).get();

      let products = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];

      // Si hay múltiples términos de búsqueda, filtrar en memoria para mayor precisión
      if (searchTerm && searchTerm.split(" ").length > 1) {
        const searchTerms = searchTerm.split(" ").filter((t) => t.length > 0);
        products = products.filter((product: any) => {
          const searchName = (product.searchName || "").toUpperCase();
          const sku = (product.sku || "").toUpperCase();
          const searchArray = product.searchArray || [];

          return searchTerms.every(
            (term) =>
              searchName.includes(term) ||
              sku.includes(term) ||
              searchArray.some((item: string) =>
                item.toUpperCase().includes(term)
              )
          );
        });
      }

      return {
        products,
        metadata: {
          count: searchTerm && searchTerm.split(" ").length > 1
            ? products.length
            : totalProducts,
          pages: Math.ceil(
            (searchTerm && searchTerm.split(" ").length > 1
              ? products.length
              : totalProducts) / limit
          ),
        },
      };
    } catch (error) {
      console.error("Search error", error);
      return { products: [], metadata: { count: 0, pages: 0 } };
    }
  }

  /**
   * Obtiene el detalle de un producto por ID
   * Ideal para la página de detalle en Angular.
   */
  async getProductById(id: string): Promise<Product | null> {
    const snap = await this.productsCollection.doc(id).get();

    if (!snap.exists) {
      return null;
    }

    return {
      id: snap.id,
      ...snap.data(),
    } as Product;
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
