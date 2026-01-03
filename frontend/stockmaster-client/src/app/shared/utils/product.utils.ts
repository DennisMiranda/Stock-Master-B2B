import { Price, Variant } from "../../core/models/product.model";

/**
 * Utility functions for Product Logic (B2B Pricing & Transformations)
 */
export class ProductUtils {

    /**
     * Calculates the wholesale price based on base price and discount percentage.
     */
    static calculateWholesalePrice(basePrice: number, discountPercent: number): number {
        if (!basePrice || basePrice < 0) return 0;
        const discount = (discountPercent || 0) / 100;
        return parseFloat((basePrice * (1 - discount)).toFixed(2));
    }

    /**
     * Calculates the box price based on base unit price, units per box, and box discount percentage.
     */
    static calculateBoxPrice(baseUnitPrice: number, unitsPerBox: number, boxDiscountPercent: number): number {
        if (!baseUnitPrice || !unitsPerBox) return 0;
        const totalBase = baseUnitPrice * unitsPerBox;
        const discount = (boxDiscountPercent || 0) / 100;
        return parseFloat((totalBase * (1 - discount)).toFixed(2));
    }

    /**
     * Transforms the flat form values into the strict Product/Price structure.
     * Maps 'Unitario'/'Box' inputs to 'unit'/'box' variants with nested discounts.
     */
    static formatProductPayload(formValue: any, images: string[]): any {
        const {
            priceUnit,
            priceBox,
            wholesaleDiscount,
            wholesaleMinQty, // Extraction
            unitPerBox,
            description,
            // Destructure others to separate them from clean payload
            boxDiscount,
            ...otherFields
        } = formValue;

        // 1. Calculate Wholesale Price (Logic Rule: Min 3 units for wholesale)
        const wholesalePrice = ProductUtils.calculateWholesalePrice(priceUnit, wholesaleDiscount);

        // 2. Build Prices Array
        const prices: Price[] = [];

        // Variant: UNIT
        // Contains standard price + wholesale discount rule
        const unitPrice: Price = {
            label: 'unit',
            price: priceUnit,
            discounts: []
        };

        if (wholesaleDiscount > 0) {
            unitPrice.discounts?.push({
                minQuantity: wholesaleMinQty || 3, // Use dynamic value, fallback to 3
                price: wholesalePrice
            });
        }
        prices.push(unitPrice);

        // Variant: BOX
        // Contains standard box price. Usually no further discounts on box yet, but scalable.
        const boxPriceEntry: Price = {
            label: 'box',
            price: priceBox,
            discounts: []
        };
        prices.push(boxPriceEntry);

        return {
            ...otherFields,
            description: description || '',
            unitPerBox: unitPerBox,
            prices,
            images
        };
    }
}
