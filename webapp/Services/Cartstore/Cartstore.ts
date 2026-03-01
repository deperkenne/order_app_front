
import JSONModel          from "sap/ui/model/json/JSONModel";
import { ICartStore,
         ICartItem }      from "../Interfaces/IcartService";

export class CartStore implements ICartStore {

    constructor(private readonly model: JSONModel) {}

    getItems(): ICartItem[] {
        return this.model.getProperty("/filteredItems") || [];
    }

    setItems(items: ICartItem[]): void {
        this.model.setProperty("/filteredItems", items);
    }

    setTotal(total: string): void {
        this.model.setProperty("/totalAmount", total);
    }

    setCount(count: number): void {
        this.model.setProperty("/countSelectedProduct", count);
    }
}