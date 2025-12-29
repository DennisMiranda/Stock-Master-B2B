import { Transaction } from "@google-cloud/firestore";
import { Filter } from "firebase-admin/firestore";
import { db } from "../config/firebase";

import type { Product, ProductDoc } from "../models/product.model";
import { CategoryService } from "./category.service";
import { SequenceService } from "./sequence.service";

export class ProductService {
  private productsCollection = db.collection("products");
  private categoryService = new CategoryService();
  private sequenceService = new SequenceService();

  constructor() { }

  /**
   * Servicio para buscar productos con filtros opcionales (listado + paginación)
   * Los filtros se aplican en Firestore antes de la paginación para mantener consistencia
   */
  async searchProducts(params: {
    search?: string;
    limit?: number;
    page?: number;
    categoryId?: string;
    subcategoryId?: string;
    brand?: string;
    inStockOnly?: boolean;
    isActive?: boolean;
  }) {
    try {
      const searchTerm = params.search?.toUpperCase() ?? "";
      const page = params.page || 1;
      const limit = params.limit || 10;
      const offset = (page - 1) * limit;

      let query: FirebaseFirestore.Query = this.productsCollection;

      // Aplicar filtros de igualdad primero (Firestore requiere que estos se apliquen antes de OR)
      if (params.categoryId) {
        query = query.where("categoryId", "==", params.categoryId);
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

      if (params.isActive !== undefined) {
        query = query.where("isActive", "==", params.isActive);
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

      if (params.brand) {
        query = query.where("brand", "==", params.brand);
      }

      if (params.inStockOnly) {
        query = query.where("stockUnits", ">", 0);
      }

      if (params.subcategoryId) {
        query = query.where("subcategoryId", "==", params.subcategoryId);
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
          count:
            searchTerm && searchTerm.split(" ").length > 1
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

  /**
   * Crea un nuevo producto con SKU autogenerado
   */
  async createProduct(data: Partial<ProductDoc>): Promise<string> {
    const docRef = this.productsCollection.doc();

    // 1. Validar Categoría y Subcategoría
    if (!data.categoryId || !data.subcategoryId) {
      throw new Error("Category and Subcategory are required for SKU generation");
    }

    const category = await this.categoryService.getCategoryById(data.categoryId);
    if (!category) throw new Error("Category not found");

    const subcategories = await this.categoryService.getSubcategoriesByCategoryId(data.categoryId);
    const subcategory = subcategories.find(s => s.id === data.subcategoryId);
    if (!subcategory) throw new Error("Subcategory not found");

    // 2. Generar Prefijo de SKU (3 letras CAT + 3 letras SUB)
    const catPrefix = category.name.substring(0, 3).toUpperCase();
    const subPrefix = subcategory.name.substring(0, 3).toUpperCase();
    const skuPrefix = `${catPrefix}${subPrefix}`;

    // 3. Obtener Siguiente Secuencia
    const sequenceValue = await this.sequenceService.getNextSequenceValue(skuPrefix);

    // 4. Formatear SKU final (ej. FER-MAN-00001)
    const sku = `${skuPrefix}-${sequenceValue.toString().padStart(5, '0')}`;

    // Generar índices de búsqueda
    const searchName = (data.name || '').toUpperCase();
    const finalData = { ...data, sku, name: data.name || '' }; // Ensure data has sku/name for search array
    const searchArray = this.generateSearchArray(finalData);

    const newProduct: ProductDoc = {
      ...data,
      id: docRef.id,
      sku: sku, // Override/Set SKU
      name: data.name || '',
      searchName,
      searchArray,
      categoryId: data.categoryId,
      subcategoryId: data.subcategoryId,
      brand: data.brand || '',
      prices: data.prices || [],
      unitPerBox: data.unitPerBox || 1,
      images: data.images || [],
      description: data.description || '',
      isActive: data.isActive ?? true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      stockUnits: data.stockUnits || 0,
      stockBoxes: data.stockBoxes || 0,
    } as ProductDoc;

    await docRef.set(newProduct);
    return docRef.id;
  }

  /**
   * Actualiza un producto existente
   */
  async updateProduct(id: string, data: Partial<ProductDoc>): Promise<void> {
    const docRef = this.productsCollection.doc(id);

    const updates: any = {
      ...data,
      updatedAt: Date.now(),
    };

    // Actualizar índices si cambian campos relevantes
    if (data.name || data.sku || data.brand) {
      if (data.name) updates.searchName = data.name.toUpperCase();

      if (data.name || data.sku || data.brand) {
        const dummyForSearch = {
          name: data.name || '',
          sku: data.sku || '',
          brand: data.brand || ''
        };
        // Solo actualizamos searchArray si tenemos el nombre, que es lo más crítico
        if (data.name) {
          updates.searchArray = this.generateSearchArray(dummyForSearch);
        }
      }
    }

    await docRef.update(updates);
  }

  /**
   * Elimina un producto (Soft Delete o Hard Delete según requerimiento)
   * Aquí usamos Hard Delete directo
   */
  async deleteProduct(id: string): Promise<void> {
    await this.productsCollection.doc(id).delete();
  }

  /**
   * Genera array de búsqueda para Firestore
   */
  private generateSearchArray(data: Partial<ProductDoc>): string[] {
    const terms = [
      data.name,
      data.sku,
      data.brand,
      ...(data.name?.split(' ') || [])
    ].filter(Boolean).map(t => t!.toUpperCase());

    // Eliminar duplicados
    return [...new Set(terms)];
  }
}