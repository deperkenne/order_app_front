
import { IorderItemStorage} from "../Repositories/IOrder_ItemStorageRepository";

export class ProductStorageHelper {
        //  Read raw string from localstorage
    static  getRawProductString(storage: IorderItemStorage): string {
        return storage.getOrderItem("myProducts") ?? "";
    }

    //  Validate the raw string
    static isValidProductString(sProduct: string): boolean {
        if (!sProduct || sProduct.trim() === "") return false;
        if (sProduct.startsWith("[object")) return false;
        return true;
    }

    // Parse JSON string to array
    static parseProductString(sProduct: string): any[] {
        try {
            let parsed = JSON.parse(sProduct);
            if (typeof parsed === "string") {
                parsed = JSON.parse(parsed);
            }
            console.log("JSON parsé avec succès:", parsed.length, "items");
            return parsed;
        } catch (parseError) {
            console.error("Erreur parsing JSON:", parseError);
            console.error("Contenu:", sProduct);
            return [];
        }
    }

    static resolveProductsFromStorage(storage: IorderItemStorage): any[] {
        const sProduct = this.getRawProductString(storage);

        if (!this.isValidProductString(sProduct)) {
            console.log("Produits invalides ou vides en mémoire");
            return [];
        }

    return this.parseProductString(sProduct);
   }
}