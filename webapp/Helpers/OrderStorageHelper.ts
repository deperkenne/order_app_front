import { IOrderStorageRepo } from "../Repositories/IOrderStorageRepository";

export class OrderStorageHelper {
    static hasExistingOrder(iorderStorage:IOrderStorageRepo): boolean {
        const orderUuid = iorderStorage.getOrderUuid() || '';
        if (orderUuid) {
            console.log('Commande existante:', orderUuid);
            return true;
        }
        return false;
    }
}