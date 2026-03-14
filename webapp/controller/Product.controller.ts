import Controller from "sap/ui/core/mvc/Controller"
import JSONModel from "sap/ui/model/json/JSONModel";
import { IProduct } from "../model/IProduct";
import { Zproduct } from "../model/Zproduct";
import MessageToast from "sap/m/MessageToast";
import { ProductService } from "../Services/ProductService";
import { IProductRepos } from "../Repositories/IProductRepository";
import { ZProductImpl } from "../Repositories/impl/ZProductImpl";
import {ODataRequestErrorHelper} from "../Helpers/oDataRequestErrorHelper";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import { OrderService } from "../Services/OrderService";
import { IOrderStorageRepo } from "../Repositories/IOrderStorageRepository";
import { OrderStorageImpl } from "../Repositories/impl/OrderStorageImpl";
import { IOrderRepository } from "../Repositories/IOrderRepository";
import { OrderImpl } from "../Repositories/impl/OrderImpl";
import { IOrder } from "../model/IOrder";
import { IOrderItem } from "../model/IOrder_item";
import { BatchService } from "../Services/OrderBatchService";
import {  BatchServiceProcess } from "../Services/BatchService";
//import {CartService} from "../Services/CartService";
import { IorderItemStorage } from "../Repositories/IOrder_ItemStorageRepository";
import { OrderItemStorage } from "../Repositories/impl/Order_ItemStrorage_impl";
import { createBatchService } from "../Services/CreateBatchService";
import { CartServiceProcess } from "../Services/CartServiceProcess";
import { CreateCartServiceProcess } from "../Services/CreateCartServiceProcess";
import { ICartItem } from "../Services/Interfaces/IcartService";
//import Controller from "./BaseController"; // ou votre import habituel
import Fragment from "sap/ui/core/Fragment";
import Popover from "sap/m/Popover";
import Button from "sap/m/Button";
import Event from "sap/ui/base/Event";
import UIComponent from "sap/ui/core/UIComponent";
import { ProductStorageHelper } from "../Helpers/ProductStorageHelper";
import { CartStorageHelper } from "../Helpers/CartStorageHelper";
import { CreateOrderDependencies } from "../Helpers/CreateOrderDependencies";
import { OrderStorageHelper } from "../Helpers/OrderStorageHelper";
import {AuthService}  from  "../auth/authService";
import { OrderDependencies } from "../Helpers/OrderDependencies";
import { InitService } from "../Helpers/InitService";

export default class ProductsController extends Controller {

    private orderService : OrderService
    private batchServicep :  BatchServiceProcess
    private iOrderItemStorageRepo: IorderItemStorage
    private iorderStorage : IOrderStorageRepo
    private iorderRepo : IOrderRepository
    private productService : ProductService
    private iproductrepo : IProductRepos
    private orderBatchService:  BatchService;
    private authService: AuthService;
    private oODataModel : ODataModel
    private _oDataRequestErrorHelper : ODataRequestErrorHelper  
    private cartserviceProcess : CartServiceProcess   
    private orderDependencies : OrderDependencies
    private _oMobileMenu: Popover | null = null;
    private _pendingAction: any; 
    private _mDialogs: Map<string, Promise<any>> = new Map();
    private _bMenuLoading: boolean = false; 
    private _bExpanded : boolean
    products: Zproduct[] = [];
    OrderUuid: string = '';
    images: string[] = [
                "images/handy.jpg",
                "images/kopfhörer.jpg",
                "images/pc.jpg",
                "images/tablet.jpg",
                "images/Uhr.jpg",
                "images/Uhr.jpg",
        ];


 
    
     onInit(): void {
            
        this.oODataModel = this.getOwnerComponent()?.getModel() as ODataModel;
            
        this.orderDependencies = InitService
        (
            this.iproductrepo, 
            this.oODataModel,
            this._oDataRequestErrorHelper,
            this.iOrderItemStorageRepo,
            this.productService,
            this.iorderRepo,
            this.iorderStorage,
            this.orderService
        )
        
        this.batchServicep = createBatchService(this.oODataModel, this._oDataRequestErrorHelper);
        
        this.authService = AuthService.getInstance()
        
        this._bExpanded = false;
        
        // Initialiser le modèle UI avec isLoading à true
        const oUiModel = new JSONModel({ isLoading: true });
        this.getView()?.setModel(oUiModel, "ui1");

        const oModelUi  = new JSONModel({
            isCartVisible: false 

        })
        
        this.getView()?.setModel(oModelUi,"ui");
        const oModeldata = new JSONModel({
            products: [],
            cartItems: [], 
            totalAmount: 0,
            filteredItems: [],
            countSelectedProduct: 0

        })
        
        this.getView()?.setModel(oModeldata, "products");  
        const oModel = this.getView()?.getModel("products") as JSONModel;

        this.cartserviceProcess = CreateCartServiceProcess(
            this.oODataModel, 
            oModel,
            this._oDataRequestErrorHelper,
            this.orderDependencies.iOrderItemStorage,
        )

        this.authService.handleAuthCallback() 
        this.setCartModelFromMemory(oModel);
        this.saveOrder();
        this.setProductsWithFallback(oModel);  
                
    }

    public async orderActivate(oEvent: any):Promise<void>{
        const orderUuid = this.orderDependencies.iOrderStorage.getOrderUuid() || ""
        if(!orderUuid){
           return
        }
        this.orderService.orderActivated(orderUuid)
        this.iOrderItemStorageRepo.clearOrderItem("myCart");
        this.iOrderItemStorageRepo.clearOrderItem("myTotal");
        this.iOrderItemStorageRepo.clearOrderItem("myCount");

    }
    
    // Delegates the login action to the auth service
    public async onLoginPress(): Promise<void> {
        this.authService.onLoginPress();
    }

    // Navigates to the admin dashboard route
    public navigateToAdmin(): void {
        const oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo("RouteDashboardAdmin");
    }

    // Loads products from local storage and binds them to the model
    private setProductModelFromMemory(oModel: JSONModel): void {
        const products = ProductStorageHelper.resolveProductsFromStorage(this.iOrderItemStorageRepo);
        oModel.setProperty("/products", products);
    }

    // Loads cart data from local storage and binds items, total and count to the model
    private setCartModelFromMemory(oModel: JSONModel): void {
        const { items, totalAmount, count } = CartStorageHelper.resolveCartFromStorage(
            this.orderDependencies.iOrderItemStorage
        );

        oModel.setProperty("/filteredItems", items);
        oModel.setProperty("/totalAmount", totalAmount.toFixed(2));
        oModel.setProperty("/countSelectedProduct", count);
    }

    // Creates a new order on the backend — skips if an order already exists in storage
    private async saveOrder(): Promise<void> {

        if (OrderStorageHelper.hasExistingOrder(this.iorderStorage)) {
            console.log('Existing order:', this.OrderUuid);
            return;
        }

        const newOrder: IOrder = {
            "OrderId":     "2026003",
            "CustomerId":  "0000000014",
            "TotalAmount": 0,
            "Currency":    "EUR",
            "Status":      "PENDING"
        };

        if (!this.orderService) {
            console.log("class pas creer");
        }

        const response = await this.orderDependencies.orderService.saveOrder(newOrder);
    }

    // Loads products from storage if available, otherwise fetches them from the backend
    private async setProductsWithFallback(oModel: JSONModel): Promise<void> {
        const oUiModel = this.getView()?.getModel("ui1") as JSONModel;
        const sProducts = this.orderDependencies.iOrderItemStorage.getOrderItem("myProducts");

        if (!sProducts || sProducts === "null" || sProducts === "undefined" || sProducts.trim() === "") {
            try {

                // No cached data fetch from the backend and persist to storage
                const dProduct = await this.getProductFromDb();
                const sProducts = JSON.stringify(dProduct);
                this.orderDependencies.iOrderItemStorage.setOrderItem("myProducts", sProducts);
                oModel.setProperty("/products", this.products);
                console.log('Models created with', this.products);
            } catch (error) {
                console.error('Initialization error:', error);
            }finally {
            //  Cacher le loading une fois les données prêtes
            oUiModel?.setProperty("/isLoading", false);
        }
        } else {
            // Cached data found — restore products from storage
             oUiModel?.setProperty("/isLoading", false);
            this.setProductModelFromMemory(oModel);
        }
    }

    // Fetches all products from the backend and assigns image URLs by index
    private async getProductFromDb(): Promise<Zproduct[]> {
        try {
            const db_products = await this.orderDependencies.productService.getAllProducts();

            if (!db_products) {
                this.products = [];
            }

            this.products = db_products.map((product: Zproduct, index: number) => {
                product.ImageUrl = (this.images && this.images[index]) ? this.images[index] : '';
                return product;
            });

            return this.products;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    // Reads the cart item from the button context and removes it from the cart
    onDelete(oEvent: any): void {
        const oButton  = oEvent.getSource();
        const oContext = oButton.getBindingContext("products");
        const oCartItem = oContext.getObject() as ICartItem;

        if (oCartItem) {
            this.cartserviceProcess.deleteFromCart(oCartItem);
        }
    }

    // Reads the product from the button context and adds it to the cart
    addToCard(oEvent: any): void {
        const oButton  = oEvent.getSource();
        const oContext = oButton.getBindingContext("products");
        const oProduct = oContext.getObject() as Zproduct;
        this.cartserviceProcess.addToCart(oProduct);
    }


    // Toggles the cart panel visibility in the UI model
    private toggleDisplay(): void {
        const oModel   = this.getView()?.getModel("ui") as JSONModel;
        const aVisible = oModel.getProperty("/isCartVisible");
        oModel.setProperty("/isCartVisible", !aVisible);
    }

    // Returns a stock label string based on the available quantity
    public formatStock(iInStock: number): string {
        return iInStock > 0 ? `En stock` : "Rupture";
    }

    // Returns the semantic state color for the stock indicator
    public getStockState(iInStock: number): string {
        return iInStock > 0 ? "Success" : "Error";
    }

    // Opens or closes the mobile menu popover and toggles the hamburger icon accordingly
    public async onHamburgerPress(oEvent: Event): Promise<void> {
        const oButton = oEvent.getSource() as Button;

        // Prevent multiple simultaneous load attempts
        if (this._bMenuLoading) return;

        if (!this._oMobileMenu) {
            this._bMenuLoading = true;
            try {
                // Lazy-load the mobile menu fragment on first open
                this._oMobileMenu = await Fragment.load({
                    name:       "com.kenne.orderapp.Fragments.MobileMenu",
                    controller: this
                }) as Popover;

                this.getView()?.addDependent(this._oMobileMenu);
            } finally {
                this._bMenuLoading = false;
            }
        }

        if (this._oMobileMenu.isOpen()) {
            this._oMobileMenu.close();
            oButton.setIcon("sap-icon://menu2");
        } else {
            this._oMobileMenu.openBy(oButton);
            oButton.setIcon("sap-icon://decline");
        }
    }
}