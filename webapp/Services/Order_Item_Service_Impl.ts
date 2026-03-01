import { IOrderItemRepo } from "../Repositories/IOrder_ItemRepository";
import { OrderItem } from "../model/Order_items";
import { IOrderStorageRepo } from "../Repositories/IOrderStorageRepository";
export class OrderItemService {
    private orderUuid: string;
    private readonly orderItemRepo: IOrderItemRepo 
    private iorderstorageRepo: IOrderStorageRepo;
    constructor(orderItemRepo: IOrderItemRepo , iorderstorageRepo: IOrderStorageRepo) {
                this.orderItemRepo = orderItemRepo;
                this.iorderstorageRepo = iorderstorageRepo
    }
async CreateOrderItem(orderItem: OrderItem): Promise<OrderItem | null> {
    
    this.orderUuid = this.iorderstorageRepo.getOrderUuid() ?? "";

    if (this.orderUuid !== "") {
        try {
            const savedItem = await this.orderItemRepo.saveOrderItem(orderItem, this.orderUuid);
            return savedItem;
        } catch (error) {
            console.error("Erreur lors de la sauvegarde de l'item:", error);
            return null;
        }
    } 
    console.error("Impossible de créer l'item : OrderUuid est manquant.");
    return null;
}
}