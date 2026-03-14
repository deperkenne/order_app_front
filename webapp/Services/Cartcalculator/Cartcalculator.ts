

import { ICartCalculator, ICartItem } from "../Interfaces/IcartService";
import { Zproduct } from "../../model/Zproduct";


export class CartCalculator implements ICartCalculator {

    // Sums all item grossAmounts and returns the total as a fixed 2-decimal string
    recalculateTotal(items: ICartItem[]): string {
        if (!Array.isArray(items)) return "0.00";

        const total = items.reduce((sum, item) => {
            return sum + (item.grossAmount || 0);
        }, 0);

        return isNaN(total) ? "0.00" : total.toFixed(2);
    }

    // Creates a new cart item from a product and an initial quantity
    buildNewItem(product: Zproduct, quantity: number): ICartItem {
        const grossAmount = quantity * parseFloat(String(product.Price));
        return {
            itemUuid:    "",
            productId:   product.ProductId,
            productName: product.Productname,
            imageUrl:    product.ImageUrl || "",
            price:       parseFloat(String(product.Price)),
            currency:    "EUR",
            quantity,
            // Fallback to 0.00 if grossAmount could not be computed
            grossAmount: grossAmount == undefined ? 0.00 : grossAmount
        };
    }

    // Returns a new item with quantity and grossAmount incremented by one unit
    incrementItem(item: ICartItem): ICartItem {
        const newQty   = item.quantity + 1;
        const newGross = (newQty * item.price);
        return { ...item, quantity: newQty, grossAmount: newGross };
    }
}