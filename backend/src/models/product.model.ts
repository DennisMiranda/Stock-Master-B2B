export type Variant = 'unit' | 'box';

export interface Discount {
  minQuantity: number;
  price: number;
}

export interface Price {
  label: Variant;
  price: number;
  discounts?: Discount[];
}

export interface Category {
  id: string;
  name: string;
}

export interface Subcategory {
  id: string;
  name: string;
}

export interface ProductDoc {
  id: string;
  sku: string;
  name: string;
  searchName: string;
  categoryId: string;
  subcategoryId: string;
  brand: string;
  prices: Price[];
  unitPerBox: number;
  description?: string;
  images: string[];
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
  stockUnits: number;
  stockBoxes: number;
  searchArray?: string[];
}

export type Product = Omit<ProductDoc, "categoryId" | "subcategoryId"> & {
  category?: Category;
  subCategory?: Subcategory;
};
