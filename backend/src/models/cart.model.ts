export type Variant = "unit" | "box";
export type Discounts = { minQuantity: number; price: number };
export type Prices = {
  label: Variant;
  price: number;
  discounts?: Discounts[];
};

export interface CartItem {
  productId: string;
  variant: Variant;
  quantity: number;
}

export interface ProductPricing {
  prices: Prices[];
  stockUnits: number;
  stockBoxes: number;
  unitPerBox: number;
}
