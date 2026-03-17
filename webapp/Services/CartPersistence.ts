

import { IorderItemStorage } from "../Repositories/IOrder_ItemStorageRepository";
import { ICartPersistence,
         ICartItem }         from "./Interfaces/IcartService";

export class CartPersistence implements ICartPersistence {
    
    constructor(private readonly storage: IorderItemStorage) {
    }

    save(items: ICartItem[], total: string, count: number): void {
        this.storage.setOrderItem("myCart",  JSON.stringify(items));
        this.storage.setOrderItem("myTotal", total);
        this.storage.setOrderItem("myCount", String(count));
    }
}