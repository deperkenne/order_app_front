import { IOrderRepository } from "../Repositories/IOrderRepository";
import { IOrder } from "../model/IOrder";
import { OrderItem } from "../model/Order_items";
import { IOrderStorageRepo } from "../Repositories/IOrderStorageRepository";
export class OrderService {
       readonly  orderRepo :  IOrderRepository
       private iorderstorageRepo: IOrderStorageRepo;

       constructor(orderRepo: IOrderRepository, iorderstorageRepo : IOrderStorageRepo ) {
              this.orderRepo = orderRepo;
              this.iorderstorageRepo = iorderstorageRepo
       }

        async saveOrder (order:IOrder): Promise<IOrder>{  
            try {
                    const savedOrder = await this.orderRepo.createOrder(order);
                    console.log('Réponse complète SAP:', JSON.stringify(savedOrder, null, 2));
                    const orderUuid = savedOrder?.OrderUuid
                    if (savedOrder && orderUuid) {
                        // Sauvegarde dans le sessionStorage pour lier les futurs OrderItems
                        this.iorderstorageRepo.setOrderUuid(orderUuid);
                        console.log("UUID de commande synchronisé avec le stockage local.");
                    } else {
                        console.warn("La commande a été créée mais aucun UUID n'a été retourné par SAP.");
                    }
                    return savedOrder;
                } catch (error) {
                    console.error("Error during saved order", error);
                    throw error; 
            }
        }

       async getOrderWithItems(orderUuid: string, productId: number):Promise<{ order: IOrder, items: OrderItem[] }>{
           return this.orderRepo.getOrderWithFilteredItems(orderUuid,productId)
       }

}
