export interface Price {
  label: string;
  price: number;
  minQuantity?: number;
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
  images: string[];
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
  stockUnits: number;
  stockBoxes: number;
}

export type Product = Omit<ProductDoc, "categoryId" | "subcategoryId"> & {
  category?: Category;
  subCategory?: Subcategory;
};
