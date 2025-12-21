// cart.service.ts
import { db } from "../config/firebase";
import type { CartItem, ProductPricing, Variant } from "../models/cart.model";

export class CartService {
  private cartRef(userId: string) {
    return db.collection("users").doc(userId).collection("cart");
  }

  private async getProductPricing(productId: string): Promise<ProductPricing> {
    const doc = await db.collection("products").doc(productId).get();
    if (!doc.exists) throw new Error("PRODUCT_NOT_FOUND");
    return doc.data() as ProductPricing;
  }


async getCart(userId: string): Promise<(CartItem & { product: any })[]> {
  const snap = await this.cartRef(userId).get();

  const items: (CartItem & { product: any })[] = [];

  for (const doc of snap.docs) {
    const cartItem = doc.data() as CartItem;

    const productDoc = await db.collection('products').doc(cartItem.productId).get();
    if (!productDoc.exists) continue;
    const productData = productDoc.data();
    const variantPrice = productData?.prices?.find(
      (p: any) => p.label === cartItem.variant
    )?.price ?? 0;

    items.push({
      ...cartItem,
      product: {
        id: productDoc.id,
        name: productData?.name,
        brand: productData?.brand,
        images: productData?.images,
        price: variantPrice          
      }
    });
  }

  return items;
}



  async addItem(userId: string, item: Pick<CartItem, 'productId' | 'variant' | 'quantity'>): Promise<CartItem[]> {
  const productDoc = await db.collection('products').doc(item.productId).get();
  if (!productDoc.exists) throw new Error('PRODUCT_NOT_FOUND');

  const key = `${item.productId}_${item.variant}`;
  const ref = this.cartRef(userId).doc(key);

  await ref.set({
    productId: item.productId,
    variant: item.variant,
    quantity: item.quantity,
  }, { merge: true });

  return this.getCart(userId);
}


  async removeItem(
    userId: string,
    productId: string,
    variant: Variant
  ): Promise<CartItem[]> {
    const key = `${productId}_${variant}`;
    await this.cartRef(userId).doc(key).delete();
    return this.getCart(userId);
  }

  async clearCart(userId: string): Promise<void> {
    const snap = await this.cartRef(userId).get();
    const batch = db.batch();
    snap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }

  async updateQuantity(
    userId: string,
    productId: string,
    variant: Variant,
    quantity: number
  ): Promise<CartItem[]> {

    const key = `${productId}_${variant}`;
    const ref = this.cartRef(userId).doc(key);

    if (quantity <= 0) {
      await ref.delete();
    } else {
      await ref.set(
        {
          productId,
          variant,
          quantity,
        },
        { merge: true }
      );
    }

    return this.getCart(userId);
  }

  async mergeCart(
    userId: string,
    localItems: Array<Pick<CartItem, "productId" | "variant" | "quantity">>
  ): Promise<CartItem[]> {
    const batch = db.batch();

    for (const li of localItems) {
      const pricing = await this.getProductPricing(li.productId);
      const key = `${li.productId}_${li.variant}`;
      const ref = this.cartRef(userId).doc(key);

      const doc = await ref.get();
      if (doc.exists) {
        const existing = doc.data() as CartItem;
        const newQuantity = existing.quantity + li.quantity;


        batch.set(
          ref,
          {
            productId: li.productId,
            variant: li.variant,
            quantity: newQuantity,
          },
          { merge: true }
        );
      } else {

        batch.set(ref, {
          productId: li.productId,
          variant: li.variant,
          quantity: li.quantity,
        });
      }
    }

    await batch.commit();
    return this.getCart(userId);
  }
}
