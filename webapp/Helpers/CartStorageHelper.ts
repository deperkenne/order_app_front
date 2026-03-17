import { OrderItemStorage } from "../Repositories/impl/Order_ItemStrorage_impl";
import { IorderItemStorage } from "../Repositories/IOrder_ItemStorageRepository";

// CartStorageHelper.ts
export class CartStorageHelper {

    // Parse JSON string to array
    static parseCartItems(sCart: string): any[] {
        if (!sCart || sCart.trim() === "" || sCart.startsWith("[object")) {
            return [];
        }
        try {
            let parsed = JSON.parse(sCart);
            if (typeof parsed === "string") {
                parsed = JSON.parse(parsed);
            }
            console.log("JSON parsé avec succès:", parsed.length, "items");
            return parsed;
        } catch (parseError) {
            console.error("Erreur parsing JSON:", parseError);
            console.error("Contenu:", sCart);
            return [];
        }
    }

    //  Resolve cart items (string or array)
    static resolveCartItems(sCart: string | any[]): any[] {
        if (Array.isArray(sCart)) {
            console.log("Storage retourne déjà un tableau");
            return sCart;
        }
        return this.parseCartItems(sCart);
    }

    // Parse total amount safely
    static parseTotalAmount(sTotalAmount: string): number {
        if (!sTotalAmount || sTotalAmount === "null" || sTotalAmount === "undefined") {
            return 0;
        }
        const nTotal = parseFloat(sTotalAmount);
        if (isNaN(nTotal)) {
            console.warn("Total invalide, initialisation à 0");
            return 0;
        }
        return nTotal;
    }

    // Parse count safely
    static parseCartCount(sCount: string): number {
        if (!sCount || sCount === "null" || sCount === "undefined") {
            return 0;
        }
        const nCount = parseInt(sCount, 10);
        if (isNaN(nCount)) {
            console.warn("Count invalide, initialisation à 0");
            return 0;
        }
        return nCount;
    }

    //  Read all cart data from storage
    static resolveCartFromStorage(storage: IorderItemStorage): {
        items: any[];
        totalAmount: number;
        count: number;
    } {
       // storage = new  OrderItemStorage()
        const sCart = storage.getOrderItem("myCart") ?? "";        
        const sTotalAmount = storage.getOrderItem("myTotal") ?? ""; 
        const sCountCart = storage.getOrderItem("myCount") ?? ""; 
        
        console.log("start total", sTotalAmount);

        return {
            items: this.resolveCartItems(sCart),
            totalAmount: this.parseTotalAmount(sTotalAmount),
            count: this.parseCartCount(sCountCart),
        };
    }
}