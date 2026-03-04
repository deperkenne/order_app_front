
import { IOrderRepository } from "../Repositories/IOrderRepository";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import { ODataRequestErrorHelper } from "../Helpers/oDataRequestErrorHelper";
import { OrderImpl } from "../Repositories/impl/OrderImpl";
import { IOrderStorageRepo } from "../Repositories/IOrderStorageRepository";
import { OrderService } from "../Services/OrderService";
import { OrderStorageImpl } from "../Repositories/impl/OrderStorageImpl";

export class CreateOrderDependencies {
    
    static initializeOrderDependencies(
        oModel: ODataModel,
        _oDataRequestErrorHelper: ODataRequestErrorHelper,
        iOrderRepository: IOrderRepository,
        iOrderStorageRepo: IOrderStorageRepo,
        orderService: OrderService
    ): void {
         iOrderStorageRepo = new OrderStorageImpl();
         iOrderRepository = new OrderImpl(oModel, _oDataRequestErrorHelper);
         orderService  = new OrderService ( iOrderRepository,iOrderStorageRepo);
    }
}
