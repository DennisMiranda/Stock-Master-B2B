export type Variant = 'unit' | 'box';

export interface Discount {
  minQuantity: number;
  price: number;
}

export type Price = {
  label: Variant;
  price: number;
  discounts?: Discount[];
};
export interface Product {
  id: string;
  sku: string;
  name: string;
  searchName: string;

  description?: string;
  categoryId?: string;
  subcategoryId?: string;
  brand?: string;
  prices: Price[];
  unitPerBox?: number;
  images?: string[];
  isActive?: boolean;
  createdAt?: number; // timestamp en ms
  updatedAt?: number; // timestamp en ms
  stockUnits?: number;
  stockBoxes?: number;
}

