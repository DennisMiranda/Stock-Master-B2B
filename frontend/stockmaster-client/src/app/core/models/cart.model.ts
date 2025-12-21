import type { Product } from './product.model';
export type Variant = 'unit' | 'box';
export type ProductWithPrice = Omit<Product, 'prices'> & {
  price: number;
};
export type ProductPartial = Partial<ProductWithPrice>;
export interface CartItem {
  productId: string;
  variant: Variant;
  quantity: number;
   maxQuantity: number;
  product: ProductPartial;
}
