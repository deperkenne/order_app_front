import { OrderItemStorage } from "../Repositories/impl/Order_ItemStrorage_impl";
import { OrderStorageImpl } from "../Repositories/impl/OrderStorageImpl";
import { ZProductImpl } from "../Repositories/impl/ZProductImpl";
import { IorderItemStorage } from "../Repositories/IOrder_ItemStorageRepository";
import { IProductRepos } from "../Repositories/IProductRepository";
import { ProductService } from "../Services/ProductService";
import { ODataRequestErrorHelper } from "./oDataRequestErrorHelper";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import { OrderDependencies } from "./OrderDependencies";
import { IOrderRepository } from "../Repositories/IOrderRepository";
import { IOrderStorageRepo } from "../Repositories/IOrderStorageRepository";
import { OrderService } from "../Services/OrderService";
import { OrderImpl } from "../Repositories/impl/OrderImpl";

 export function InitService( 
        iProductRepo:IProductRepos, 
        oODataModel:ODataModel,
        _oDataRequestErrorHelper:ODataRequestErrorHelper,
        iOrderItemStorage:IorderItemStorage, 
        productService:ProductService,
        iOrderRepository:IOrderRepository,
        iOrderStorage: IOrderStorageRepo,
        orderService: OrderService
    
    ): OrderDependencies
        {
        _oDataRequestErrorHelper = new ODataRequestErrorHelper();
        iProductRepo = new ZProductImpl (oODataModel,_oDataRequestErrorHelper);
        productService = new ProductService(iProductRepo);
        iOrderItemStorage = new OrderItemStorage();
        iOrderStorage = new OrderStorageImpl();
        iOrderRepository = new OrderImpl(oODataModel, _oDataRequestErrorHelper);
        orderService  = new OrderService ( iOrderRepository,iOrderStorage);

        return  new  OrderDependencies(
                                      iProductRepo,
                                      productService,
                                      iOrderItemStorage,
                                      iOrderRepository,
                                      iOrderStorage,
                                      orderService
                                    
                                    )
    }