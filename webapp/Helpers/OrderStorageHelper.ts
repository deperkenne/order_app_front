import { OrderStorageImpl } from "../Repositories/impl/OrderStorageImpl";
import { IOrderStorageRepo } from "../Repositories/IOrderStorageRepository";

export class OrderStorageHelper {
    static hasExistingOrder(iorderStorage:IOrderStorageRepo): boolean {
       iorderStorage = new OrderStorageImpl()
        const orderUuid = iorderStorage.getOrderUuid() || '';
        if (orderUuid) {
            console.log('Commande existante:', orderUuid);
            return true;
        }
        return false;
    }

    
}