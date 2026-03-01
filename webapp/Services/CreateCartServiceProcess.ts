import { CartCalculator } from "./Cartcalculator/Cartcalculator";
import { CartPersistence } from "./CartPersistence";
import { CartServiceProcess } from "./CartServiceProcess";
import { CartStore } from "./Cartstore/Cartstore";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import JSONModel from "sap/ui/model/json/JSONModel";
import { ODataRequestErrorHelper } from "../Helpers/oDataRequestErrorHelper";
import { IorderItemStorage } from "../Repositories/IOrder_ItemStorageRepository";
import { BatchServiceProcess } from "./BatchService";
import { createBatchService } from "./CreateBatchService";
import { OrderStorageImpl } from "../Repositories/impl/OrderStorageImpl";
 

    export function CreateCartServiceProcess(oModel: ODataModel, productModel:JSONModel,
        _oDataRequestErrorHelper: ODataRequestErrorHelper,iOrderItemStorage:IorderItemStorage): CartServiceProcess{
          
         const  batchServiceProcess = createBatchService(oModel,_oDataRequestErrorHelper)
         return new CartServiceProcess(
               new CartStore(productModel as any),
               new CartCalculator(),
               new CartPersistence(iOrderItemStorage),
               new OrderStorageImpl(),
               batchServiceProcess
     
        );

    }