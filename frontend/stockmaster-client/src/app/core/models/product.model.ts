export type priceLabel = 'unit' | 'wholesale' | 'box';
export interface PriceTier {
  label: priceLabel;
  price: number;
  minQuantity?: number;
}
export interface Product {
  id: string;
  sku: string;
  name: string;
  searchName:string;
  brand?: string;
  prices: PriceTier[];
  unitPerBox?: number;
  images?: string[];
}