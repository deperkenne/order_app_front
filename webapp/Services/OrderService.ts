import { IOrderRepository } from "../Repositories/IOrderRepository";
import { IOrder } from "../model/IOrder";
import { OrderItem } from "../model/Order_items";
import { IOrderStorageRepo } from "../Repositories/IOrderStorageRepository";

export class OrderService {

    private orderRepo :  IOrderRepository
    private iorderstorageRepo: IOrderStorageRepo;

    constructor(orderRepo: IOrderRepository, iorderstorageRepo : IOrderStorageRepo ) {
            this.orderRepo = orderRepo;
            this.iorderstorageRepo = iorderstorageRepo
    }

    async saveOrder (order:IOrder): Promise<IOrder>{  

        try {
                const savedOrder = await this.orderRepo.createOrder(order);
                console.log('Réponse complète SAP:', JSON.stringify(savedOrder, null, 2));
                const orderUuid = savedOrder?.OrderUuid;

                if (savedOrder && orderUuid) {
                    this.iorderstorageRepo.setOrderUuid(orderUuid);   
                } else {
                    console.warn("La commande a été créée mais aucun UUID n'a été retourné par SAP.");
                }

                return savedOrder;
            } catch (error) {
                throw error; 
        }
    }

    async orderActivated(orderUuid: string):Promise<any>{
        return this.orderRepo.activateOrder(orderUuid)
    }

    async getOrderWithItems(orderUuid: string, productId: number):Promise<{ order: IOrder, items: OrderItem[] }>{
        return this.orderRepo.getOrderWithFilteredItems(orderUuid,productId)
    }
}
