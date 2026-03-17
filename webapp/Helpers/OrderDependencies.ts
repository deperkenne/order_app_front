import { ZProductImpl } from "../Repositories/impl/ZProductImpl";
import { IorderItemStorage } from "../Repositories/IOrder_ItemStorageRepository";
import { IOrderRepository } from "../Repositories/IOrderRepository";
import { IOrderStorageRepo } from "../Repositories/IOrderStorageRepository";
import { IProductRepos } from "../Repositories/IProductRepository";
import { OrderService } from "../Services/OrderService";
import { ProductService } from "../Services/ProductService";
import { ODataRequestErrorHelper } from "./oDataRequestErrorHelper";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";

export class OrderDependencies{
    oODataModel:ODataModel
    oDataRequestErrorHelper: ODataRequestErrorHelper
    iProductRepo:IProductRepos
   
    iOrderItemStorage:IorderItemStorage
    productService:ProductService
    iOrderRepository:IOrderRepository
    iOrderStorage: IOrderStorageRepo
    orderService: OrderService

   constructor(
        iProductRepo: IProductRepos,
        productService: ProductService,
        iOrderItemStorage: IorderItemStorage,
        iOrderRepository:IOrderRepository,
        iOrderStorage: IOrderStorageRepo,
        orderService: OrderService,
       
    ) {
        this.iProductRepo = iProductRepo;
        this.productService = productService;
        this.iOrderItemStorage = iOrderItemStorage;
        this.iOrderRepository = iOrderRepository;
        this.iOrderStorage = iOrderStorage;
        this.orderService = orderService 
    }
   

}