import { Timestamp } from "firebase-admin/firestore";
import { db } from "../../config/firebase";
import type {
  CustomResponse as CustomResponseModel,
  ResponseError,
} from "../../models/custom-response.model";
import {
  Order,
  ORDER_STATUS,
  ORDER_VARIANT,
  OrderDetailItem,
  OrderStatus,
} from "../../models/order.model";
import { Product } from "../../models/product.model";
import { CustomResponse } from "../../utils/custom-response";
import { paginateQuery } from "../../utils/pagination";
import { ProductService } from "../product.service";
import { StatisticService } from "../statistic.service";


interface CreateOrderError {
  item: Partial<OrderDetailItem>;
  suggestions?: Product[];
}

export class OrderService {
  private ordersCollection = db.collection("orders");
  private productsCollection = db.collection("products");
  constructor(
    private productService: ProductService = new ProductService(),
    private statisticService: StatisticService = new StatisticService(),

  ) {}
  async getOrdersPaginated(params: { page?: number; limit?: number }) {
    let query = this.ordersCollection.orderBy("createdAt", "desc");

    const { data, metadata } = await paginateQuery<Order>(query, params);

    return {
      orders: data,
      metadata,
    };
  }

  async getOrderById(id: string) {
    const snapshot = await this.ordersCollection.doc(id).get();

    return snapshot.data();
  }

  async getOrdersByUserId(
    userId: string,
    params: { page?: number; limit?: number }
  ) {
    let query = this.ordersCollection
      .where("uid", "==", userId)
      .orderBy("createdAt", "desc");
    const { data, metadata } = await paginateQuery<Order>(query, params);

    return {
      orders: data,
      metadata,
    };
  }

  async createOrder(
    order: Order
  ): Promise<
    CustomResponseModel<Order | null, ResponseError<CreateOrderError>[] | null>
  > {
     const errors: ResponseError<CreateOrderError>[] = [];
    try {
     return await db.runTransaction(async (tx) => {
        const orderItems: OrderDetailItem[] = [];

        const productsMap = await this.productService.getProductsMapById(
          order.items.map((item) => item.id),
          tx
        );

        // 1️. VALIDAR Y DESCONTAR STOCK
        for (const item of order.items) {
          const product = productsMap[item.id];
          const productRef = this.productsCollection.doc(item.id);

          if (!product) {
            errors.push({
              code: "PRODUCT_NOT_FOUND",
              message: "Producto no encontrado",
              details: { item },
            });
            continue;
          }

          let availableStock = 0;

          //Validar stock
          if (item.variant === ORDER_VARIANT.unit) {
            availableStock = product.stockUnits;
          } else if (item.variant === ORDER_VARIANT.box) {
            availableStock = product.stockBoxes;
          }

          if (availableStock < item.quantity) {
            const suggestions = await this.productService.searchProducts({
              subcategoryId: product.subcategoryId,
              limit: 5,
              minRequiredStock: item.quantity,
              variant: item.variant,
            });

            errors.push({
              code: "INSUFFICIENT_STOCK",
              message: "Stock insuficiente",
              details: {
                item: {
                  ...item,
                  name: product.name,
                  imageUrl: product.images?.[0],
                  stockUnits: product.stockUnits,
                  stockBoxes: product.stockBoxes,
                },
                suggestions: suggestions.products,
              },
            });
            continue;
          }

          // 2️. DESCONTAR
          if (item.variant === ORDER_VARIANT.unit) {
            tx.update(productRef, {
              stockUnits: availableStock - item.quantity,
              updatedAt: Date.now(),
            });
          } else if (item.variant === ORDER_VARIANT.box) {
            tx.update(productRef, {
              stockBoxes: availableStock - item.quantity,
              updatedAt: Date.now(),
            });
          }

          const priceVariant = product.prices.find(
            (price) => price.label === item.variant
          );
          let unitPrice = priceVariant?.price || 0;

          // Calcular precio con descuento (B2B Logic)
          if (priceVariant?.discounts?.length) {
            const sortedDiscounts = [...priceVariant.discounts].sort(
              (a, b) => b.minQuantity - a.minQuantity
            );
            const applicableDiscount = sortedDiscounts.find(
              (d) => item.quantity >= d.minQuantity
            );
            if (applicableDiscount) {
              unitPrice = applicableDiscount.price;
            }
          }

          // 3️. SNAPSHOT DEL ITEM
          orderItems.push({
            id: product.id,
            sku: product.sku,
            name: product.name,
            brand: product.brand,
            variant: item.variant,
            quantity: item.quantity,
            unitPrice: unitPrice,
            subTotal: unitPrice * item.quantity,
            unitPerBox: product.unitPerBox,
            imageUrl: product.images?.[0],
          });
        }

        if (errors.length > 0) {
          // Fail the transaction
          throw new Error("ORDER_VALIDATION_ERROR");
        }

        // 4️. CREAR ORDEN
        const orderRef = this.ordersCollection.doc();

        const finalOrder: Order = {
          ...order,
          id: orderRef.id,
          items: orderItems,
          status: ORDER_STATUS.created,
          createdAt: Date.now(),
        };

        tx.set(orderRef, finalOrder);

        // 5. SAVE SOLD PRODUCTS COUNT
        await this.statisticService.updateSoldProducts(orderItems);

        return CustomResponse.success(finalOrder, "Orden creada exitosamente");
      });

    } catch (error) {
      return CustomResponse.error(
        "ORDER_ERROR",
        "Error al crear la orden",
        errors
      );
    }
  }

  async updateOrder(orderId: string, order: Order) {
    const orderRef = this.ordersCollection.doc(orderId);
    orderRef.update({
      ...order,
      updatedAt: Timestamp.now(),
    });

    return await this.getOrderById(orderId);
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    return this.update(id, { status });
  }
  async update(id: string, data: Partial<Order>): Promise<Order> {
    const docRef = this.ordersCollection.doc(id);
    await docRef.update({ ...data, updatedAt: Date.now() });
    const snapshot = await docRef.get();
    return snapshot.data() as Order;
  }

  async getOrdersPendingForDelivery(params: { page?: number; limit?: number }) {
    let query = this.ordersCollection
      .where("status", "in", [ORDER_STATUS.ready])
      .orderBy("createdAt", "desc");

    const { data, metadata } = await paginateQuery<Order>(query, params);

    return {
      orders: data,
      metadata,
    };
  }
}
