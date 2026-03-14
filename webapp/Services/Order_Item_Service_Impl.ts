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
                return null;
            }
        } 
        return null;
    }

    async decrease_qty(itemUuid:string): Promise<OrderItem | null>{
         return await this.orderItemRepo.decrease_qty(itemUuid)
    }
}